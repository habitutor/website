import { decimal, index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { referralCode } from "./referral";

export const typeEnum = pgEnum("product_type_enum", ["subscription", "product"]);
export const statusEnum = pgEnum("transaction_status_enum", ["pending", "success", "failed"]);

export const transaction = pgTable(
	"transaction",
	{
		id: text().primaryKey(),
		userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
		productId: uuid("product_id").references(() => product.id, { onDelete: "set null" }),
		grossAmount: decimal("gross_amount"),
		status: statusEnum("status").notNull().default("pending"),
		referralCodeId: uuid("referral_code_id").references(() => referralCode.id, { onDelete: "set null" }),
		paidAt: timestamp("paid_at"),
		orderedAt: timestamp("ordered_at").defaultNow(),
	},
	(t) => [index("idx_transaction_user").on(t.userId)],
);

export const product = pgTable("product", {
	id: uuid().defaultRandom().primaryKey(),
	name: text().notNull(),
	slug: text().notNull().unique(),
	price: decimal().notNull(),
	type: typeEnum("type").notNull(),
});
