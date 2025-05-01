ALTER TABLE "account" DROP CONSTRAINT "account_provider_provider_account_id_pk";--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId");--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "providerAccountId" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "provider_account_id";