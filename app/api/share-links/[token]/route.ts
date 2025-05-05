import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shareLinks, userBehaviors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUserGitHubData } from "@/lib/server-github";

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
    const shareLinkResults = await db
      .select()
      .from(shareLinks)
      .where(eq(shareLinks.linkToken, token))
      .limit(1);

    const shareLink = shareLinkResults[0];

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

    // Fetch the GitHub data for the username associated with this share link
    const githubUsername = shareLink.githubUsername;
    const githubDataResult = await getUserGitHubData(githubUsername);

    if (!githubDataResult.success || !githubDataResult.data) {
      return NextResponse.json(
        {
          error: "Failed to fetch GitHub data",
          message: githubDataResult.error || "Unknown error",
        },
        { status: 502 }
      );
    }

    // Return the response with the GitHub data
    return NextResponse.json({
      cardData: githubDataResult.data,
      expiresAt: shareLink.expiresAt,
      templateType: shareLink.templateType,
    });
  } catch (error) {
    console.error("Error retrieving share link:", error);
    return NextResponse.json(
      { error: "Failed to retrieve share link" },
      { status: 500 }
    );
  }
}
