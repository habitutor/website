import {
  boolean,
  index,
  integer,
  date as pgDate,
  pgEnum,
  pgTable,
  time as pgTime,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { recordingCategoryEnum } from "./recording";

export const liveClassAccessEnum = pgEnum("live_class_access", ["3x", "5x"]);
export const announcementVariantEnum = pgEnum("announcement_variant", ["primary", "cashback"]);

export const dashboardLiveClass = pgTable(
  "dashboard_live_class",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: text().notNull(),
    date: pgDate().notNull(),
    time: pgTime().notNull(),
    teacher: text().notNull(),
    link: text().notNull(),
    access: liveClassAccessEnum().notNull().default("3x"),
    // Kategori sama dengan Live Recording (TKA, SNBT, MANDIRI); kelas MANDIRI khusus pembeli Paket Sampai Mandiri.
    category: recordingCategoryEnum("category").notNull().default("SNBT"),
    durationMinutes: integer("duration_minutes").notNull().default(60),
    isPublished: boolean("is_published").notNull().default(true),
    order: integer().notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_dashboard_live_class_published_order").on(t.isPublished, t.order),
    index("idx_dashboard_live_class_access").on(t.access),
  ],
);

export const dashboardAnnouncement = pgTable(
  "dashboard_announcement",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: text().notNull(),
    description: text().notNull(),
    variant: announcementVariantEnum().notNull().default("primary"),
    ctaLink: text("cta_link"),
    ctaLabel: text("cta_label"),
    isPublished: boolean("is_published").notNull().default(true),
    order: integer().notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_dashboard_announcement_published_order").on(t.isPublished, t.order),
    index("idx_dashboard_announcement_variant").on(t.variant),
  ],
);
