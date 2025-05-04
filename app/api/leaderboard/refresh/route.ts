import { NextRequest, NextResponse } from "next/server";
import { refreshLeaderboard } from "@/lib/leaderboard";
import { revalidatePath } from "next/cache";
import { withServerAuth } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  return withServerAuth(async () => {
    try {
      // 刷新排行榜数据
      const result = await refreshLeaderboard();

      // 重新验证排行榜页面数据
      revalidatePath("/leaderboard");

      return NextResponse.json(result);
    } catch (error) {
      console.error("刷新排行榜数据出错:", error);
      return NextResponse.json(
        { error: "刷新排行榜数据失败" },
        { status: 500 }
      );
    }
  }, request);
}
