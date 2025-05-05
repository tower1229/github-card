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

  // Define weights for each contribution type
  const STAR_WEIGHT = 1.5; // Stars indicate project quality and popularity
  const COMMIT_WEIGHT = 0.2; // Regular commits show consistent activity
  const PR_WEIGHT = 5; // PRs show collaborative work and contribution to other projects
  const ISSUE_WEIGHT = 1.5; // Issues show community engagement and problem identification
  const REVIEW_WEIGHT = 3; // Reviews show mentorship and quality control
  const FOLLOWER_WEIGHT = 1; // Followers indicate influence in the community
  const FOLLOWING_WEIGHT = 0.5; // Following shows engagement with other developers
  const REPO_WEIGHT = 2; // Public repos show range of interests and projects

  // Calculate account age in years (max 10 years for full credit)
  const accountCreationDate = new Date(created_at);
  const currentDate = new Date();
  const accountAgeInYears = Math.min(
    10,
    (currentDate.getTime() - accountCreationDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365)
  );
  const ACCOUNT_AGE_WEIGHT = 20; // Experience factor

  // Calculate repository quality score (stars per repository, but with diminishing returns)
  const repoQualityScore =
    public_repos > 0 ? Math.min(20, stars / public_repos) : 0;
  const REPO_QUALITY_WEIGHT = 10;

  // Calculate collaboration score (ratio of PRs to own repos, capped at 5)
  const collaborationScore = Math.min(
    5,
    public_repos > 0 ? prs / public_repos : 0
  );
  const COLLABORATION_WEIGHT = 15;

  // Calculate community impact (followers relative to account age, with diminishing returns)
  const followerImpactScore =
    accountAgeInYears > 0
      ? Math.min(50, followers / accountAgeInYears)
      : followers;
  const IMPACT_WEIGHT = 2;

  // Calculate activity level score (commits + PRs + issues + reviews in the last year)
  const activityScore = commits + prs * 5 + issues * 2 + reviews * 3;
  const ACTIVITY_WEIGHT = 0.5;

  // Calculate the final comprehensive score
  const score = Math.round(
    stars * STAR_WEIGHT +
      commits * COMMIT_WEIGHT +
      prs * PR_WEIGHT +
      issues * ISSUE_WEIGHT +
      reviews * REVIEW_WEIGHT +
      followers * FOLLOWER_WEIGHT +
      following * FOLLOWING_WEIGHT +
      public_repos * REPO_WEIGHT +
      accountAgeInYears * ACCOUNT_AGE_WEIGHT +
      repoQualityScore * REPO_QUALITY_WEIGHT +
      collaborationScore * COLLABORATION_WEIGHT +
      followerImpactScore * IMPACT_WEIGHT +
      activityScore * ACTIVITY_WEIGHT
  );

  console.log("Calculated contribution score:", score);
  return score;
}

function getContributionGrade(score: number): string {
  if (score >= 3000) return "S+";
  if (score >= 1500) return "S";
  if (score >= 800) return "A";
  if (score >= 400) return "B";
  if (score >= 200) return "C";
  if (score >= 100) return "D";
  return "E";
}
