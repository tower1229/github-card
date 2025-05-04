import { db } from "@/lib/db";
import { contributionLeaderboard, users } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { cache } from "react";

// 更新用户贡献数据
export async function updateUserContribution(
  userId: string,
  contributionScore: number
) {
  try {
    // 检查用户是否已存在于排行榜中
    const existingEntry = await db.query.contributionLeaderboard.findFirst({
      where: eq(contributionLeaderboard.userId, userId),
    });

    if (existingEntry) {
      // 如果存在，更新贡献计数和最后更新时间
      await db
        .update(contributionLeaderboard)
        .set({
          contributionScore,
          lastUpdated: new Date(),
        })
        .where(eq(contributionLeaderboard.userId, userId));
    } else {
      // 如果不存在，创建新记录
      await db.insert(contributionLeaderboard).values({
        userId,
        contributionScore,
        lastUpdated: new Date(),
      });
    }

    try {
      // 更新后计算用户的新排名
      await refreshLeaderboard();
    } catch (refreshError) {
      console.error("刷新排行榜失败，但继续处理:", refreshError);
    }

    // 返回用户的新排名
    let rank;
    try {
      rank = await getUserRank(userId);
    } catch (rankError) {
      console.error("获取用户排名失败:", rankError);
      rank = null;
    }

    return {
      success: true,
      rank,
      previousRank: existingEntry?.rank,
    };
  } catch (error) {
    console.error("更新用户贡献数据失败:", error);
    return {
      success: false,
      error: "更新用户贡献数据失败",
    };
  }
}

// 获取用户排名
export async function getUserRank(userId: string): Promise<number | null> {
  try {
    const result = await db
      .select({
        rank: contributionLeaderboard.rank,
      })
      .from(contributionLeaderboard)
      .where(eq(contributionLeaderboard.userId, userId))
      .limit(1);

    return result.length > 0 ? result[0].rank : null;
  } catch (error) {
    console.error("获取用户排名失败:", error);
    return null;
  }
}

// 获取排行榜数据，使用React的cache函数缓存结果
export const getLeaderboard = cache(
  async (limit: number = 20, page: number = 1) => {
    try {
      // 计算偏移量
      const offset = (page - 1) * limit;

      // 查询排行榜数据
      const leaderboardData = await db
        .select({
          rank: contributionLeaderboard.rank,
          userId: contributionLeaderboard.userId,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          contributionScore: contributionLeaderboard.contributionScore,
        })
        .from(contributionLeaderboard)
        .innerJoin(users, eq(contributionLeaderboard.userId, users.id))
        .orderBy(desc(contributionLeaderboard.contributionScore))
        .limit(limit)
        .offset(offset);

      // 获取总用户数
      const totalUsersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(contributionLeaderboard);

      const totalUsers = totalUsersResult[0]?.count || 0;

      // 获取最后更新时间
      const lastUpdatedResult = await db
        .select({ lastUpdated: sql<string>`max(last_updated)` })
        .from(contributionLeaderboard);

      const lastUpdated =
        lastUpdatedResult[0]?.lastUpdated || new Date().toISOString();

      return {
        leaderboard: leaderboardData,
        totalUsers,
        lastUpdated,
      };
    } catch (error) {
      console.error("获取排行榜数据失败:", error);
      return {
        leaderboard: [],
        totalUsers: 0,
        lastUpdated: new Date().toISOString(),
        error: "获取排行榜数据失败",
      };
    }
  }
);

// 获取完整的排行榜数据，包括当前用户信息
export async function getFullLeaderboard(
  limit: number = 20,
  currentUserId?: string
) {
  try {
    // 获取排行榜数据
    const { leaderboard, totalUsers, lastUpdated } = await getLeaderboard(
      limit
    );

    // 如果提供了当前用户ID且该用户不在排行榜中，获取其排名
    let currentUser = undefined;

    if (currentUserId) {
      const userIds = leaderboard.map((item) => item.userId);

      if (!userIds.includes(currentUserId)) {
        const userRank = await getUserRank(currentUserId);

        if (userRank) {
          const userData = await db
            .select({
              rank: contributionLeaderboard.rank,
              userId: contributionLeaderboard.userId,
              username: users.username,
              displayName: users.displayName,
              avatarUrl: users.avatarUrl,
              contributionScore: contributionLeaderboard.contributionScore,
            })
            .from(contributionLeaderboard)
            .innerJoin(users, eq(contributionLeaderboard.userId, users.id))
            .where(eq(contributionLeaderboard.userId, currentUserId))
            .limit(1);

          if (userData.length > 0) {
            currentUser = userData[0];
          }
        }
      }
    }

    return {
      leaderboard,
      currentUser,
      totalUsers,
      lastUpdated,
    };
  } catch (error) {
    console.error("获取完整排行榜数据失败:", error);
    return {
      leaderboard: [],
      currentUser: undefined,
      totalUsers: 0,
      lastUpdated: new Date().toISOString(),
      error: "获取完整排行榜数据失败",
    };
  }
}

// 刷新排行榜数据，重新计算所有用户排名
export async function refreshLeaderboard() {
  try {
    // 首先获取按贡献数排序的所有用户
    const rankedUsers = await db
      .select({
        id: contributionLeaderboard.id,
      })
      .from(contributionLeaderboard)
      .orderBy(desc(contributionLeaderboard.contributionScore));

    // 如果没有用户，直接返回
    if (rankedUsers.length === 0) {
      return {
        success: true,
        updatedAt: new Date().toISOString(),
        affectedRows: 0,
      };
    }

    // 使用批量更新而不是一个一个更新
    try {
      // 批量更新每个用户的排名
      for (let i = 0; i < rankedUsers.length; i++) {
        await db
          .update(contributionLeaderboard)
          .set({ rank: i + 1 })
          .where(eq(contributionLeaderboard.id, rankedUsers[i].id));
      }
    } catch (updateError) {
      console.error("更新排名失败:", updateError);
      throw updateError;
    }

    return {
      success: true,
      updatedAt: new Date().toISOString(),
      affectedRows: rankedUsers.length,
    };
  } catch (error) {
    console.error("刷新排行榜数据失败:", error);
    return {
      success: false,
      error: "刷新排行榜数据失败",
    };
  }
}
