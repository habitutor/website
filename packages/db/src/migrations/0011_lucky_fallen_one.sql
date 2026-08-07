CREATE TYPE "public"."group_buy_member_status_enum" AS ENUM('pending_payment', 'paid', 'upgraded', 'refund_requested', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."group_buy_status_enum" AS ENUM('active', 'completed', 'expired');--> statement-breakpoint
CREATE TABLE "group_buy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_code" text NOT NULL,
	"creator_user_id" text NOT NULL,
	"product_id" uuid NOT NULL,
	"seat_price" numeric NOT NULL,
	"full_price" numeric NOT NULL,
	"required_members" integer DEFAULT 3 NOT NULL,
	"status" "group_buy_status_enum" DEFAULT 'active' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"expired_notified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_buy_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_buy_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"status" "group_buy_member_status_enum" DEFAULT 'pending_payment' NOT NULL,
	"transaction_id" text,
	"topup_transaction_id" text,
	"paid_at" timestamp,
	"refund_bank_name" text,
	"refund_account_number" text,
	"refund_account_holder" text,
	"refund_requested_at" timestamp,
	"refunded_at" timestamp,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "group_buy" ADD CONSTRAINT "group_buy_creator_user_id_user_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_buy" ADD CONSTRAINT "group_buy_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_buy_member" ADD CONSTRAINT "group_buy_member_group_buy_id_group_buy_id_fk" FOREIGN KEY ("group_buy_id") REFERENCES "public"."group_buy"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_buy_member" ADD CONSTRAINT "group_buy_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_buy_member" ADD CONSTRAINT "group_buy_member_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_buy_member" ADD CONSTRAINT "group_buy_member_topup_transaction_id_transaction_id_fk" FOREIGN KEY ("topup_transaction_id") REFERENCES "public"."transaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "group_buy_invite_code_unique" ON "group_buy" USING btree ("invite_code");--> statement-breakpoint
CREATE INDEX "group_buy_creator_idx" ON "group_buy" USING btree ("creator_user_id");--> statement-breakpoint
CREATE INDEX "group_buy_status_expires_idx" ON "group_buy" USING btree ("status","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "group_buy_member_group_user_unique" ON "group_buy_member" USING btree ("group_buy_id","user_id");--> statement-breakpoint
CREATE INDEX "group_buy_member_user_idx" ON "group_buy_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "group_buy_member_transaction_idx" ON "group_buy_member" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "group_buy_member_topup_transaction_idx" ON "group_buy_member" USING btree ("topup_transaction_id");--> statement-breakpoint
CREATE INDEX "group_buy_member_status_idx" ON "group_buy_member" USING btree ("status");