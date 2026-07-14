import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./user";
import { referralCode } from "./referral";

export const typeEnum = pgEnum("product_type_enum", ["subscription", "product"]);
export const statusEnum = pgEnum("transaction_status_enum", ["pending", "success", "failed"]);
export const promoDiscountTypeEnum = pgEnum("promo_discount_type_enum", ["fixed_price", "percentage"]);

export const product = pgTable("product", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  price: decimal().notNull(),
  type: typeEnum("type").notNull(),
});

export const promoCode = pgTable(
  "promo_code",
  {
    id: uuid().defaultRandom().primaryKey(),
    code: text().notNull(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    discountType: promoDiscountTypeEnum("discount_type").notNull(),
    discountValue: decimal("discount_value").notNull(),
    expiresAt: timestamp("expires_at"),
    totalUsageLimit: integer("total_usage_limit"),
    perUserLimit: integer("per_user_limit").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("promo_code_code_unique").on(table.code),
    index("promo_code_product_idx").on(table.productId),
  ],
);

export const transaction = pgTable(
  "transaction",
  {
    id: text().primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    productId: uuid("product_id").references(() => product.id, { onDelete: "set null" }),
    grossAmount: decimal("gross_amount"),
    status: statusEnum("status").notNull().default("pending"),
    referralCodeId: uuid("referral_code_id").references(() => referralCode.id, { onDelete: "set null" }),
    promoCodeId: uuid("promo_code_id").references(() => promoCode.id, { onDelete: "set null" }),
    gatewayTransactionId: text("gateway_transaction_id"),
    gatewayStatus: text("gateway_status"),
    paymentType: text("payment_type"),
    fraudStatus: text("fraud_status"),
    statusCode: text("status_code"),
    isSimulation: boolean("is_simulation").notNull().default(false),
    paidAt: timestamp("paid_at"),
    orderedAt: timestamp("ordered_at").defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_transaction_user").on(t.userId),
    index("transaction_ordered_at_idx").on(t.orderedAt),
    index("transaction_status_idx").on(t.status),
    index("transaction_gateway_status_idx").on(t.gatewayStatus),
    index("transaction_payment_type_idx").on(t.paymentType),
    index("transaction_promo_code_idx").on(t.promoCodeId),
  ],
);
