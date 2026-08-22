CREATE TYPE "public"."match_request_status_enum" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TABLE "match_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"status" "match_request_status_enum" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"invite_code" text NOT NULL,
	"creator_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_group_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_request" ADD CONSTRAINT "match_request_from_user_id_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_request" ADD CONSTRAINT "match_request_to_user_id_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_group" ADD CONSTRAINT "study_group_creator_user_id_user_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_group_member" ADD CONSTRAINT "study_group_member_group_id_study_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."study_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_group_member" ADD CONSTRAINT "study_group_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "match_request_unique" ON "match_request" USING btree ("from_user_id","to_user_id");--> statement-breakpoint
CREATE INDEX "match_request_to_idx" ON "match_request" USING btree ("to_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "study_group_invite_code_unique" ON "study_group" USING btree ("invite_code");--> statement-breakpoint
CREATE UNIQUE INDEX "study_group_member_unique" ON "study_group_member" USING btree ("group_id","user_id");--> statement-breakpoint
CREATE INDEX "study_group_member_user_idx" ON "study_group_member" USING btree ("user_id");