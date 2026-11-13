CREATE TABLE "ptn_tour_event" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ptn_tour_event_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"tutor" text NOT NULL,
	"campus" text NOT NULL,
	"poster_url" text NOT NULL,
	"starts_at" timestamp NOT NULL,
	"quota" integer,
	"whatsapp_group_url" text,
	"zoom_url" text,
	"recording_url" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ptn_tour_event_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ptn_tour_registration" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ptn_tour_registration_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"access_method" text DEFAULT 'share' NOT NULL,
	"attended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ptn_tour_registration_event_user_unique" UNIQUE("event_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "ptn_tour_registration" ADD CONSTRAINT "ptn_tour_registration_event_id_ptn_tour_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."ptn_tour_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptn_tour_registration" ADD CONSTRAINT "ptn_tour_registration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ptn_tour_event_published_starts_at_idx" ON "ptn_tour_event" USING btree ("is_published","starts_at");--> statement-breakpoint
CREATE INDEX "ptn_tour_registration_user_idx" ON "ptn_tour_registration" USING btree ("user_id");