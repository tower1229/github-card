import { NextRequest, NextResponse } from "next/server";
import { getGitHubUserData, getGitHubContributions } from "@/lib/github/api";

// Define Edge-specific options to enable Edge caching
export const runtime = 'edge';
export const revalidate = 3600; // Revalidate every hour

type RouteParams = {
  params: Promise<{
    username: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteParams
): Promise<NextResponse> {
  const { username } = await context.params;

  try {
    // Get user data with caching already implemented
    const userData = await getGitHubUserData(username);
    // Get contributions data with caching already implemented
    const contributionsData = await getGitHubContributions(username);

    // Combine the data
    const userDataCombined = {
      ...userData,
      total_stars: contributionsData.contributionScore - userData.public_repos * 2,
      contributionScore: contributionsData.contributionScore,
      contribution_grade: contributionsData.contributionGrade,
      commits: contributionsData.commitCount,
      pull_requests: contributionsData.prCount,
      issues: contributionsData.issueCount,
      reviews: contributionsData.reviewCount,
      totalContributions: contributionsData.totalContributions,
    };

    return NextResponse.json({
      success: true,
      data: userDataCombined,
    });
  } catch (error) {
    console.error("Error fetching GitHub user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch GitHub user data",
      },
      { status: 500 }
    );
  }
}
