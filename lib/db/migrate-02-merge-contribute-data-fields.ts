import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function migrateContributeDataFields() {
  console.log("Starting migration: Merging contribute_data fields");

  try {
    // Step 1: Add the new github_data column
    console.log("Adding github_data column...");
    await db.execute(sql`
      ALTER TABLE "contribute_data" 
      ADD COLUMN "github_data" JSONB;
    `);
    console.log("Added github_data column");

    // Step 2: Update the new column with merged data
    console.log("Merging user_data and contribution_data into github_data...");
    await db.execute(sql`
      UPDATE "contribute_data"
      SET "github_data" = (
        SELECT 
          jsonb_build_object(
            'login', "user_data"->>'login',
            'name', "user_data"->>'name',
            'avatar_url', "user_data"->>'avatar_url',
            'bio', COALESCE("user_data"->>'bio', ''),
            'blog', COALESCE("user_data"->>'blog', ''),
            'location', COALESCE("user_data"->>'location', ''),
            'twitter_username', "user_data"->>'twitter_username',
            'public_repos', COALESCE(("user_data"->>'public_repos')::int, 0),
            'followers', COALESCE(("user_data"->>'followers')::int, 0),
            'following', COALESCE(("user_data"->>'following')::int, 0),
            'created_at', "user_data"->>'created_at',
            'total_stars', COALESCE(("contribution_data"->>'total_stars')::int, 0),
            'contributionScore', COALESCE(("contribution_data"->>'contributionScore')::int, 0),
            'contribution_grade', COALESCE("contribution_data"->>'contribution_grade', 'F'),
            'commits', COALESCE(("contribution_data"->>'commits')::int, 0),
            'pull_requests', COALESCE(("contribution_data"->>'pull_requests')::int, 0),
            'issues', COALESCE(("contribution_data"->>'issues')::int, 0),
            'reviews', COALESCE(("contribution_data"->>'reviews')::int, 0)
          )
      )
    `);
    console.log("Merged data successfully");

    // Step 3: Make the github_data column NOT NULL
    console.log("Setting github_data to NOT NULL...");
    await db.execute(sql`
      ALTER TABLE "contribute_data" 
      ALTER COLUMN "github_data" SET NOT NULL;
    `);
    console.log("Set github_data to NOT NULL");

    // Step 4: Drop the old columns
    console.log("Dropping old columns...");
    await db.execute(sql`
      ALTER TABLE "contribute_data" 
      DROP COLUMN "user_data",
      DROP COLUMN "contribution_data";
    `);
    console.log("Dropped old columns");

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run the migration
migrateContributeDataFields()
  .then(() => {
    console.log("Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
