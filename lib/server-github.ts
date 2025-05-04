"use server";

import { getGitHubUserData, getGitHubContributions } from "@/lib/github/api";
import { cache } from "react";

// This is a server action that can be called from client components but will execute server-side
// It leverages the existing caching mechanisms
export const getUserGitHubData = cache(async (username: string) => {
  try {
    // Get user data with caching already implemented
    const userData = await getGitHubUserData(username);
    // Get contributions data with caching already implemented
    const contributionsData = await getGitHubContributions(username);

    // Combine the data similar to the API response
    return {
      success: true,
      data: {
        ...userData,
        total_stars: contributionsData.contributionScore - userData.public_repos * 2,
        contributionScore: contributionsData.contributionScore,
        contribution_grade: contributionsData.contributionGrade,
        commits: contributionsData.commitCount,
        pull_requests: contributionsData.prCount,
        issues: contributionsData.issueCount,
        reviews: contributionsData.reviewCount,
        totalContributions: contributionsData.totalContributions,
      }
    };
  } catch (error) {
    console.error("Error in getUserGitHubData:", error);
    return {
      success: false,
      error: "Failed to fetch GitHub user data"
    };
  }
});
