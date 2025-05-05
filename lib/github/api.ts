import { cache } from "react";
import { githubCacheManager, githubCacheMetrics } from "./github-cache";
import { GitHubData } from "@/lib/types";

// Type definitions for GitHub API responses
interface GitHubUserResponse {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
  blog: string;
  location: string;
  twitter_username: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GitHubRepoResponse {
  stargazers_count: number;
}

interface GitHubContributionsResponse {
  total_count: number;
}

interface GitHubUserData {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  blog: string;
  location: string;
  twitter_username: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

type GitHubContributionsData = Pick<
  GitHubData,
  | "total_stars"
  | "contributionScore"
  | "contribution_grade"
  | "commits"
  | "pull_requests"
  | "public_repos"
  | "followers"
  | "following"
  | "issues"
  | "reviews"
>;

// Cache GitHub API requests, valid for 1 hour
export const getGitHubUserData = cache(
  async (username: string): Promise<GitHubUserData> => {
    const cacheKey = `github:user:${username}`;

    try {
      // Check in-memory cache
      const cachedData = await githubCacheManager.get<GitHubUserData>(cacheKey);
      if (cachedData) {
        githubCacheMetrics.hits += 1;
        return cachedData;
      }

      githubCacheMetrics.misses += 1;

      // Fetch GitHub user data from API
      const userData = await fetchGitHubUserData(username);

      // Store in cache for 1 hour
      await githubCacheManager.set(cacheKey, userData, 60 * 60 * 1000);

      return userData;
    } catch (error) {
      console.error(`Error in getGitHubUserData for ${username}:`, error);
      // Return default data instead of throwing
      return {
        login: username,
        name: username,
        avatar_url: "https://github.com/identicons/avatar.png",
        bio: "",
        blog: "",
        location: "",
        twitter_username: "",
        public_repos: 0,
        followers: 0,
        following: 0,
        created_at: new Date().toISOString(),
      };
    }
  }
);

// Get user contributions data
export const getGitHubContributions = cache(
  async (username: string): Promise<GitHubContributionsData> => {
    const cacheKey = `github:contributions:${username}`;
    try {
      // Check in-memory cache
      const cachedData = await githubCacheManager.get<GitHubContributionsData>(
        cacheKey
      );
      if (cachedData) {
        githubCacheMetrics.hits += 1;
        return cachedData;
      }

      githubCacheMetrics.misses += 1;

      // Fetch contributions data from API
      const contributionsData = await fetchGitHubContributions(username);

      // Store in cache for 1 hour
      await githubCacheManager.set(cacheKey, contributionsData, 60 * 60 * 1000);

      return contributionsData;
    } catch (error) {
      console.error(`Error in getGitHubContributions for ${username}:`, error);
      // Return default data instead of throwing
      return {
        commits: 0,
        pull_requests: 0,
        total_stars: 0,
        contributionScore: 0,
        contribution_grade: "F",
        public_repos: 0,
        followers: 0,
        following: 0,
        issues: 0,
        reviews: 0,
      };
    }
  }
);

// Actual GitHub API request functions
async function fetchGitHubUserData(username: string): Promise<GitHubUserData> {
  try {
    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    };

    const userResponse = await fetch(
      `https://api.github.com/users/${username}`,
      {
        headers,
        next: { revalidate: 86400 },
      }
    );

    if (!userResponse.ok) {
      // For 404 errors, provide default data instead of throwing
      if (userResponse.status === 404) {
        console.warn(`GitHub user ${username} not found, using default data`);
        return {
          login: username,
          name: username,
          avatar_url: "https://github.com/identicons/avatar.png", // Default GitHub identicon
          bio: "",
          blog: "",
          location: "",
          twitter_username: "",
          public_repos: 0,
          followers: 0,
          following: 0,
          created_at: new Date().toISOString(),
        };
      }

      throw new Error(
        `GitHub API responded with status ${userResponse.status}`
      );
    }

    const userData: GitHubUserResponse = await userResponse.json();

    return {
      login: userData.login,
      name: userData.name || userData.login,
      avatar_url: userData.avatar_url,
      bio: userData.bio,
      blog: userData.blog,
      location: userData.location,
      twitter_username: userData.twitter_username,
      public_repos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      created_at: userData.created_at,
    };
  } catch (error) {
    console.error(`Error fetching GitHub user data for ${username}:`, error);
    throw error;
  }
}

async function fetchGitHubContributions(
  username: string
): Promise<GitHubContributionsData> {
  try {
    console.log(`Starting GitHub contributions fetch for user: ${username}`);

    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    };

    console.log("Using GitHub API headers:", {
      hasAuthToken: !!process.env.GITHUB_ACCESS_TOKEN,
      accept: headers.Accept,
    });

    // Get user repos to calculate stars
    const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100`;
    console.log("Fetching repositories URL:", reposUrl);

    const reposResponse = await fetch(reposUrl, {
      headers,
      next: { revalidate: 86400 },
    });

    console.log("Repos API response status:", reposResponse.status);

    if (!reposResponse.ok) {
      // If user doesn't exist, return default contribution data
      if (reposResponse.status === 404) {
        console.warn(
          `GitHub user ${username} not found, using default contribution data`
        );
        return {
          public_repos: 0,
          followers: 0,
          commits: 0,
          pull_requests: 0,
          total_stars: 0,
          contributionScore: 0,
          contribution_grade: "F",
          following: 0,
          issues: 0,
          reviews: 0,
        };
      }

      const errorText = await reposResponse.text();
      console.error("GitHub API error response:", errorText);

      throw new Error(
        `GitHub API responded with status ${reposResponse.status}: ${errorText}`
      );
    }

    const reposData: GitHubRepoResponse[] = await reposResponse.json();
    console.log(`Retrieved ${reposData.length} repositories`);

    // Get commits by user in the last year
    const startDate = new Date(
      Date.now() - 365 * 24 * 60 * 60 * 1000
    ).toISOString();
    const commitsUrl = `https://api.github.com/search/commits?q=author:${username}+author-date:>=${startDate}`;
    console.log("Fetching commits URL:", commitsUrl);

    const commitsResponse = await fetch(commitsUrl, {
      headers,
      next: { revalidate: 86400 },
    });
    console.log("Commits API response status:", commitsResponse.status);

    if (!commitsResponse.ok) {
      console.warn(`Failed to fetch commits: ${commitsResponse.status}`);
      console.log("Using fallback of 0 commits");
    }

    const commitsData: GitHubContributionsResponse = commitsResponse.ok
      ? await commitsResponse.json()
      : { total_count: 0 };

    console.log("Commits count:", commitsData.total_count);

    // Get pull requests created by user
    const prsUrl = `https://api.github.com/search/issues?q=author:${username}+type:pr`;
    console.log("Fetching PRs URL:", prsUrl);

    const prsResponse = await fetch(prsUrl, {
      headers,
      next: { revalidate: 86400 },
    });
    console.log("PRs API response status:", prsResponse.status);

    if (!prsResponse.ok) {
      console.warn(`Failed to fetch PRs: ${prsResponse.status}`);
      console.log("Using fallback of 0 PRs");
    }

    const prsData: GitHubContributionsResponse = prsResponse.ok
      ? await prsResponse.json()
      : { total_count: 0 };

    console.log("PRs count:", prsData.total_count);

    // Get issues created by user
    const issuesUrl = `https://api.github.com/search/issues?q=author:${username}+type:issue`;
    console.log("Fetching issues URL:", issuesUrl);

    const issuesResponse = await fetch(issuesUrl, {
      headers,
      next: { revalidate: 86400 },
    });
    console.log("Issues API response status:", issuesResponse.status);

    if (!issuesResponse.ok) {
      console.warn(`Failed to fetch issues: ${issuesResponse.status}`);
      console.log("Using fallback of 0 issues");
    }

    const issuesData: GitHubContributionsResponse = issuesResponse.ok
      ? await issuesResponse.json()
      : { total_count: 0 };

    console.log("Issues count:", issuesData.total_count);

    // Get PRs reviewed by user
    const reviewsUrl = `https://api.github.com/search/issues?q=reviewed-by:${username}+type:pr`;
    console.log("Fetching PR reviews URL:", reviewsUrl);

    const reviewsResponse = await fetch(reviewsUrl, {
      headers,
      next: { revalidate: 86400 },
    });
    console.log("Reviews API response status:", reviewsResponse.status);

    if (!reviewsResponse.ok) {
      console.warn(`Failed to fetch reviews: ${reviewsResponse.status}`);
      console.log("Using fallback of 0 reviews");
    }

    const reviewsData: GitHubContributionsResponse = reviewsResponse.ok
      ? await reviewsResponse.json()
      : { total_count: 0 };

    console.log("Reviews count:", reviewsData.total_count);

    // Get user data to retrieve followers
    const userUrl = `https://api.github.com/users/${username}`;
    console.log("Fetching user data URL:", userUrl);

    const userResponse = await fetch(userUrl, {
      headers,
      next: { revalidate: 86400 },
    });
    console.log("User API response status:", userResponse.status);

    let followers = 0;
    let following = 0;
    let created_at = new Date().toISOString();

    if (userResponse.ok) {
      const userData: GitHubUserResponse = await userResponse.json();
      followers = userData.followers;
      following = userData.following;
      created_at = userData.created_at;
      console.log("Followers count:", followers);
      console.log("Following count:", following);
      console.log("Account created at:", created_at);
    } else {
      console.warn(`Failed to fetch user data: ${userResponse.status}`);
      console.log("Using fallback of 0 followers and following");
    }

    // Calculate total stars from user's repos
    const totalStars = reposData.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    );
    console.log("Total stars:", totalStars);

