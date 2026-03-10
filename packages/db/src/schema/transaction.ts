import { decimal, index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "#schema/auth";

export const typeEnum = pgEnum("product_type_enum", ["subscription", "product"]);
export const statusEnum = pgEnum("transaction_status_enum", ["pending", "success", "failed"]);

export const transaction = pgTable(
	"transaction",
	{
		id: text().primaryKey(),
		userId: text().references(() => user.id, { onDelete: "set null" }),
		productId: uuid().references(() => product.id, { onDelete: "set null" }),
		grossAmount: decimal(),
		status: statusEnum("status").notNull().default("pending"),
		paidAt: timestamp(),
		orderedAt: timestamp().defaultNow(),
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
