import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

// 定义错误接口
interface DatabaseError extends Error {
  message: string;
  code?: string;
}

async function resetDatabase() {
  console.log("开始重置数据库...");

  try {
    // 删除所有表
    console.log("删除现有表...");
    await db.execute(sql`
      DO $$ 
      DECLARE
          _table text;
      BEGIN
          FOR _table IN 
              SELECT tablename FROM pg_tables WHERE schemaname = 'public'
          LOOP
              EXECUTE 'DROP TABLE IF EXISTS "' || _table || '" CASCADE';
          END LOOP;
      END $$;
    `);

    console.log("数据库表已删除，准备手动执行迁移...");

    // 手动执行所有迁移
    const migrationsDir = path.join(process.cwd(), "drizzle");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`找到 ${migrationFiles.length} 个迁移文件，开始执行...`);

    for (const migrationFile of migrationFiles) {
      console.log(`正在执行迁移: ${migrationFile}`);
      const migrationContent = fs.readFileSync(
        path.join(migrationsDir, migrationFile),
        "utf8"
      );

      // 将迁移文件内容分割成单独的语句
      const statements = migrationContent.split("--> statement-breakpoint");

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await db.execute(sql.raw(statement.trim()));
          } catch (error: unknown) {
            const dbError = error as DatabaseError;
            console.warn(
              `警告: 执行语句时出错: ${dbError.message || "未知错误"}`
            );
            console.warn(`尝试继续执行其他语句...`);
          }
        }
      }
    }

    console.log("数据库已成功重置并应用迁移！");
  } catch (error: unknown) {
    const dbError = error as DatabaseError;
    console.error("重置数据库时出错:", dbError.message || String(error));
    process.exit(1);
  }
}

resetDatabase()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    const dbError = err as DatabaseError;
    console.error("执行脚本时出错:", dbError.message || String(err));
    process.exit(1);
  });
