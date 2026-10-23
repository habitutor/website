CREATE TYPE "public"."tryout_freemium_purchase_kind" AS ENUM('paket', 'pembahasan');--> statement-breakpoint
CREATE TYPE "public"."tryout_freemium_selection_source" AS ENUM('gratis', 'paket');--> statement-breakpoint
CREATE TABLE "tryout_freemium_purchase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"transaction_id" text,
	"kind" "tryout_freemium_purchase_kind" NOT NULL,
	"tryout_id" uuid,
	"activated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tryout_freemium_purchase_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "tryout_freemium_selection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"tryout_id" uuid NOT NULL,
	"source" "tryout_freemium_selection_source" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tryout_freemium_purchase" ADD CONSTRAINT "tryout_freemium_purchase_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_freemium_purchase" ADD CONSTRAINT "tryout_freemium_purchase_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_freemium_purchase" ADD CONSTRAINT "tryout_freemium_purchase_tryout_id_tryout_id_fk" FOREIGN KEY ("tryout_id") REFERENCES "public"."tryout"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_freemium_selection" ADD CONSTRAINT "tryout_freemium_selection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_freemium_selection" ADD CONSTRAINT "tryout_freemium_selection_tryout_id_tryout_id_fk" FOREIGN KEY ("tryout_id") REFERENCES "public"."tryout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_tryout_freemium_purchase_user_id" ON "tryout_freemium_purchase" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_tryout_freemium_selection_user_id" ON "tryout_freemium_selection" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tryout_freemium_selection_user_tryout_unique" ON "tryout_freemium_selection" USING btree ("user_id","tryout_id");--> statement-breakpoint
INSERT INTO "product" ("name", "slug", "price", "type")
VALUES ('Pembahasan TryOut', 'tryout-pembahasan', '5000', 'product')
ON CONFLICT ("slug") DO NOTHING;--> statement-breakpoint
UPDATE "product" SET "name" = 'Paket 3 TryOut' WHERE "slug" = 'tryout-freemium';
