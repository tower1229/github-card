import { drizzle } from "drizzle-orm/node-postgres";
// import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

// Get database connection string from environment variable
const connectionString = process.env.DATABASE_URL;

async function runMigration() {
  if (!connectionString) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  try {
    console.log("Setting up database connection...");
    const pool = new Pool({
      connectionString,
    });

    const db = drizzle(pool);

    console.log("Running database migrations...");

    // Step 1: Create the contribute_data table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "contribute_data" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "username" VARCHAR(255) NOT NULL UNIQUE,
        "user_data" JSONB NOT NULL,
        "contribution_data" JSONB NOT NULL,
        "last_updated" TIMESTAMP NOT NULL DEFAULT NOW(),
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Create contribute_data table: SUCCESS");

    // Step 2: Add the github_username column to share_links table
    await db.execute(sql`
      ALTER TABLE "share_links"
      ADD COLUMN IF NOT EXISTS "github_username" VARCHAR(255);
    `);
    console.log("Add github_username column: SUCCESS");

    // Step 3: Populate github_username from card_data for existing rows
    await db.execute(sql`
      UPDATE "share_links"
      SET "github_username" = card_data->>'login'
      WHERE "github_username" IS NULL AND card_data->>'login' IS NOT NULL;
    `);
    console.log("Populate github_username from card_data: SUCCESS");

    // Step 4: Make github_username NOT NULL after populating it
    await db.execute(sql`
      ALTER TABLE "share_links"
      ALTER COLUMN "github_username" SET NOT NULL;
    `);
    console.log("Make github_username NOT NULL: SUCCESS");

    // Step 5: Drop the card_data column from share_links
    await db.execute(sql`
      ALTER TABLE "share_links"
      DROP COLUMN IF EXISTS "card_data";
    `);
    console.log("Drop card_data column: SUCCESS");

    console.log("Migration completed successfully!");
    await pool.end();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
