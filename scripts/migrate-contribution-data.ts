import { db } from "@/lib/db";
import { contributionLeaderboard } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import "dotenv/config";

async function main() {
  console.log("开始迁移贡献数据...");

  // 获取所有分享链接
  const allShareLinks = await db.query.shareLinks.findMany({
    with: {
      user: true,
    },
  });

  console.log(`找到 ${allShareLinks.length} 个分享链接数据`);

  // 追踪迁移结果
  const stats = {
    processed: 0,
    success: 0,
    skipped: 0,
    failed: 0,
  };

  // 记录已处理的用户ID，避免重复
  const processedUserIds = new Set<string>();

  for (const shareLink of allShareLinks) {
    try {
      // 提取卡片数据中的贡献总数
      const cardData = shareLink.cardData as {
        contributions?: { total: number | string };
      };
      if (!cardData || !cardData.contributions) {
        stats.skipped++;
        continue;
      }

      const userId = shareLink.userId;
      const contributionCount =
        typeof cardData.contributions.total === "number"
          ? cardData.contributions.total
          : parseInt(cardData.contributions.total);

      // 如果已经处理过该用户，只保留贡献数最高的记录
      if (processedUserIds.has(userId)) {
        // 获取已有记录
        const existingEntry = await db.query.contributionLeaderboard.findFirst({
          where: eq(contributionLeaderboard.userId, userId),
        });

        // 如果新的贡献数更高，更新记录
        if (
          existingEntry &&
          existingEntry.contributionCount < contributionCount
        ) {
          await db
            .update(contributionLeaderboard)
            .set({
              contributionCount,
              lastUpdated: new Date(),
            })
            .where(eq(contributionLeaderboard.userId, userId));

          console.log(
            `更新用户 ${userId} 的贡献数: ${existingEntry.contributionCount} -> ${contributionCount}`
          );
        }
      } else {
        // 添加新记录
        await db.insert(contributionLeaderboard).values({
          userId,
          contributionCount,
          lastUpdated: new Date(),
        });

        processedUserIds.add(userId);
        stats.success++;
      }

      stats.processed++;
    } catch (error) {
      console.error(`处理分享链接 ${shareLink.id} 失败:`, error);
      stats.failed++;
    }
  }

  // 更新所有用户的排名
  console.log("更新用户排名...");

  const rankedUsers = await db
    .select({
      id: contributionLeaderboard.id,
    })
    .from(contributionLeaderboard)
    .orderBy(contributionLeaderboard.contributionCount);

  for (let i = 0; i < rankedUsers.length; i++) {
    await db
      .update(contributionLeaderboard)
      .set({ rank: rankedUsers.length - i })
      .where(eq(contributionLeaderboard.id, rankedUsers[i].id));
  }

  console.log("数据迁移完成!");
  console.log("统计信息:", stats);
  console.log(`已处理 ${processedUserIds.size} 个唯一用户`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("迁移失败:", err);
    process.exit(1);
  });
