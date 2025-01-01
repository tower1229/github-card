import { NextResponse } from "next/server";

type GitHubUserResponse = {
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
  // ... 其他可能需要的字段
};

type GitHubRepoResponse = {
  stargazers_count: number;
};

type GitHubContributionsResponse = {
  total_count: number;
};

function calculateContributionScore(
  userData: GitHubUserResponse,
  totalStars: number,
  commits: number,
  prs: number,
  issues: number,
  reviews: number
): number {
  const REPO_WEIGHT = 2;
  const STAR_WEIGHT = 1;
  const FOLLOWER_WEIGHT = 3;
  const COMMIT_WEIGHT = 0.1;
  const PR_WEIGHT = 5;
  const ISSUE_WEIGHT = 2;
  const REVIEW_WEIGHT = 3;

  return (
    userData.public_repos * REPO_WEIGHT +
    totalStars * STAR_WEIGHT +
    userData.followers * FOLLOWER_WEIGHT +
    commits * COMMIT_WEIGHT +
    prs * PR_WEIGHT +
    issues * ISSUE_WEIGHT +
    reviews * REVIEW_WEIGHT
  );
}

function getContributionGrade(score: number): string {
  if (score >= 2000) return "S+";
  if (score >= 1000) return "S";
  if (score >= 500) return "A";
  if (score >= 200) return "B";
  if (score >= 100) return "C";
  if (score >= 50) return "D";
  return "E";
}

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    };

    const userResponse = await fetch(
      `https://api.github.com/users/${username}`,
      { headers }
    );

    if (!userResponse.ok) {
      throw new Error(
        `GitHub API responded with status ${userResponse.status}`
      );
    }

    const userData: GitHubUserResponse = await userResponse.json();

    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      { headers }
    );

    if (!reposResponse.ok) {
      throw new Error(
        `GitHub API responded with status ${reposResponse.status}`
      );
    }

    const reposData: GitHubRepoResponse[] = await reposResponse.json();

    const commitsResponse = await fetch(
      `https://api.github.com/search/commits?q=author:${username}+author-date:>=${new Date(
        Date.now() - 365 * 24 * 60 * 60 * 1000
      ).toISOString()}`,
      { headers }
    );
    const commitsData: GitHubContributionsResponse =
      await commitsResponse.json();

    const prsResponse = await fetch(
      `https://api.github.com/search/issues?q=author:${username}+type:pr`,
      { headers }
    );
    const prsData: GitHubContributionsResponse = await prsResponse.json();

    const issuesResponse = await fetch(
      `https://api.github.com/search/issues?q=author:${username}+type:issue`,
      { headers }
    );
    const issuesData: GitHubContributionsResponse = await issuesResponse.json();

    const reviewsResponse = await fetch(
      `https://api.github.com/search/issues?q=reviewed-by:${username}+type:pr`,
      { headers }
    );
    const reviewsData: GitHubContributionsResponse =
      await reviewsResponse.json();

    const totalStars = reposData.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    );

    const contributionScore = calculateContributionScore(
      userData,
      totalStars,
      commitsData.total_count,
      prsData.total_count,
      issuesData.total_count,
      reviewsData.total_count
    );
    const contributionGrade = getContributionGrade(contributionScore);

    return NextResponse.json({
      success: true,
      data: {
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
        bio: userData.bio,
        blog: userData.blog,
        location: userData.location,
        twitter_username: userData.twitter_username,
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        created_at: userData.created_at,
        total_stars: totalStars,
        contribution_score: contributionScore,
        contribution_grade: contributionGrade,
        commits: commitsData.total_count,
        pull_requests: prsData.total_count,
        issues: issuesData.total_count,
        reviews: reviewsData.total_count,
      },
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
