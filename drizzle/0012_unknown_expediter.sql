ALTER TABLE "contribute_data" ADD COLUMN "github_data" json NOT NULL;--> statement-breakpoint
ALTER TABLE "contribute_data" DROP COLUMN "user_data";--> statement-breakpoint
ALTER TABLE "contribute_data" DROP COLUMN "contribution_data";