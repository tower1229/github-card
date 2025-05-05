import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shareLinks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 用户只能查看自己的分享链接
    if (session.user.id !== params.userId) {
      return NextResponse.json(
        { error: "You can only access your own share links" },
        { status: 403 }
      );
    }

    // 获取用户的所有分享链接
    const userShareLinks = await db
      .select()
      .from(shareLinks)
      .where(eq(shareLinks.userId, params.userId))
      .orderBy(desc(shareLinks.createdAt));

    return NextResponse.json(
      userShareLinks.map((link) => ({
        id: link.id,
        linkToken: link.linkToken,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        isActive: link.isActive,
        templateType: link.templateType,
      }))
    );
  } catch (error) {
    console.error("Error retrieving user share links:", error);
    return NextResponse.json(
      { error: "Failed to retrieve share links" },
      { status: 500 }
    );
  }
}
