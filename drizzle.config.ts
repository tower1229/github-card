import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  // 注意：当使用 SQLite 方言时，我们不需要提供数据库凭证
  // 对于 D1 数据库，迁移文件将在本地生成，然后通过 wrangler 命令推送到 Cloudflare
} satisfies Config;
