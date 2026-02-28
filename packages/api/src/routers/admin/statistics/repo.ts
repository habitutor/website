import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { practicePack, question } from "@habitutor/db/schema/practice-pack";
import { count } from "drizzle-orm";

export const adminStatisticsRepo = {
	getStats: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
		const [totalUsers] = await db.select({ count: count() }).from(user);
		const [totalPacks] = await db.select({ count: count() }).from(practicePack);
		const [totalQuestions] = await db.select({ count: count() }).from(question);

		return {
			totalUsers: totalUsers?.count ?? 0,
			totalPracticePacks: totalPacks?.count ?? 0,
			totalQuestions: totalQuestions?.count ?? 0,
		};
	},
};
