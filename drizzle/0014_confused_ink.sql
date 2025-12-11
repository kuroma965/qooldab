ALTER TABLE "keys" DROP CONSTRAINT "keys_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "product_items" DROP CONSTRAINT "product_items_order_id_orders_id_fk";
--> statement-breakpoint
DROP INDEX "keys_available_idx";--> statement-breakpoint
ALTER TABLE "keys" ADD CONSTRAINT "keys_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_items" ADD CONSTRAINT "product_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_items_product_order_idx" ON "product_items" USING btree ("product_id","order_id");--> statement-breakpoint
CREATE INDEX "keys_available_idx" ON "keys" USING btree ("product_id","order_id");