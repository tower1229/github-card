import { NextRequest, NextResponse } from "next/server";
import { updateUserContribution } from "@/lib/leaderboard";
import { withServerAuth } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  return withServerAuth(async (req, userId) => {
    try {
      // 获取请求数据
      const body = await req.json();

      // 验证必要参数
      if (!body.userId || typeof body.contributionScore !== "number") {
        return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
      }

      // 验证当前用户只能更新自己的贡献数据
      if (body.userId !== userId) {
        return NextResponse.json(
          { error: "无权操作其他用户的数据" },
          { status: 403 }
        );
      }

      // 确保贡献分数为整数以匹配数据库模式要求
      const contributionScoreInt = Math.round(body.contributionScore);
      
      // 更新用户贡献数据
      const result = await updateUserContribution(
        body.userId,
        contributionScoreInt
      );

      return NextResponse.json(result);
    } catch (error) {
      console.error("更新用户贡献数据出错:", error);
      return NextResponse.json(
        { error: "更新用户贡献数据失败" },
        { status: 500 }
      );
    }
  }, request);
}
