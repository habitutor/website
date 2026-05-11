CREATE TYPE "public"."tryout_question_type" AS ENUM('pilgan', 'multiple');--> statement-breakpoint
CREATE TYPE "public"."tryout_session_status" AS ENUM('berjalan', 'selesai', 'expired');--> statement-breakpoint
CREATE TYPE "public"."tryout_session_subtest_status" AS ENUM('menunggu', 'berjalan', 'selesai', 'expired');--> statement-breakpoint
CREATE TYPE "public"."tryout_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "tryout" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dibuat_oleh" text NOT NULL,
	"judul" text NOT NULL,
	"deskripsi" text,
	"status" "tryout_status" DEFAULT 'draft' NOT NULL,
	"mulai_at" timestamp,
	"selesai_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tryout_jawaban" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sesi_id" uuid NOT NULL,
	"sesi_soal_id" uuid NOT NULL,
	"pilihan_id" uuid,
	"dijawab_at" timestamp,
	"is_benar" boolean,
	"poin_dapat" integer,
	CONSTRAINT "tryout_jawaban_sesi_soal_id_unique" UNIQUE("sesi_soal_id")
);
--> statement-breakpoint
CREATE TABLE "tryout_pilihan_jawaban" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"soal_id" uuid NOT NULL,
	"label" char(1) NOT NULL,
	"isi" text NOT NULL,
	"gambar_url" text,
	"is_benar" boolean DEFAULT false NOT NULL,
	CONSTRAINT "tryout_pilihan_soal_id_label_unique" UNIQUE("soal_id","label")
);
--> statement-breakpoint
CREATE TABLE "tryout_sesi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"tryout_id" uuid NOT NULL,
	"mulai_at" timestamp DEFAULT now() NOT NULL,
	"selesai_at" timestamp,
	"total_skor" integer,
	"peringkat" integer,
	"status" "tryout_session_status" DEFAULT 'berjalan' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tryout_sesi_soal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sesi_subtes_id" uuid NOT NULL,
	"soal_id" uuid NOT NULL,
	"urutan_tampil" integer NOT NULL,
	"is_ragu" boolean DEFAULT false NOT NULL,
	"is_dijawab" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tryout_sesi_soal_sesi_subtes_id_soal_id_unique" UNIQUE("sesi_subtes_id","soal_id")
);
--> statement-breakpoint
CREATE TABLE "tryout_sesi_subtes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sesi_id" uuid NOT NULL,
	"subtes_id" uuid NOT NULL,
	"urutan_pengerjaan" integer NOT NULL,
	"mulai_at" timestamp NOT NULL,
	"deadline_at" timestamp NOT NULL,
	"selesai_at" timestamp,
	"skor_subtes" integer,
	"is_lulus" boolean,
	"status" "tryout_session_subtest_status" DEFAULT 'menunggu' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tryout_sesi_subtes_sesi_id_subtes_id_unique" UNIQUE("sesi_id","subtes_id")
);
--> statement-breakpoint
CREATE TABLE "tryout_soal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subtes_id" uuid NOT NULL,
	"pertanyaan" text NOT NULL,
	"gambar_url" text,
	"tipe" "tryout_question_type" DEFAULT 'pilgan' NOT NULL,
	"poin" integer DEFAULT 0 NOT NULL,
	"pembahasan" text,
	"pembahasan_gambar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tryout_subtes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tryout_id" uuid NOT NULL,
	"nama_subtes" text NOT NULL,
	"jumlah_soal" integer NOT NULL,
	"durasi_menit" integer NOT NULL,
	"urutan" integer NOT NULL,
	"nilai_minimum" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tryout_subtes_tryout_id_urutan_unique" UNIQUE("tryout_id","urutan")
);
--> statement-breakpoint
ALTER TABLE "tryout" ADD CONSTRAINT "tryout_dibuat_oleh_user_id_fk" FOREIGN KEY ("dibuat_oleh") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_jawaban" ADD CONSTRAINT "tryout_jawaban_sesi_id_tryout_sesi_id_fk" FOREIGN KEY ("sesi_id") REFERENCES "public"."tryout_sesi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_jawaban" ADD CONSTRAINT "tryout_jawaban_sesi_soal_id_tryout_sesi_soal_id_fk" FOREIGN KEY ("sesi_soal_id") REFERENCES "public"."tryout_sesi_soal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_jawaban" ADD CONSTRAINT "tryout_jawaban_pilihan_id_tryout_pilihan_jawaban_id_fk" FOREIGN KEY ("pilihan_id") REFERENCES "public"."tryout_pilihan_jawaban"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_pilihan_jawaban" ADD CONSTRAINT "tryout_pilihan_jawaban_soal_id_tryout_soal_id_fk" FOREIGN KEY ("soal_id") REFERENCES "public"."tryout_soal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_sesi" ADD CONSTRAINT "tryout_sesi_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_sesi" ADD CONSTRAINT "tryout_sesi_tryout_id_tryout_id_fk" FOREIGN KEY ("tryout_id") REFERENCES "public"."tryout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_sesi_soal" ADD CONSTRAINT "tryout_sesi_soal_sesi_subtes_id_tryout_sesi_subtes_id_fk" FOREIGN KEY ("sesi_subtes_id") REFERENCES "public"."tryout_sesi_subtes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_sesi_soal" ADD CONSTRAINT "tryout_sesi_soal_soal_id_tryout_soal_id_fk" FOREIGN KEY ("soal_id") REFERENCES "public"."tryout_soal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_sesi_subtes" ADD CONSTRAINT "tryout_sesi_subtes_sesi_id_tryout_sesi_id_fk" FOREIGN KEY ("sesi_id") REFERENCES "public"."tryout_sesi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_sesi_subtes" ADD CONSTRAINT "tryout_sesi_subtes_subtes_id_tryout_subtes_id_fk" FOREIGN KEY ("subtes_id") REFERENCES "public"."tryout_subtes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_soal" ADD CONSTRAINT "tryout_soal_subtes_id_tryout_subtes_id_fk" FOREIGN KEY ("subtes_id") REFERENCES "public"."tryout_subtes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryout_subtes" ADD CONSTRAINT "tryout_subtes_tryout_id_tryout_id_fk" FOREIGN KEY ("tryout_id") REFERENCES "public"."tryout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_tryout_dibuat_oleh" ON "tryout" USING btree ("dibuat_oleh");--> statement-breakpoint
CREATE INDEX "idx_tryout_status" ON "tryout" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tryout_jawaban_sesi_id" ON "tryout_jawaban" USING btree ("sesi_id");--> statement-breakpoint
CREATE INDEX "idx_tryout_pilihan_soal_id" ON "tryout_pilihan_jawaban" USING btree ("soal_id");--> statement-breakpoint
CREATE INDEX "idx_tryout_sesi_user_id" ON "tryout_sesi" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_tryout_sesi_tryout_id" ON "tryout_sesi" USING btree ("tryout_id");--> statement-breakpoint
CREATE INDEX "idx_tryout_sesi_soal_sesi_subtes_id" ON "tryout_sesi_soal" USING btree ("sesi_subtes_id");--> statement-breakpoint
CREATE INDEX "idx_tryout_sesi_subtes_sesi_id" ON "tryout_sesi_subtes" USING btree ("sesi_id");--> statement-breakpoint
CREATE INDEX "idx_tryout_soal_subtes_id" ON "tryout_soal" USING btree ("subtes_id");--> statement-breakpoint
CREATE INDEX "idx_tryout_subtes_tryout_id" ON "tryout_subtes" USING btree ("tryout_id");