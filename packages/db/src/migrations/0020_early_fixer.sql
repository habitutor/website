CREATE TABLE "tryout_freemium_access" (
	"user_id" text PRIMARY KEY NOT NULL,
	"requirements_completed_at" timestamp,
	"paid_at" timestamp,
	"pembahasan_tryout_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tryout_freemium_access" ADD CONSTRAINT "tryout_freemium_access_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_freemium_access" ADD CONSTRAINT "tryout_freemium_access_pembahasan_tryout_id_tryout_id_fk" FOREIGN KEY ("pembahasan_tryout_id") REFERENCES "public"."tryout"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_tryout_freemium_access_tryout_id" ON "tryout_freemium_access" USING btree ("pembahasan_tryout_id");