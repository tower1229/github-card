ALTER TABLE "account" DROP CONSTRAINT "account_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "share_links" DROP CONSTRAINT "share_links_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_behaviors" DROP CONSTRAINT "user_behaviors_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "share_links" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "user_behaviors" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_behaviors" ADD CONSTRAINT "user_behaviors_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "share_links" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "user_behaviors" DROP COLUMN "user_id";