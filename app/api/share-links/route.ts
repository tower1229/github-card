import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { shareLinks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateUserContribution } from "@/lib/leaderboard";
import { withServerAuth } from "@/lib/server-auth";
import { getGitHubUserData, getGitHubContributions } from "@/lib/github/api";

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

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          {
            status: 404,
          }
        );
      }

      // Get GitHub username either from account or user name
      const githubAccount = user.accounts.find(
        (acc) => acc.provider === "github"
      );
      const username = githubAccount?.providerAccountId || user.name;

      if (!username) {
        return NextResponse.json(
          { error: "GitHub username not found" },
          {
            status: 404,
          }
        );
      }

      console.log("Fetching GitHub data for user:", username);

      // Fetch GitHub data from our server-side API
      let userData;
      let contributionsData;

      try {
        userData = await getGitHubUserData(username);
        contributionsData = await getGitHubContributions(username);
      } catch (error) {
        const githubError = error as { message?: string };
        console.error(
          `Error fetching GitHub data for ${username}:`,
          githubError
        );
        return NextResponse.json(
          {
            error: "GitHub data fetch failed",
            message: `Unable to fetch GitHub data: ${
              githubError.message || String(error)
            }`,
            username,
          },
          { status: 502 }
        );
      }

      // Create card data from fetched GitHub data
      const cardData = {
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
        followers: userData.followers,
        following: userData.following,
        public_repos: userData.public_repos,
        totalContributions: contributionsData.totalContributions,
        commitCount: contributionsData.commitCount,
        prCount: contributionsData.prCount,
        issueCount: contributionsData.issueCount,
        reviewCount: contributionsData.reviewCount,
        contributionScore: contributionsData.contributionScore,
        contributionGrade: contributionsData.contributionGrade,
      };

      // Update user contribution with data from GitHub
      try {
        await updateUserContribution(
          userId,
          contributionsData.contributionScore
        );
      } catch (updateError) {
        console.error("Failed to update user contribution score:", updateError);
        // Continue with share link creation even if updating the score fails
      }

      // Calculate expiration time (30 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
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
            cardData,
            expiresAt,
            templateType: body.templateType,
          })
          .returning();

        console.log("Database insertion successful, result:", result);
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
            error: "Database insertion failed",
            message: String(error),
            code: dbError.code || "UNKNOWN",
          },
          { status: 500 }
        );
      }

      // Get baseUrl
      const baseUrl = process.env.NEXTAUTH_URL || "";

      return NextResponse.json({
        shareUrl: `${baseUrl}/shared/${token}`,
        expiresAt,
      });
    } catch (error) {
      console.error("Creating share link failed:", error);
      // Ensure returning a properly formatted error response
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
  return withServerAuth(async (req: NextRequest, userId: string) => {
    try {
      // Get all share links for the user
      const userShareLinks = await db
        .select()
        .from(shareLinks)
        .where(eq(shareLinks.userId, userId))
        .orderBy(shareLinks.createdAt);

      // Get baseUrl
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
