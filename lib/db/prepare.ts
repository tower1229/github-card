import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// This function is used to prepare the database with the schema
// It's useful for type generation with drizzle-kit
export function prepare() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

// Call the function to generate the types
prepare();
