import { NextResponse } from "next/server";
import { refreshLeaderboard } from "@/lib/leaderboard";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    // 验证用户是否已登录
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 刷新排行榜数据
    const result = await refreshLeaderboard();

    // 重新验证排行榜页面数据
    revalidatePath("/leaderboard");

    return NextResponse.json(result);
  } catch (error) {
    console.error("刷新排行榜数据出错:", error);
    return NextResponse.json({ error: "刷新排行榜数据失败" }, { status: 500 });
  }
}
