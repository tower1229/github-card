export interface GitHubData {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  blog?: string;
  location?: string;
  twitter_username?: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  total_stars: number;
  contributionScore: number;
  contribution_grade: string;
  commits: number;
  pull_requests: number;
  issues: number;
  reviews: number;
}
