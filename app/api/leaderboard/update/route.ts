import { NextRequest, NextResponse } from "next/server";
import { withServerAuth } from "@/lib/server-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getGitHubContributions } from "@/lib/github/api";
import { updateUserContribution } from "@/lib/leaderboard";

export async function POST(request: NextRequest) {
  return withServerAuth(async (req, userId) => {
    try {
      // Get user information from database
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
        with: {
          accounts: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Extract GitHub username
      const githubAccount = user.accounts.find(
        (acc) => acc.provider === "github"
      );
      const username = githubAccount?.providerAccountId || user.name;

      if (!username) {
        return NextResponse.json(
          { error: "GitHub username not found" },
          { status: 404 }
        );
      }

      // Fetch latest contribution data from server-side API
      const contributionsData = await getGitHubContributions(username);
      const contributionScore = contributionsData.contributionScore;

      // Update user contribution data
      const result = await updateUserContribution(userId, contributionScore);

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
