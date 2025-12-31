ALTER TABLE "transaction" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "premium_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "ordered_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "transaction" DROP COLUMN "order_id";