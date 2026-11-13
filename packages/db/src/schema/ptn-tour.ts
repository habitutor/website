import { sql } from "drizzle-orm";
import { boolean, index, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./user";

export const ptnTourEvent = pgTable(
  "ptn_tour_event",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    slug: text().notNull().unique(),
    title: text().notNull(),
    category: text().notNull(),
    description: text().notNull(),
    longDescription: text("long_description"),
    rundown: text(),
    tutor: text().notNull(),
    campus: text().notNull(),
    posterUrl: text("poster_url").notNull(),
    startsAt: timestamp("starts_at").notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(120),
    quota: integer(),
    whatsappGroupUrl: text("whatsapp_group_url"),
    zoomUrl: text("zoom_url"),
    recordingUrl: text("recording_url"),
    recordingFreeDays: integer("recording_free_days").notNull().default(30),
    accessMode: text("access_mode").notNull().default("free"),
    scheduleStatus: text("schedule_status").notNull().default("normal"),
    subjects: text().array().notNull().default(sql`'{}'::text[]`),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("ptn_tour_event_published_starts_at_idx").on(table.isPublished, table.startsAt)],
);

export const ptnTourRegistration = pgTable(
  "ptn_tour_registration",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    eventId: integer("event_id")
      .notNull()
      .references(() => ptnTourEvent.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    schoolName: text("school_name"),
    classLevel: text("class_level"),
    dataConsentAt: timestamp("data_consent_at"),
    accessMethod: text("access_method").notNull().default("share"),
    attendedAt: timestamp("attended_at"),
    reminderDayAt: timestamp("reminder_day_at"),
    reminderHourAt: timestamp("reminder_hour_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("ptn_tour_registration_event_user_unique").on(table.eventId, table.userId),
    index("ptn_tour_registration_user_idx").on(table.userId),
  ],
);

export const ptnTourMaterial = pgTable(
  "ptn_tour_material",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    eventId: integer("event_id")
      .notNull()
      .references(() => ptnTourEvent.id, { onDelete: "cascade" }),
    label: text().notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type").notNull().default("PDF"),
    unlockAt: text("unlock_at").notNull().default("after_register"),
    sortOrder: integer("sort_order").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("ptn_tour_material_event_idx").on(table.eventId, table.isPublished)],
);

/** Bukti follow/share yang diunggah peserta. Hanya pengingat syarat, dihapus otomatis setelah masa simpan. */
export const ptnTourProof = pgTable(
  "ptn_tour_proof",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    registrationId: integer("registration_id")
      .notNull()
      .references(() => ptnTourRegistration.id, { onDelete: "cascade" }),
    kind: text().notNull(),
    url: text().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("ptn_tour_proof_registration_idx").on(table.registrationId),
    index("ptn_tour_proof_created_at_idx").on(table.createdAt),
  ],
);

/** Pengaturan pusat (link channel WA, teks promo) yang sama untuk semua event. */
export const ptnTourSetting = pgTable("ptn_tour_setting", {
  key: text().primaryKey(),
  value: text().notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
