import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { shareLinks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { withServerAuth } from "@/lib/server-auth";

// Constants
const SHARE_LINK_EXPIRATION_DAYS = 3;

export async function POST(request: NextRequest) {
  return withServerAuth(async (req: NextRequest, userId: string) => {
    try {
      console.log("Processing share link request for userId:", userId);

      let body;
      try {
        body = await req.json();
        console.log("Request body received:", JSON.stringify(body));
      } catch (parseError) {
        console.error("Failed to parse request body:", parseError);
        return NextResponse.json(
          {
            error: "Invalid request body",
            message: "Could not parse request JSON",
          },
          { status: 400 }
        );
      }

      if (!body.templateType) {
        return NextResponse.json(
          { error: "Template type is required" },
          {
            status: 400,
          }
        );
      }

      // Get the user from the database
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
        with: {
          accounts: true,
        },
      });

      if (!user || !user.username) {
        return NextResponse.json(
          { error: "User not found" },
          {
            status: 404,
          }
        );
      }

      // Check for existing active links directly from the database instead of using GET
      // This prevents potential infinite loops and duplicate requests
      try {
        const existingLinks = await db
          .select()
          .from(shareLinks)
          .where(
            and(
              eq(shareLinks.userId, userId),
              eq(shareLinks.templateType, body.templateType),
              eq(shareLinks.isActive, true)
            )
          )
          .orderBy(shareLinks.createdAt);

        // Filter for non-expired links
        const activeLinks = existingLinks.filter(
          (link) => new Date(link.expiresAt) > new Date()
        );

        if (activeLinks.length > 0) {
          const baseUrl = process.env.NEXTAUTH_URL || "";
          const token = activeLinks[0].linkToken;
          const expiresAt = activeLinks[0].expiresAt;
          return NextResponse.json({
            shareUrl: `${baseUrl}/shared/${token}`,
            expiresAt,
          });
        }
      } catch (error) {
        console.error("Error checking existing active links:", error);
        // Continue with creating a new link, don't return an error yet
      }

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + SHARE_LINK_EXPIRATION_DAYS);
      console.log("Expiration date set to:", expiresAt);

      // Generate a random token
      const token = uuidv4();
      console.log("Generated token:", token);

      try {
        console.log("Preparing to insert data into shareLinks table");
        console.log("Template type:", body.templateType);
        console.log("Data to be inserted: userId:", userId);

        const result = await db
          .insert(shareLinks)
          .values({
            userId,
            linkToken: token,
            githubUsername: user.username,
            expiresAt,
            templateType: body.templateType,
          })
          .returning();

        console.log("Database insertion successful, result:", result);

        if (!result || result.length === 0) {
          throw new Error("Database returned empty result after insertion");
        }

        // Get baseUrl
        const baseUrl = process.env.NEXTAUTH_URL || "";

        return NextResponse.json({
          shareUrl: `${baseUrl}/shared/${token}`,
          expiresAt,
        });
      } catch (error) {
        // Type assertion for the error object
        const dbError = error as { code?: string; stack?: string };

        console.error("Database insertion failed - detailed error:", dbError);

        if (dbError.stack) {
          console.error("Error stack:", dbError.stack);
        }

        // Check for specific error types
        if (dbError.code) {
          console.error("Database error code:", dbError.code);
        }

        return NextResponse.json(
          {
            error: "Failed to create share link",
            message: String(error),
            code: dbError.code || "UNKNOWN",
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Creating share link failed:", error);
      // Ensure returning a properly formatted error response
      return NextResponse.json(
        { error: "Failed to create share link", message: String(error) },
        {
          status: 500,
        }
      );
    }
  }, request);
}

export async function GET(request: NextRequest) {
  return withServerAuth(async (req: NextRequest, userId: string) => {
    const templateType = request.nextUrl.searchParams.get("templateType");
    try {
      if (!templateType) {
        return NextResponse.json(
          { error: "Template type is required" },
          { status: 400 }
        );
      }

      // Get all share links for the user
      const userShareLinks = await db
        .select()
        .from(shareLinks)
        .where(
          and(
            eq(shareLinks.userId, userId),
            eq(shareLinks.templateType, templateType)
          )
        )
        .orderBy(shareLinks.createdAt);

      // Get baseUrl
      const baseUrl = process.env.NEXTAUTH_URL || "";

      // Return the share links
      return NextResponse.json(
        userShareLinks.map((link) => ({
          id: link.id,
          linkToken: link.linkToken,
          githubUsername: link.githubUsername,
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
