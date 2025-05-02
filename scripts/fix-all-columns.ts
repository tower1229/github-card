import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// 定义错误接口
interface DatabaseError extends Error {
  message: string;
  code?: string;
}

async function fixAllColumns() {
  console.log("开始全面修复数据库列名...");

  try {
    // 输出当前表结构
    const tableInfo = await db.execute(
      sql`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public';`
    );
    console.log("当前数据库结构:", tableInfo.rows);

    // 修复user表的列名
    await db.execute(sql`
      DO $$
      BEGIN
          -- email_verified 转换为 emailVerified
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
              ALTER TABLE "user" RENAME COLUMN "email_verified" TO "emailVerified";
              RAISE NOTICE 'Renamed user.email_verified to user.emailVerified';
          END IF;
      END $$;
    `);

    // 修复session表的列名
    await db.execute(sql`
      DO $$
      BEGIN
          -- session_token 转换为 sessionToken
          IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'session'
              AND column_name = 'session_token'
          ) AND NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'session'
              AND column_name = 'sessionToken'
          ) THEN
              ALTER TABLE "session" RENAME COLUMN "session_token" TO "sessionToken";
              RAISE NOTICE 'Renamed session.session_token to session.sessionToken';
          END IF;
      END $$;
    `);

    // 修复account表的列名
    await db.execute(sql`
      DO $$
      BEGIN
          -- provider_account_id 转换为 providerAccountId
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
              ALTER TABLE "account" RENAME COLUMN "provider_account_id" TO "providerAccountId";
              RAISE NOTICE 'Renamed account.provider_account_id to account.providerAccountId';
          END IF;
      END $$;
    `);

    // 修复account表的userId列
    await db.execute(sql`
      DO $$
      BEGIN
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
              ALTER TABLE "account" ADD COLUMN "userId" uuid;
              UPDATE "account" SET "userId" = "user_id";
              ALTER TABLE "account" ALTER COLUMN "userId" SET NOT NULL;
              ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" 
              FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;
              ALTER TABLE "account" DROP COLUMN "user_id";
              RAISE NOTICE 'Replaced account.user_id with account.userId';
          END IF;
      END $$;
    `);

    // 修复session表的userId列
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
              FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;
              ALTER TABLE "session" DROP COLUMN "user_id";
              RAISE NOTICE 'Replaced session.user_id with session.userId';
          END IF;
      END $$;
    `);

    // 修复share_links表的userId列
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
              RAISE NOTICE 'Replaced share_links.user_id with share_links.userId';
          END IF;
      END $$;
    `);

    // 修复user_behaviors表的userId列
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
              RAISE NOTICE 'Replaced user_behaviors.user_id with user_behaviors.userId';
          END IF;
      END $$;
    `);

    // 检查是否需要创建emailVerified列
    await db.execute(sql`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'user'
              AND column_name = 'emailVerified'
          ) THEN
              ALTER TABLE "user" ADD COLUMN "emailVerified" timestamp;
              RAISE NOTICE 'Added missing user.emailVerified column';
          END IF;
      END $$;
    `);

    // 输出最终的表结构
    const finalTableInfo = await db.execute(
      sql`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public';`
    );
    console.log("修复后的数据库结构:", finalTableInfo.rows);

    // 确认关键字段存在
    const keyColumnsCheck = await db.execute(sql`
      SELECT 
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'emailVerified') as has_email_verified,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'account' AND column_name = 'providerAccountId') as has_provider_account_id,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'account' AND column_name = 'userId') as has_account_user_id,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'session' AND column_name = 'sessionToken') as has_session_token,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'session' AND column_name = 'userId') as has_session_user_id
    `);
    console.log("关键字段检查:", keyColumnsCheck.rows[0]);

    console.log("数据库列名修复完成！");
  } catch (error: unknown) {
    const dbError = error as DatabaseError;
    console.error("修复数据库时出错:", dbError.message || String(error));
    process.exit(1);
  }
}

fixAllColumns()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    const dbError = err as DatabaseError;
    console.error("执行脚本时出错:", dbError.message || String(err));
    process.exit(1);
  });
