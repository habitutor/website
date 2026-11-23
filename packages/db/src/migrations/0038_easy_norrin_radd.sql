CREATE TABLE "promo_code_package" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promo_code_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"usage_limit" integer
);
--> statement-breakpoint
INSERT INTO "promo_code_package" ("promo_code_id", "product_id", "usage_limit") SELECT "id", "product_id", "total_usage_limit" FROM "promo_code";--> statement-breakpoint
ALTER TABLE "promo_code" DROP CONSTRAINT "promo_code_product_id_product_id_fk";
--> statement-breakpoint
DROP INDEX "promo_code_product_idx";--> statement-breakpoint
ALTER TABLE "promo_code_package" ADD CONSTRAINT "promo_code_package_promo_code_id_promo_code_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_code"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code_package" ADD CONSTRAINT "promo_code_package_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "promo_code_package_unique" ON "promo_code_package" USING btree ("promo_code_id","product_id");--> statement-breakpoint
CREATE INDEX "promo_code_package_product_idx" ON "promo_code_package" USING btree ("product_id");--> statement-breakpoint
ALTER TABLE "promo_code" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "promo_code" DROP COLUMN "total_usage_limit";