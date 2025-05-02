import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shareLinks, userBehaviors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json(
        { error: "Share link token is required" },
        { status: 400 }
      );
    }

    // Get the share link
    const shareLink = await db.query.shareLinks.findFirst({
      where: eq(shareLinks.linkToken, token),
    });

    if (!shareLink) {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 }
      );
    }

    // Check if link is active and not expired
    const now = new Date();
    if (!shareLink.isActive || now > shareLink.expiresAt) {
      // Update the link to inactive if it's expired
      if (shareLink.isActive && now > shareLink.expiresAt) {
        await db
          .update(shareLinks)
          .set({ isActive: false })
          .where(eq(shareLinks.id, shareLink.id));
      }

      return NextResponse.json(
        { error: "Share link has expired or is inactive" },
        { status: 410 }
      );
    }

    // Log the view behavior
    await db.insert(userBehaviors).values({
      userId: shareLink.userId,
      actionType: "view_shared_link",
      actionData: { linkId: shareLink.id },
      performedAt: new Date(),
    });

    // Return the card data
    return NextResponse.json({
      cardData: shareLink.cardData,
      expiresAt: shareLink.expiresAt,
    });
  } catch (error) {
    console.error("Error retrieving share link:", error);
    return NextResponse.json(
      { error: "Failed to retrieve share link" },
      { status: 500 }
    );
  }
}
