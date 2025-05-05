CREATE TABLE "contribute_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"user_data" json NOT NULL,
	"contribution_data" json NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contribute_data_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "share_links" ADD COLUMN "github_username" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "share_links" DROP COLUMN "card_data";