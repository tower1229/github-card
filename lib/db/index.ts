import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";

// 确保在创建数据库连接之前加载环境变量
dotenv.config({ path: ".env.local" });

// Only create database connection on the server side
// When importing from client components, provide a dummy handler that warns about client usage
let db: ReturnType<typeof drizzle<typeof schema>>;

// Only create a real connection on the server side
if (typeof window === "undefined") {
  try {
    console.log(
      "Loading DATABASE_URL:",
      process.env.DATABASE_URL ? "Found" : "Not found"
    );
    const sql = neon(process.env.DATABASE_URL!);
    db = drizzle(sql, { schema });
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

// Helper function to get a timestamp 3 days from now (for share links expiration)
export function getExpirationDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date;
}
