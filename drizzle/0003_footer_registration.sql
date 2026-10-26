ALTER TABLE "settings" ADD COLUMN "icp_registration" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "public_security_registration" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "public_security_registration_url" text DEFAULT '' NOT NULL;
