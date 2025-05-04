import { NextRequest, NextResponse } from "next/server";
import { getFullLeaderboard } from "@/lib/leaderboard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 获取贡献排行榜数据
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // 获取当前用户
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // 获取排行榜数据
    const leaderboardData = await getFullLeaderboard(limit, currentUserId);

    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error("获取贡献排行榜数据出错:", error);
    return NextResponse.json({ error: "获取排行榜数据失败" }, { status: 500 });
  }
}
