CREATE TABLE "program_studi" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "program_studi_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"passed_grade" integer NOT NULL,
	"univ_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "universitas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "universitas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama_univ" text NOT NULL,
	"rank_univ" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "program_studi" ADD CONSTRAINT "program_studi_univ_id_universitas_id_fk" FOREIGN KEY ("univ_id") REFERENCES "public"."universitas"("id") ON DELETE cascade ON UPDATE no action;