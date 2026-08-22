import { index, jsonb, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { user } from "./user";

/** In-app inbox entries; push delivery is best-effort on top of these. */
export const notification = pgTable(
  "notification",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text().notNull(), // e.g. "match_request" | "premium_unlocked" | "system"
    title: text().notNull(),
    body: text().notNull(),
    data: jsonb(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("idx_notification_user_time").on(t.userId, t.createdAt)],
);

/** Expo push tokens; one row per device token. */
export const pushToken = pgTable(
  "push_token",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text().notNull(),
    platform: text().notNull(), // "ios" | "android"
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique("unique_push_token").on(t.token), index("idx_push_token_user").on(t.userId)],
);
