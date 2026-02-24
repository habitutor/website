import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

export const adminUserRepo = {
	list: async ({
		db = defaultDb,
		limit,
		cursorCreatedAt,
		cursorId,
		search,
	}: {
		db?: DrizzleDatabase;
		limit: number;
		cursorCreatedAt: Date | null;
		cursorId: string | null;
		search: string;
	}) => {
		return db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				isPremium: user.isPremium,
				premiumExpiresAt: user.premiumExpiresAt,
				createdAt: user.createdAt,
			})
			.from(user)
			.where(
				and(
					search.length > 0 ? or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)) : undefined,
					cursorCreatedAt && cursorId
						? sql`(${user.createdAt}, ${user.id}) < (${cursorCreatedAt}, ${cursorId})`
						: undefined,
				),
			)
			.orderBy(desc(user.createdAt), desc(user.id))
			.limit(limit + 1);
	},

	getById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: string }) => {
		const [u] = await db.select().from(user).where(eq(user.id, id)).limit(1);
		return u;
	},

	updatePremium: async ({
		db = defaultDb,
		id,
		isPremium,
		premiumExpiresAt,
	}: {
		db?: DrizzleDatabase;
		id: string;
		isPremium: boolean;
		premiumExpiresAt: Date | null;
	}) => {
		const [u] = await db.update(user).set({ isPremium, premiumExpiresAt }).where(eq(user.id, id)).returning();
		return u;
	},
};
