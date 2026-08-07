import { relations } from "drizzle-orm";
import { decimal, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { product, transaction } from "./transaction";
import { user } from "./user";

export const groupBuyStatusEnum = pgEnum("group_buy_status_enum", ["active", "completed", "expired"]);
export const groupBuyMemberStatusEnum = pgEnum("group_buy_member_status_enum", [
  "pending_payment",
  "paid",
  "upgraded",
  "refund_requested",
  "refunded",
]);

export const groupBuy = pgTable(
  "group_buy",
  {
    id: uuid().defaultRandom().primaryKey(),
    inviteCode: text("invite_code").notNull(),
    creatorUserId: text("creator_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "restrict" }),
    // Prices are frozen per group so later price changes never affect
    // refund/top-up amounts of groups that are already running.
    seatPrice: decimal("seat_price").notNull(),
    fullPrice: decimal("full_price").notNull(),
    requiredMembers: integer("required_members").notNull().default(3),
    status: groupBuyStatusEnum("status").notNull().default("active"),
    expiresAt: timestamp("expires_at").notNull(),
    completedAt: timestamp("completed_at"),
    expiredNotifiedAt: timestamp("expired_notified_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("group_buy_invite_code_unique").on(table.inviteCode),
    index("group_buy_creator_idx").on(table.creatorUserId),
    index("group_buy_status_expires_idx").on(table.status, table.expiresAt),
  ],
);

export const groupBuyMember = pgTable(
  "group_buy_member",
  {
    id: uuid().defaultRandom().primaryKey(),
    groupBuyId: uuid("group_buy_id")
      .notNull()
      .references(() => groupBuy.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: groupBuyMemberStatusEnum("status").notNull().default("pending_payment"),
    // Latest seat payment attempt; earlier failed attempts stay in the
    // transaction table but are no longer linked here.
    transactionId: text("transaction_id").references(() => transaction.id, { onDelete: "set null" }),
    topupTransactionId: text("topup_transaction_id").references(() => transaction.id, { onDelete: "set null" }),
    paidAt: timestamp("paid_at"),
    refundBankName: text("refund_bank_name"),
    refundAccountNumber: text("refund_account_number"),
    refundAccountHolder: text("refund_account_holder"),
    refundRequestedAt: timestamp("refund_requested_at"),
    refundedAt: timestamp("refunded_at"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("group_buy_member_group_user_unique").on(table.groupBuyId, table.userId),
    index("group_buy_member_user_idx").on(table.userId),
    index("group_buy_member_transaction_idx").on(table.transactionId),
    index("group_buy_member_topup_transaction_idx").on(table.topupTransactionId),
    index("group_buy_member_status_idx").on(table.status),
  ],
);

export const groupBuyRelations = relations(groupBuy, ({ one, many }) => ({
  creator: one(user, {
    fields: [groupBuy.creatorUserId],
    references: [user.id],
  }),
  product: one(product, {
    fields: [groupBuy.productId],
    references: [product.id],
  }),
  members: many(groupBuyMember),
}));

export const groupBuyMemberRelations = relations(groupBuyMember, ({ one }) => ({
  group: one(groupBuy, {
    fields: [groupBuyMember.groupBuyId],
    references: [groupBuy.id],
  }),
  user: one(user, {
    fields: [groupBuyMember.userId],
    references: [user.id],
  }),
}));