    // Calculate contribution score
    const contributionScore = calculateContributionScore(
      totalStars,
      commitsData.total_count,
      prsData.total_count,
      issuesData.total_count,
      reviewsData.total_count,
      followers,
      following,
      reposData.length,
      created_at
    );

    console.log("Final GitHub contribution data:", {
      totalContributions: commitsData.total_count,
      commitCount: commitsData.total_count,
      prCount: prsData.total_count,
      issueCount: issuesData.total_count,
      reviewCount: reviewsData.total_count,
      followers,
      following,
      public_repos: reposData.length,
      created_at,
      contributionScore,
      contributionGrade: getContributionGrade(contributionScore),
    });

    return {
      commits: commitsData.total_count,
      pull_requests: prsData.total_count,
      contributionScore,
      contribution_grade: getContributionGrade(contributionScore),
      total_stars: totalStars,
      public_repos: reposData.length,
      followers,
      following,
      issues: issuesData.total_count,
      reviews: reviewsData.total_count,
    };
  } catch (error) {
    console.error(
      `Error fetching GitHub contributions for ${username}:`,
      error
    );
    throw error;
  }
}

// Helper functions for calculating scores
function calculateContributionScore(
  stars: number,
  commits: number,
  prs: number,
  issues: number,
  reviews: number,
  followers: number,
  following: number,
  public_repos: number,
  created_at: string
): number {
  console.log("Calculating contribution score with inputs:", {
    stars,
    commits,
    prs,
    issues,
    reviews,
    followers,
    following,
    public_repos,
    created_at,
  });

  // Define median values and weights based on the reference implementation
  const COMMITS_MEDIAN = 250;
  const COMMITS_WEIGHT = 2;
  const PRS_MEDIAN = 50;
  const PRS_WEIGHT = 3;
  const ISSUES_MEDIAN = 25;
  const ISSUES_WEIGHT = 1;
  const REVIEWS_MEDIAN = 2;
  const REVIEWS_WEIGHT = 1;
  const STARS_MEDIAN = 50;
  const STARS_WEIGHT = 4;
  const FOLLOWERS_MEDIAN = 10;
  const FOLLOWERS_WEIGHT = 1;

  const TOTAL_WEIGHT =
    COMMITS_WEIGHT +
    PRS_WEIGHT +
    ISSUES_WEIGHT +
    REVIEWS_WEIGHT +
    STARS_WEIGHT +
    FOLLOWERS_WEIGHT;

  // Exponential CDF function: 1 - 2^(-x)
  const exponential_cdf = (x: number): number => 1 - Math.pow(2, -x);

  // Log normal CDF approximation: x / (1 + x)
  const log_normal_cdf = (x: number): number => x / (1 + x);

  // Calculate percentile rank (higher is better)
  const percentile =
    1 -
    (COMMITS_WEIGHT * exponential_cdf(commits / COMMITS_MEDIAN) +
      PRS_WEIGHT * exponential_cdf(prs / PRS_MEDIAN) +
      ISSUES_WEIGHT * exponential_cdf(issues / ISSUES_MEDIAN) +
      REVIEWS_WEIGHT * exponential_cdf(reviews / REVIEWS_MEDIAN) +
      STARS_WEIGHT * log_normal_cdf(stars / STARS_MEDIAN) +
      FOLLOWERS_WEIGHT * log_normal_cdf(followers / FOLLOWERS_MEDIAN)) /
      TOTAL_WEIGHT;

  // Convert percentile to score (0-100)
  const score = percentile * 100;

  console.log("Calculated contribution score:", score);
  return score;
}

function getContributionGrade(score: number): string {
  // Thresholds based on the reference implementation
  if (score <= 1) return "S";
  if (score <= 12.5) return "A+";
  if (score <= 25) return "A";
  if (score <= 37.5) return "A-";
  if (score <= 50) return "B+";
  if (score <= 62.5) return "B";
  if (score <= 75) return "B-";
  if (score <= 87.5) return "C+";
  return "C";
}
