CREATE TABLE "ptn_tour_material" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ptn_tour_material_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" integer NOT NULL,
	"label" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text DEFAULT 'PDF' NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ptn_tour_material" ADD CONSTRAINT "ptn_tour_material_event_id_ptn_tour_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."ptn_tour_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ptn_tour_material_event_idx" ON "ptn_tour_material" USING btree ("event_id","is_published");