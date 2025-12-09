CREATE TYPE "public"."key_status" AS ENUM('unused', 'active', 'expired', 'banned');--> statement-breakpoint
CREATE TABLE "product_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"name" varchar(150) NOT NULL,
	"platform" varchar(50),
	"download_url" text NOT NULL,
	"version" varchar(50),
	"file_size_bytes" integer,
	"file_hash" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"sharing" boolean DEFAULT false NOT NULL,
	"device_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"status" "key_status" DEFAULT 'unused' NOT NULL,
	CONSTRAINT "product_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "product_files" ADD CONSTRAINT "product_files_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_keys" ADD CONSTRAINT "product_keys_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;