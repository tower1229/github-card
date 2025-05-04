import { NextRequest, NextResponse } from "next/server";
import { updateUserContribution } from "@/lib/leaderboard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    // 验证用户是否已登录
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 获取请求数据
    const body = await request.json();

    // 验证必要参数
    if (!body.userId || typeof body.contributionCount !== "number") {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    // 验证当前用户只能更新自己的贡献数据
    if (body.userId !== session.user.id) {
      return NextResponse.json(
        { error: "无权操作其他用户的数据" },
        { status: 403 }
      );
    }

    // 更新用户贡献数据
    const result = await updateUserContribution(
      body.userId,
      body.contributionCount
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("更新用户贡献数据出错:", error);
    return NextResponse.json(
      { error: "更新用户贡献数据失败" },
      { status: 500 }
    );
  }
}
