ALTER TABLE "users" ALTER COLUMN "sign_up" SET DEFAULT 'credential';--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "keys_product_idx" ON "keys" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "keys_order_idx" ON "keys" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "keys_product_sharing_idx" ON "keys" USING btree ("product_id","sharing");--> statement-breakpoint
CREATE INDEX "keys_available_idx" ON "keys" USING btree ("product_id","status","order_id");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_product_idx" ON "orders" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "orders_created_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "product_items_product_idx" ON "product_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_items_order_idx" ON "product_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_active_idx" ON "products" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");