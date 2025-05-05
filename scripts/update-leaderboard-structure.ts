import { migrateDatabase } from "@/lib/db/migrate-03-remove-contribution-leaderboard";

/**
 * 迁移脚本：更新排行榜数据结构
 * 删除 contribution_leaderboard 表，改为直接从 contribute_data 计算排行榜数据
 */
async function runMigration() {
  console.log("开始执行排行榜数据结构更新...");

  try {
    // 执行迁移
    const result = await migrateDatabase();

    if (result.success) {
      console.log("排行榜数据结构更新成功:", result.message);
    } else {
      console.error("排行榜数据结构更新失败:", result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("迁移过程中发生错误:", error);
    process.exit(1);
  }

  console.log("排行榜数据结构更新完成");
}

// 执行迁移
runMigration().catch((error) => {
  console.error("运行迁移脚本时发生错误:", error);
  process.exit(1);
});
