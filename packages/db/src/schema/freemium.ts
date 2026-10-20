import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tryout } from "./tryout";
import { user } from "./user";

export const tryoutFreemiumAccess = pgTable(
  "tryout_freemium_access",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    requirementsCompletedAt: timestamp("requirements_completed_at"),
    paidAt: timestamp("paid_at"),
    pembahasanTryoutId: uuid("pembahasan_tryout_id").references(() => tryout.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("idx_tryout_freemium_access_tryout_id").on(t.pembahasanTryoutId)],
);
