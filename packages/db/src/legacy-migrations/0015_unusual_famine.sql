CREATE TABLE "referral_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"user_id" text NOT NULL,
	"referral_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_code_code_unique" UNIQUE("code"),
	CONSTRAINT "referral_code_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "referral_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"referral_code_id" uuid NOT NULL,
	"transaction_id" text,
	"cashback_amount" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_usage_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "referral_code_id" uuid;--> statement-breakpoint
ALTER TABLE "referral_code" ADD CONSTRAINT "referral_code_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_usage" ADD CONSTRAINT "referral_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_usage" ADD CONSTRAINT "referral_usage_referral_code_id_referral_code_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_code"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "referral_code_user_id_idx" ON "referral_code" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "referral_code_code_idx" ON "referral_code" USING btree ("code");--> statement-breakpoint
CREATE INDEX "referral_usage_user_id_idx" ON "referral_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "referral_usage_referral_code_id_idx" ON "referral_usage" USING btree ("referral_code_id");--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_referral_code_id_referral_code_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_code"("id") ON DELETE set null ON UPDATE no action;