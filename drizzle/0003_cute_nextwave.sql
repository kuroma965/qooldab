ALTER TABLE "products" ADD COLUMN "sold" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "metadata";