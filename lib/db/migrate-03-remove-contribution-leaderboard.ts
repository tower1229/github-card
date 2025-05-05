import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

/**
 * 迁移脚本：删除 contribution_leaderboard 表
 * 现在我们直接从 contribute_data 表计算所有排行榜数据
 */
export async function migrateDatabase() {
  try {
    console.log("开始数据库迁移：删除 contribution_leaderboard 表");

    // 检查表是否存在
    const checkTableResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contribution_leaderboard'
      );
    `);

    // 结果会是 [{ exists: true|false }] 格式
    const tableExists = checkTableResult.rows?.[0]?.exists === true;

    if (tableExists) {
      console.log("找到 contribution_leaderboard 表，准备删除...");

      // 删除外键约束（如果存在）
      await db.execute(sql`
        DO $$ 
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_type = 'FOREIGN KEY' 
            AND table_name = 'contribution_leaderboard'
          ) THEN
            ALTER TABLE "contribution_leaderboard" DROP CONSTRAINT IF EXISTS "contribution_leaderboard_userId_user_id_fk";
          END IF;
        END $$;
      `);

      // 删除表
      await db.execute(sql`DROP TABLE IF EXISTS "contribution_leaderboard";`);

      console.log("成功删除 contribution_leaderboard 表");
    } else {
      console.log("未找到 contribution_leaderboard 表，无需迁移");
    }

    console.log("数据库迁移完成：contribution_leaderboard 表已删除");
    return {
      success: true,
      message: "迁移成功完成",
    };
  } catch (error) {
    console.error("数据库迁移失败:", error);
    return {
      success: false,
      error: `迁移失败: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// 如果直接运行此文件，则执行迁移
if (require.main === module) {
  migrateDatabase()
    .then((result) => {
      console.log("迁移结果:", result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("迁移过程中发生错误:", error);
      process.exit(1);
    });
}
