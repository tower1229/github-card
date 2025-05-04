import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { shareLinks, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateUserContribution } from "@/lib/leaderboard";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log("POST session:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      console.log("Unauthorized: Missing session.user.id");
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    if (!body.cardData) {
      return NextResponse.json(
        { error: "Card data is required" },
        {
          status: 400,
        }
      );
    }

    // 提取贡献数据并更新排行榜
    try {
      if (body.cardData?.contributions?.total) {
        const contributionCount =
          typeof body.cardData.contributions.total === "number"
            ? body.cardData.contributions.total
            : parseInt(body.cardData.contributions.total);

        // 更新贡献排行榜
        await updateUserContribution(session.user.id, contributionCount);
      }
    } catch (error) {
      console.error("更新贡献排行榜失败:", error);
      // 继续处理，不中断主流程
    }

    // 计算过期时间（30天后）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Generate a random token
    const token = uuidv4();

    await db
      .insert(shareLinks)
      .values({
        userId: session.user.id,
        linkToken: token,
        cardData: body.cardData,
        expiresAt,
        templateType: body.templateType || "contribute",
      })
      .returning();

    // 获取baseUrl，确保它包含协议
    const baseUrl = process.env.NEXTAUTH_URL;

    return NextResponse.json({
      shareUrl: `${baseUrl}/shared/${token}`,
      expiresAt,
    });
  } catch (error) {
    console.error("创建分享链接失败:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);

    console.log("GET session:", JSON.stringify(session, null, 2));

    if (!session || !session.user || !session.user.email) {
      console.log("Unauthorized: Missing session or session.user.email");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the user from our database
    const userEmail = session.user.email;
    const user = await db.query.users.findFirst({
      where: eq(users.email, userEmail),
    });

    if (!user) {
      console.log("User not found in database:", userEmail);
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Get all share links for the user
    const userShareLinks = await db.query.shareLinks.findMany({
      where: eq(shareLinks.userId, user.id),
      orderBy: (shareLinks, { desc }) => [desc(shareLinks.createdAt)],
    });

    // 获取baseUrl
    const baseUrl = process.env.NEXTAUTH_URL || "";

    // Return the share links
    return NextResponse.json(
      userShareLinks.map((link) => ({
        id: link.id,
        linkToken: link.linkToken,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        isActive: link.isActive,
        templateType: link.templateType,
        shareUrl: `${baseUrl}/shared/${link.linkToken}`,
      }))
    );
  } catch (error) {
    console.error("Error retrieving share links:", error);
    return NextResponse.json(
      { error: "Failed to retrieve share links" },
      { status: 500 }
    );
  }
}
