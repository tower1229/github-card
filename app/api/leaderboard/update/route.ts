import { NextRequest, NextResponse } from "next/server";
import { withServerAuth } from "@/lib/server-auth";
import { db } from "@/lib/db";
import { getGitHubContributions } from "@/lib/github/api";
import { updateUserContribution } from "@/lib/leaderboard";

// Using Node.js runtime since we need dotenv which depends on Node.js modules
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return withServerAuth(async (req, userId) => {
    try {
      console.log("Updating contribution score for user ID:", userId);

      // Get user information from database
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
        with: {
          accounts: true,
        },
      });

      if (!user) {
        console.error("User not found in database");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      console.log("Found user:", {
        id: user.id,
        username: user.username,
        hasAccounts: user.accounts.length > 0,
      });

      // Extract GitHub username

      const username = user.username;

      if (!username) {
        console.error("No GitHub username found for user");
        return NextResponse.json(
          { error: "GitHub username not found" },
          { status: 404 }
        );
      }

      console.log("Using GitHub username for API calls:", username);
      console.log("GitHub token exists:", !!process.env.GITHUB_ACCESS_TOKEN);

      // Fetch latest contribution data from server-side API
      console.log("Fetching GitHub contributions data...");
      const contributionsData = await getGitHubContributions(username);
      console.log("GitHub contribution data:", {
        totalContributions: contributionsData.totalContributions,
        commitCount: contributionsData.commitCount,
        prCount: contributionsData.prCount,
        issueCount: contributionsData.issueCount,
        reviewCount: contributionsData.reviewCount,
        contributionScore: contributionsData.contributionScore,
        contributionGrade: contributionsData.contributionGrade,
      });

      const contributionScore = contributionsData.contributionScore;
      console.log("Final contribution score:", contributionScore);

      // Update user contribution data
      console.log("Updating user contribution in database...");
      const result = await updateUserContribution(userId, contributionScore);
      console.log("Update result:", result);

      return NextResponse.json({
        success: true,
        rank: result.rank,
        previousRank: result.previousRank,
        contributionScore,
      });
    } catch (error) {
      console.error("Error updating user contribution data:", error);
      return NextResponse.json(
        { error: "Failed to update contribution data", message: String(error) },
        { status: 500 }
      );
    }
  }, request);
}
