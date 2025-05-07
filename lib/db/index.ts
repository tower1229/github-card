import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import * as dotenv from "dotenv";

// Define type for globalThis with DB property
interface GlobalWithDB {
  DB: D1Database;
}

// D1Database type definition
interface D1Database {
  [key: string]: unknown;
}

// 确保在创建数据库连接之前加载环境变量
dotenv.config({ path: ".env.local" });

// Only create database connection on the server side
// When importing from client components, provide a dummy handler that warns about client usage
let db: ReturnType<typeof drizzle<typeof schema>>;

// Only create a real connection on the server side
if (typeof window === "undefined") {
  try {
    // 使用 Cloudflare D1 数据库
    // 在 Cloudflare Workers 环境中，DB 绑定会自动注入
    // 但在 Next.js 服务器端渲染时，我们需要处理 DB 可能不存在的情况
    if (process.env.NODE_ENV === "development" && !((globalThis as unknown) as GlobalWithDB).DB) {
      console.warn("D1 database not available in development outside of Cloudflare Workers environment");
      // 在开发环境提供一个模拟 D1 对象
      ((globalThis as unknown) as GlobalWithDB).DB = {} as D1Database;
    }
    
    db = drizzle(((globalThis as unknown) as GlobalWithDB).DB, { schema });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw error;
  }
} else {
  // Client-side: Create a dummy DB object that warns if used
  // But still satisfies TypeScript's need for a proper DB object
  const warn = () => {
    console.warn("Client-side database access attempted, which isn't allowed");
    return Promise.resolve([]);
  };

  // Create a query mock with common methods
  const createQueryMock = () => ({
    findFirst: warn,
    findMany: warn,
  });

  // Create a minimal implementation that won't actually do anything
  db = {
    query: {
      users: createQueryMock(),
      accounts: createQueryMock(),
      sessions: createQueryMock(),
      userBehaviors: createQueryMock(),
      shareLinks: createQueryMock(),
      contributionLeaderboard: createQueryMock(),
    },
    select: warn,
    insert: warn,
    update: warn,
    delete: warn,
  } as unknown as ReturnType<typeof drizzle<typeof schema>>;
}

// Export schema for use in other modules
export { schema };
export { db };

// Helper function to get a Unix timestamp 3 days from now (for share links expiration)
export function getExpirationDate(): number {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  // 返回 Unix 时间戳（秒）
  return Math.floor(date.getTime() / 1000);
}
