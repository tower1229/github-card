import { db } from "@/lib/db";
import { contributeData, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { cache } from "react";
import { GitHubData } from "@/lib/types";

// 更新用户贡献数据 - 此方法将重定向到相应的贡献数据更新逻辑
export async function updateUserContribution(
  userId: string,
  contributionScore: number
) {
  try {
    console.log(
      `Updating contribution for user ${userId} with score:`,
      contributionScore
    );

    // Ensure contributionScore is a valid number
    if (typeof contributionScore !== "number" || isNaN(contributionScore)) {
      console.error("Invalid contribution score:", contributionScore);
      contributionScore = 0;
    }

    // 获取用户名
    const userResult = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userResult || !userResult.username) {
      console.error(`User ${userId} not found or no username available`);
      return {
        success: false,
        error: "用户不存在或没有用户名",
      };
    }

    const username = userResult.username;

    // 检查用户是否已存在于贡献数据表中
    const existingEntry = await db.query.contributeData.findFirst({
      where: eq(contributeData.username, username),
    });

    console.log("Existing contribution data entry:", existingEntry);

    if (existingEntry) {
      // 获取现有的 githubData
      const currentGithubData = existingEntry.githubData as GitHubData;

      // 更新 githubData 中的 contributionScore
      const updatedGithubData = {
        ...currentGithubData,
        contributionScore,
      };

      console.log(`Updating existing entry for user ${username}:`, {
        oldScore: currentGithubData.contributionScore,
        newScore: contributionScore,
      });

      // 更新记录
      await db
        .update(contributeData)
        .set({
          githubData: updatedGithubData,
          lastUpdated: Math.floor(Date.now() / 1000), // 转换为 Unix 时间戳（秒）
        })
        .where(eq(contributeData.username, username));

      console.log("Entry updated successfully");
    } else {
      // 如果没有找到现有记录，返回错误
      console.error(`No contribution data found for user ${username}`);
      return {
        success: false,
        error: "没有找到用户的贡献数据",
      };
    }

    // 返回用户的新排名
    let rank;
    try {
      rank = await getUserRank(userId);
      console.log(`User ${userId} new rank:`, rank);
    } catch (rankError) {
      console.error("获取用户排名失败:", rankError);
      rank = null;
    }

    return {
      success: true,
      rank,
      contributionScore,
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
    // 首先获取用户名
    const userResult = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userResult || !userResult.username) {
      console.error(`User ${userId} not found or no username available`);
      return null;
    }

    const username = userResult.username;

    // 构建一个排序的贡献数据列表
    const rankedUsers = await db
      .select({
        username: contributeData.username,
      })
      .from(contributeData)
      .orderBy(sql`(github_data->>'contributionScore')::float`);

    // 找到用户的排名
    const userRankIndex = rankedUsers.findIndex(
      (user) => user.username === username
    );

    // 如果找到了用户，返回排名（索引+1）
    return userRankIndex !== -1 ? userRankIndex + 1 : null;
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
          username: contributeData.username,
          displayName: users.displayName,
          userId: users.id,
          avatarUrl: users.avatarUrl,
          contributionScore: sql<number>`(${contributeData.githubData}->>'contributionScore')::float`,
          contributionGrade: sql<string>`(${contributeData.githubData}->>'contribution_grade')::text`,
        })
        .from(contributeData)
        .innerJoin(users, eq(contributeData.username, users.username))
        .orderBy(sql`(github_data->>'contributionScore')::float`)
        .limit(limit)
        .offset(offset);

      // 为结果添加排名
      const rankedResults = leaderboardData.map((item, index) => ({
        ...item,
        rank: offset + index + 1,
      }));

      // 获取总用户数
      const totalUsersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(contributeData);

      const totalUsers = totalUsersResult[0]?.count || 0;

      // 获取最后更新时间
      const lastUpdatedResult = await db
        .select({ lastUpdated: sql<string>`max(last_updated)` })
        .from(contributeData);

      const lastUpdated =
        lastUpdatedResult[0]?.lastUpdated || new Date().toISOString();

      return {
        leaderboard: rankedResults,
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
  page: number = 1,
  currentUserId?: string
) {
  try {
    // 获取排行榜数据
    const { leaderboard, totalUsers, lastUpdated } = await getLeaderboard(
      limit,
      page
    );

    // 如果提供了当前用户ID且该用户不在排行榜中，获取其排名
    let currentUser = undefined;

    if (currentUserId) {
      const userIds = leaderboard.map((item) => item.userId);

      if (!userIds.includes(currentUserId)) {
        // 获取用户排名
        const userRank = await getUserRank(currentUserId);

        if (userRank) {
          // 获取用户名
          const userResult = await db.query.users.findFirst({
            where: eq(users.id, currentUserId),
          });

          if (userResult && userResult.username) {
            // 获取用户的贡献数据
            const userData = await db
              .select({
                username: contributeData.username,
                displayName: users.displayName,
                userId: users.id,
                avatarUrl: users.avatarUrl,
                contributionScore: sql<number>`(${contributeData.githubData}->>'contributionScore')::float`,
                contributionGrade: sql<string>`(${contributeData.githubData}->>'contribution_grade')::text`,
              })
              .from(contributeData)
              .innerJoin(users, eq(contributeData.username, users.username))
              .where(eq(users.id, currentUserId))
              .limit(1);

            if (userData.length > 0) {
              // 创建带排名的用户数据
              currentUser = {
                ...userData[0],
                rank: userRank,
              };
            }
          }
        }
      }
    }

    return {
      leaderboard,
      currentUser,
      totalUsers,
      lastUpdated,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
    };
  } catch (error) {
    console.error("获取完整排行榜数据失败:", error);
    return {
      leaderboard: [],
      currentUser: undefined,
      totalUsers: 0,
      lastUpdated: new Date().toISOString(),
      currentPage: page,
      totalPages: 0,
      error: "获取完整排行榜数据失败",
    };
  }
}
