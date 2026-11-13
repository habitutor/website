import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { transaction } from "./transaction";
import { user } from "./user";

/**
 * Komisi affiliator: satu baris per pembelian pertama teman yang memakai kodenya. Nominal dihitung dari jumlah yang
 * benar-benar dibayar (setelah diskon). status "void" dipakai saat pembayaran di-refund. Saldo dihitung dari baris
 * ini dikurangi pencairan, jadi tidak ada angka saldo yang bisa menyimpang dari catatan.
 */
export const affiliateCommission = pgTable(
  "affiliate_commission",
  {
    id: uuid().defaultRandom().primaryKey(),
    affiliateUserId: text("affiliate_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    buyerUserId: text("buyer_user_id").references(() => user.id, { onDelete: "set null" }),
    transactionId: text("transaction_id")
      .unique()
      .references(() => transaction.id, { onDelete: "set null" }),
    baseAmount: integer("base_amount").notNull(),
    ratePercent: integer("rate_percent").notNull(),
    amount: integer().notNull(),
    status: text().notNull().default("active"),
    availableAt: timestamp("available_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("affiliate_commission_affiliate_idx").on(table.affiliateUserId)],
);

/** Permintaan pencairan saldo. Ditransfer manual oleh admin, lalu ditandai paid dengan nomor referensi. */
export const affiliatePayout = pgTable(
  "affiliate_payout",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: integer().notNull(),
    bankName: text("bank_name").notNull(),
    accountNumber: text("account_number").notNull(),
    accountName: text("account_name").notNull(),
    status: text().notNull().default("requested"),
    reference: text(),
    note: text(),
    requestedAt: timestamp("requested_at").notNull().defaultNow(),
    processedAt: timestamp("processed_at"),
    processedBy: text("processed_by").references(() => user.id, { onDelete: "set null" }),
  },
  (table) => [index("affiliate_payout_user_idx").on(table.userId), index("affiliate_payout_status_idx").on(table.status)],
);
