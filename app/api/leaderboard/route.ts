import { NextRequest, NextResponse } from "next/server";
import { cache } from "react";
import { getFullLeaderboard } from "@/lib/leaderboard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Cached function to get leaderboard data
const getCachedLeaderboardData = cache(
  async (limit: number = 20, page: number = 1, currentUserId?: string) => {
    return await getFullLeaderboard(limit, page, currentUserId);
  }
);

// Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    // Get current user
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // Get leaderboard data with caching
    const leaderboardData = await getCachedLeaderboardData(
      limit,
      page,
      currentUserId
    );

    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data", message: String(error) },
      { status: 500 }
    );
  }
}
