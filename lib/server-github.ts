"use server";

import { getGitHubUserData, getGitHubContributions } from "@/lib/github/api";
import { cache } from "react";
import { GitHubData } from "@/lib/types";
import { db } from "@/lib/db";
import { contributeData } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Helper function to check if data is fresh (less than 1 day old)
const isDataFresh = (lastUpdated: Date | number): boolean => {
  const oneDayInMs = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  const now = new Date();
  const lastUpdatedTime =
    lastUpdated instanceof Date ? lastUpdated.getTime() : lastUpdated * 1000; // 如果是Unix时间戳（秒），转换为毫秒
  const timeDiff = now.getTime() - lastUpdatedTime;
  return timeDiff < oneDayInMs;
};

// This is a server action that can be called from client components but will execute server-side
// It leverages the existing caching mechanisms
export const getUserGitHubData = cache(async (username: string) => {
  if (!username) {
    console.error("getUserGitHubData called with empty username");
    return {
      success: false,
      error: "Username is required",
    };
  }

  console.log(`Server action: getUserGitHubData for username ${username}`);

  try {
    // First, check if fresh data exists in the database
    const dbRecord = await db.query.contributeData.findFirst({
      where: eq(contributeData.username, username),
    });

    // If we have fresh data in the database, use it
    if (dbRecord && isDataFresh(dbRecord.lastUpdated)) {
      console.log(`Using fresh DB data for ${username}`);
      return {
        success: true,
        data: dbRecord.githubData as GitHubData,
      };
    }

    // If no fresh data in database, get user data and contributions from GitHub API
    console.log(
      `No fresh data found for ${username}, fetching from GitHub API`
    );
    const userData = await getGitHubUserData(username);
    const contributionsData = await getGitHubContributions(username);

    // Combine the data into a GitHubData object
    const githubData: GitHubData = {
      login: userData.login,
      name: userData.name,
      avatar_url: userData.avatar_url,
      bio: userData.bio || "",
      blog: userData.blog || "",
      location: userData.location || "",
      twitter_username: userData.twitter_username || null,
      public_repos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      created_at: userData.created_at,
      total_stars: contributionsData.total_stars,
      contributionScore: contributionsData.contributionScore,
      contribution_grade: contributionsData.contribution_grade,
      commits: contributionsData.commits,
      pull_requests: contributionsData.pull_requests,
      issues: contributionsData.issues,
      reviews: contributionsData.reviews,
    };

    // Store the data in the database for future use
    const now = Math.floor(Date.now() / 1000); // 使用Unix时间戳（秒）
    if (dbRecord) {
      // Update existing record
      await db
        .update(contributeData)
        .set({
          githubData,
          lastUpdated: now,
        })
        .where(eq(contributeData.username, username));
    } else {
      // Create new record
      await db.insert(contributeData).values({
        username,
        githubData,
        lastUpdated: now,
        createdAt: now,
      });
    }

    return {
      success: true,
      data: githubData,
    };
  } catch (error) {
    console.error(`Error in getUserGitHubData for ${username}:`, error);
    return {
      success: false,
      error: `Failed to fetch GitHub data for ${username}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
});
