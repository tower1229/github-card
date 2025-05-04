import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { shareLinks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateUserContribution } from "@/lib/leaderboard";
import { withAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  return withAuth(async (req, userId) => {
    try {
      const body = await req.json();

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
          await updateUserContribution(userId, contributionCount);
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
          userId,
          linkToken: token,
          cardData: body.cardData,
          expiresAt,
          templateType: body.templateType || "contribute",
        })
        .returning();

      // 获取baseUrl，确保它包含协议
      const baseUrl = process.env.NEXTAUTH_URL || "";

      return NextResponse.json({
        shareUrl: `${baseUrl}/shared/${token}`,
        expiresAt,
      });
    } catch (error) {
      console.error("创建分享链接失败:", error);
      // 确保返回正确格式的错误响应
      return NextResponse.json(
        { error: "Internal Server Error", message: String(error) },
        {
          status: 500,
        }
      );
    }
  }, request);
}

export async function GET(request: NextRequest) {
  return withAuth(async (req, userId) => {
    try {
      // Get all share links for the user
      const userShareLinks = await db
        .select()
        .from(shareLinks)
        .where(eq(shareLinks.userId, userId))
        .orderBy(shareLinks.createdAt);

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
        { error: "Failed to retrieve share links", message: String(error) },
        { status: 500 }
      );
    }
  }, request);
}
