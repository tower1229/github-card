import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { shareLinks, userBehaviors, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getExpirationDate } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    if (!body.cardData) {
      return NextResponse.json(
        { error: "Card data is required" },
        { status: 400 }
      );
    }

    // Get the user from our database
    const userEmail = session.user.email;
    const user = await db.query.users.findFirst({
      where: eq(users.email, userEmail),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Generate a unique token for the share link
    const linkToken = uuidv4();
    const expiresAt = getExpirationDate(); // 3 days from now

    // Create the share link record
    const newShareLink = await db
      .insert(shareLinks)
      .values({
        userId: user.id,
        linkToken,
        cardData: body.cardData,
        expiresAt,
        isActive: true,
      })
      .returning();

    // Log the behavior
    await db.insert(userBehaviors).values({
      userId: user.id,
      actionType: "generate_link",
      actionData: { linkId: newShareLink[0].id },
      performedAt: new Date(),
    });

    // Return the share link data
    return NextResponse.json({
      linkToken,
      expiresAt,
      shareUrl: `${process.env.NEXTAUTH_URL}/shared/${linkToken}`,
    });
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get the authenticated user
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
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

    // Return the share links
    return NextResponse.json(
      userShareLinks.map((link) => ({
        id: link.id,
        linkToken: link.linkToken,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        isActive: link.isActive,
        shareUrl: `${process.env.NEXTAUTH_URL}/shared/${link.linkToken}`,
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
