CREATE TABLE "tryout_freemium_credit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"transaction_id" text,
	"tryout_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tryout_freemium_credit_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
ALTER TABLE "tryout_freemium_credit" ADD CONSTRAINT "tryout_freemium_credit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_freemium_credit" ADD CONSTRAINT "tryout_freemium_credit_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_freemium_credit" ADD CONSTRAINT "tryout_freemium_credit_tryout_id_tryout_id_fk" FOREIGN KEY ("tryout_id") REFERENCES "public"."tryout"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_tryout_freemium_credit_user_id" ON "tryout_freemium_credit" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tryout_freemium_credit_user_tryout_unique" ON "tryout_freemium_credit" USING btree ("user_id","tryout_id");

--> statement-breakpoint
INSERT INTO "tryout_freemium_credit" ("user_id", "tryout_id")
SELECT "user_id", "pembahasan_tryout_id"
FROM "tryout_freemium_access"
WHERE "paid_at" IS NOT NULL
  AND "pembahasan_tryout_id" IS NOT NULL
ON CONFLICT ("user_id", "tryout_id") DO NOTHING;