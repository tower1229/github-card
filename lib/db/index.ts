import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";

// 确保在创建数据库连接之前加载环境变量
dotenv.config({ path: ".env.local" });

// 添加调试信息
console.log(
  "Loading DATABASE_URL:",
  process.env.DATABASE_URL ? "Found" : "Not found"
);

// Create a connection pool to the database
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export schema for use in other modules
export { schema };

// Helper function to get a timestamp 3 days from now (for share links expiration)
export function getExpirationDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date;
}
