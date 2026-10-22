import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { transaction } from "./transaction";
import { tryout } from "./tryout";
import { user } from "./user";

export const tryoutFreemiumAccess = pgTable(
  "tryout_freemium_access",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    requirementsCompletedAt: timestamp("requirements_completed_at"),
    requirementsProofUrls: text("requirements_proof_urls").array(),
    paidAt: timestamp("paid_at"),
    pembahasanTryoutId: uuid("pembahasan_tryout_id").references(() => tryout.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("idx_tryout_freemium_access_tryout_id").on(t.pembahasanTryoutId)],
);

/**
 * Jatah pembahasan: tiap pembayaran Rp10.000 = 1 jatah. Jatah dipakai dengan memilih 1 TO (tryoutId terisi),
 * dan pembahasan TO yang sudah dibuka tetap terbuka selamanya walau user membeli jatah lagi.
 */
export const tryoutFreemiumCredit = pgTable(
  "tryout_freemium_credit",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    transactionId: text("transaction_id")
      .unique()
      .references(() => transaction.id, { onDelete: "set null" }),
    tryoutId: uuid("tryout_id").references(() => tryout.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_tryout_freemium_credit_user_id").on(t.userId),
    uniqueIndex("tryout_freemium_credit_user_tryout_unique").on(t.userId, t.tryoutId),
  ],
);
