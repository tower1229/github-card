ALTER TABLE "session" ADD COLUMN "sessionToken" varchar(255) PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "emailVerified" timestamp;--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "session_token";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "email_verified";