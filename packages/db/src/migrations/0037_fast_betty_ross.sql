CREATE TABLE "affiliate_commission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_user_id" text NOT NULL,
	"buyer_user_id" text,
	"transaction_id" text,
	"base_amount" integer NOT NULL,
	"rate_percent" integer NOT NULL,
	"amount" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"available_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_commission_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "affiliate_payout" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"status" text DEFAULT 'requested' NOT NULL,
	"reference" text,
	"note" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"processed_by" text
);
--> statement-breakpoint
ALTER TABLE "affiliate_commission" ADD CONSTRAINT "affiliate_commission_affiliate_user_id_user_id_fk" FOREIGN KEY ("affiliate_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_commission" ADD CONSTRAINT "affiliate_commission_buyer_user_id_user_id_fk" FOREIGN KEY ("buyer_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_commission" ADD CONSTRAINT "affiliate_commission_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_payout" ADD CONSTRAINT "affiliate_payout_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_payout" ADD CONSTRAINT "affiliate_payout_processed_by_user_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "affiliate_commission_affiliate_idx" ON "affiliate_commission" USING btree ("affiliate_user_id");--> statement-breakpoint
CREATE INDEX "affiliate_payout_user_idx" ON "affiliate_payout" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "affiliate_payout_status_idx" ON "affiliate_payout" USING btree ("status");