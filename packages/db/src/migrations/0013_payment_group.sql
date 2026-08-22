CREATE TYPE "public"."payment_group_status_enum" AS ENUM('pending', 'complete', 'expired');--> statement-breakpoint
CREATE TABLE "payment_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_code" text NOT NULL,
	"creator_user_id" text,
	"status" "payment_group_status_enum" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "payment_group_id" uuid;--> statement-breakpoint
ALTER TABLE "payment_group" ADD CONSTRAINT "payment_group_creator_user_id_user_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "payment_group_invite_code_unique" ON "payment_group" USING btree ("invite_code");--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_payment_group_id_payment_group_id_fk" FOREIGN KEY ("payment_group_id") REFERENCES "public"."payment_group"("id") ON DELETE set null ON UPDATE no action;