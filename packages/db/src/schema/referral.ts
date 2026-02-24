import { relations } from "drizzle-orm";
import { decimal, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const referralCode = pgTable(
	"referral_code",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		code: text("code").notNull().unique(),
		userId: text("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		referralCount: integer("referral_count").default(0).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("referral_code_user_id_idx").on(table.userId), index("referral_code_code_idx").on(table.code)],
);

export const referralUsage = pgTable(
	"referral_usage",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		referralCodeId: uuid("referral_code_id")
			.notNull()
			.references(() => referralCode.id, { onDelete: "cascade" }),
		transactionId: text("transaction_id"),
		cashbackAmount: decimal("cashback_amount"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("referral_usage_user_id_idx").on(table.userId),
		index("referral_usage_referral_code_id_idx").on(table.referralCodeId),
	],
);

export const referralCodeRelations = relations(referralCode, ({ one, many }) => ({
	user: one(user, {
		fields: [referralCode.userId],
		references: [user.id],
	}),
	usages: many(referralUsage),
}));

export const referralUsageRelations = relations(referralUsage, ({ one }) => ({
	user: one(user, {
		fields: [referralUsage.userId],
		references: [user.id],
	}),
	referralCode: one(referralCode, {
		fields: [referralUsage.referralCodeId],
		references: [referralCode.id],
	}),
}));
