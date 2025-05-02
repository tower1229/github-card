import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

// Temporary fix script to update database schema for next-auth compatibility

// 定义错误接口
interface DatabaseError extends Error {
  message: string;
  code?: string;
}

async function resetDatabase() {
  console.log("开始重置数据库...");

  try {
    // 检查数据库表结构
    const tableInfo = await db.execute(
      sql`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public';`
    );
    console.log("Current table structure:", tableInfo.rows);

    // 修复emailVerified列名
    await db.execute(sql`
      DO $$
      BEGIN
          -- 检查email_verified存在但emailVerified不存在的情况
          IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'user'
              AND column_name = 'email_verified'
          ) AND NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'user'
              AND column_name = 'emailVerified'
          ) THEN
              -- 重命名列
              ALTER TABLE "user" RENAME COLUMN "email_verified" TO "emailVerified";
          END IF;
      END $$;
    `);

    // 修复account表中的providerAccountId列
    await db.execute(sql`
      DO $$
      BEGIN
          -- Check if provider_account_id exists but providerAccountId doesn't
          IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'account'
              AND column_name = 'provider_account_id'
          ) AND NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'account'
              AND column_name = 'providerAccountId'
          ) THEN
              -- Rename the column
              ALTER TABLE "account" RENAME COLUMN "provider_account_id" TO "providerAccountId";
          END IF;
      END $$;
    `);

    // 检查account表中的userId列
    await db.execute(sql`
      DO $$
      BEGIN
          -- Check if the old column exists but the new one doesn't
          IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'account'
              AND column_name = 'user_id'
          ) AND NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'account'
              AND column_name = 'userId'
          ) THEN
              -- Add new userId column
              ALTER TABLE "account" ADD COLUMN "userId" uuid;
              
              -- Copy data from old column to new column
              UPDATE "account" SET "userId" = "user_id";
              
              -- Make it not null after data is copied
              ALTER TABLE "account" ALTER COLUMN "userId" SET NOT NULL;
              
              -- Add foreign key constraint
              ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" 
              FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade;
              
              -- Drop the old column
              ALTER TABLE "account" DROP COLUMN "user_id";
          END IF;
      END $$;
    `);

    // 修复session表中的userId列
    await db.execute(sql`
      DO $$
      BEGIN
          IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'session'
              AND column_name = 'user_id'
          ) AND NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'session'
              AND column_name = 'userId'
          ) THEN
              ALTER TABLE "session" ADD COLUMN "userId" uuid;
              UPDATE "session" SET "userId" = "user_id";
              ALTER TABLE "session" ALTER COLUMN "userId" SET NOT NULL;
              ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" 
              FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade;
              ALTER TABLE "session" DROP COLUMN "user_id";
          END IF;
      END $$;
    `);

    // 修复share_links表中的userId列
    await db.execute(sql`
      DO $$
      BEGIN
          IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'share_links'
              AND column_name = 'user_id'
          ) AND NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'share_links'
              AND column_name = 'userId'
          ) THEN
              ALTER TABLE "share_links" ADD COLUMN "userId" uuid;
              UPDATE "share_links" SET "userId" = "user_id";
              ALTER TABLE "share_links" ALTER COLUMN "userId" SET NOT NULL;
              ALTER TABLE "share_links" ADD CONSTRAINT "share_links_userId_user_id_fk" 
              FOREIGN KEY ("userId") REFERENCES "user"("id");
              ALTER TABLE "share_links" DROP COLUMN "user_id";
          END IF;
      END $$;
    `);

    // 修复user_behaviors表中的userId列
    await db.execute(sql`
      DO $$
      BEGIN
          IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'user_behaviors'
              AND column_name = 'user_id'
          ) AND NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'user_behaviors'
              AND column_name = 'userId'
          ) THEN
              ALTER TABLE "user_behaviors" ADD COLUMN "userId" uuid;
              UPDATE "user_behaviors" SET "userId" = "user_id";
              ALTER TABLE "user_behaviors" ALTER COLUMN "userId" SET NOT NULL;
              ALTER TABLE "user_behaviors" ADD CONSTRAINT "user_behaviors_userId_user_id_fk" 
              FOREIGN KEY ("userId") REFERENCES "user"("id");
              ALTER TABLE "user_behaviors" DROP COLUMN "user_id";
          END IF;
      END $$;
    `);

    // 输出最终的表结构
    const finalTableInfo = await db.execute(
      sql`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public';`
    );
    console.log("Updated table structure:", finalTableInfo.rows);

    console.log("Database schema fixes completed successfully!");
  } catch (error: unknown) {
    const dbError = error as DatabaseError;
    console.error(
      "Error fixing database schema:",
      dbError.message || String(error)
    );
    process.exit(1);
  }
}

resetDatabase()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    const dbError = err as DatabaseError;
    console.error("Error running schema fix:", dbError.message || String(err));
    process.exit(1);
  });
