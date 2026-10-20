import { boolean, index, integer, date as pgDate, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const recordingCategoryEnum = pgEnum("recording_category", ["TKA", "SNBT", "MANDIRI"]);

export const recording = pgTable(
  "recording",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    category: recordingCategoryEnum().notNull(),
    title: text().notNull(),
    teacher: text(),
    youtubeUrl: text("youtube_url").notNull(),
    recordedAt: pgDate("recorded_at").notNull(),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("idx_recording_category_published").on(t.category, t.isPublished)],
);
