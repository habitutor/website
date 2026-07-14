CREATE TYPE "public"."promo_discount_type_enum" AS ENUM('fixed_price', 'percentage');--> statement-breakpoint
CREATE TABLE "promo_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"product_id" uuid NOT NULL,
	"discount_type" "promo_discount_type_enum" NOT NULL,
	"discount_value" numeric NOT NULL,
	"expires_at" timestamp,
	"total_usage_limit" integer,
	"per_user_limit" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "promo_code_id" uuid;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "gateway_transaction_id" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "gateway_status" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "payment_type" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "fraud_status" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "status_code" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "is_simulation" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "promo_code" ADD CONSTRAINT "promo_code_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "promo_code_code_unique" ON "promo_code" USING btree ("code");--> statement-breakpoint
CREATE INDEX "promo_code_product_idx" ON "promo_code" USING btree ("product_id");--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_promo_code_id_promo_code_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_code"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transaction_ordered_at_idx" ON "transaction" USING btree ("ordered_at");--> statement-breakpoint
CREATE INDEX "transaction_status_idx" ON "transaction" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transaction_gateway_status_idx" ON "transaction" USING btree ("gateway_status");--> statement-breakpoint
CREATE INDEX "transaction_payment_type_idx" ON "transaction" USING btree ("payment_type");--> statement-breakpoint
CREATE INDEX "transaction_promo_code_idx" ON "transaction" USING btree ("promo_code_id");