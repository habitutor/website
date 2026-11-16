CREATE TABLE "ptn_tour_payment" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ptn_tour_payment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"transaction_id" text NOT NULL,
	"school_name" text NOT NULL,
	"class_level" text NOT NULL,
	"phone_number" text NOT NULL,
	"dream_campus" text NOT NULL,
	"education_level" text NOT NULL,
	"consent_at" timestamp NOT NULL,
	"activated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ptn_tour_payment_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
ALTER TABLE "ptn_tour_payment" ADD CONSTRAINT "ptn_tour_payment_event_id_ptn_tour_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."ptn_tour_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptn_tour_payment" ADD CONSTRAINT "ptn_tour_payment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptn_tour_payment" ADD CONSTRAINT "ptn_tour_payment_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ptn_tour_payment_event_user_idx" ON "ptn_tour_payment" USING btree ("event_id","user_id");
--> statement-breakpoint
INSERT INTO "product" ("name", "slug", "price", "type")
VALUES ('Pendaftaran Event PTN Tour', 'ptn-tour-event', '10000', 'product')
ON CONFLICT ("slug") DO NOTHING;
