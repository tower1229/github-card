ALTER TABLE "contribution_leaderboard" ADD COLUMN "contribution_score" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "contribution_leaderboard" DROP COLUMN "contribution_count";