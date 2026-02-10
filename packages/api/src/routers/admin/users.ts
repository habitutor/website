import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { admin } from "../../index";

interface CursorData {
	createdAt: string;
	id: string;
}

function encodeCursor(data: CursorData): string {
	return Buffer.from(JSON.stringify(data)).toString("base64url");
}

function decodeCursor(cursor: string): CursorData {
	try {
		return JSON.parse(Buffer.from(cursor, "base64url").toString());
	} catch {
		throw new ORPCError("BAD_REQUEST", { message: "Invalid cursor" });
	}
}

const listUsers = admin
	.route({
		path: "/admin/users",
		method: "GET",
		tags: ["Admin - Users"],
	})
	.input(
		type({
			"limit?": "number",
			"cursor?": "string",
			"search?": "string",
		}),
	)
	.handler(async ({ input, errors }) => {
		const limit = Math.min(input.limit || 10, 50);
		const search = input.search || "";

		const cursorData = input.cursor ? decodeCursor(input.cursor) : null;
		const cursorCreatedAt = cursorData ? new Date(cursorData.createdAt) : null;

		const users = await db
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
					cursorData && cursorCreatedAt
						? sql`(${user.createdAt}, ${user.id}) < (${cursorCreatedAt}, ${cursorData.id})`
						: undefined,
				),
			)
			.orderBy(desc(user.createdAt), desc(user.id))
			.limit(limit + 1);

		if (users.length < 1)
			throw errors.NOT_FOUND({
				message: "Gagal menemukan data user.",
			});

		const hasMore = users.length > limit;
		const data = hasMore ? users.slice(0, limit) : users;

		const lastItem = data[data.length - 1];
		const nextCursor =
			hasMore && lastItem
				? encodeCursor({
						createdAt: lastItem.createdAt.toISOString(),
						id: lastItem.id,
					})
				: null;

		return {
			data,
			nextCursor,
			hasMore,
		};
	});

const updateUserPremium = admin
	.route({
		path: "/admin/users/{id}/premium",
		method: "PUT",
		tags: ["Admin - Users"],
	})
	.input(
		type({
			id: "string",
			isPremium: "boolean",
			"premiumExpiresAt?": "string",
		}),
	)
	.handler(async ({ input }) => {
		const [existingUser] = await db.select().from(user).where(eq(user.id, input.id)).limit(1);

		if (!existingUser) {
			throw new ORPCError("NOT_FOUND", {
				message: "User tidak ditemukan",
			});
		}

		const [updatedUser] = await db
			.update(user)
			.set({
				isPremium: input.isPremium,
				premiumExpiresAt: input.premiumExpiresAt ? new Date(input.premiumExpiresAt) : input.isPremium ? null : null,
			})
			.where(eq(user.id, input.id))
			.returning();

		if (!updatedUser) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal mengupdate status premium user",
			});
		}

		return {
			id: updatedUser.id,
			name: updatedUser.name,
			email: updatedUser.email,
			isPremium: updatedUser.isPremium,
			premiumExpiresAt: updatedUser.premiumExpiresAt,
		};
	});

export const adminUserRouter = {
	listUsers,
	updateUserPremium,
};
