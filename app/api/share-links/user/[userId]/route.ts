import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { shareLinks, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    // Get the authenticated user
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = params.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get the current user
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Security check: users can only see their own share links
    if (currentUser.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to view these share links" },
        { status: 403 }
      );
    }

    // Get all share links for the user
    const userShareLinks = await db.query.shareLinks.findMany({
      where: eq(shareLinks.userId, userId),
      orderBy: (shareLinks, { desc }) => [desc(shareLinks.createdAt)],
    });

    // Return the share links
    return NextResponse.json(
      userShareLinks.map((link) => ({
        id: link.id,
        linkToken: link.linkToken,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        isActive: link.isActive,
        isExpired: new Date() > link.expiresAt,
        shareUrl: `${process.env.NEXTAUTH_URL}/shared/${link.linkToken}`,
      }))
    );
  } catch (error) {
    console.error("Error retrieving user share links:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user share links" },
      { status: 500 }
    );
  }
}
