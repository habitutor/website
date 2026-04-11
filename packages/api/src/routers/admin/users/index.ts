import { ORPCError } from "@orpc/server";
import { PREMIUM_TIERS } from "@habitutor/shared/auth-domain";
import { type } from "arktype";
import { admin } from "../../../index";
import { cursor } from "../../../utils/cursor";
import { adminUserRepo } from "./repo";

const listUsers = admin
  .route({
    path: "/admin/users",
    method: "GET",
    tags: ["Admin - Users"],
  })
  .input(
    type({
      "limit?": "number",
      "after?": "string",
      "before?": "string",
      "search?": "string",
    }),
  )
  .handler(async ({ input, errors }) => {
    if (input.after && input.before) {
      throw errors.UNPROCESSABLE_CONTENT({ message: "Cannot specify both after and before" });
    }

    const limit = Math.min(input.limit || 10, 50);
    const search = input.search || "";

    const afterData = input.after ? cursor.decode(input.after) : null;
    const afterCreatedAt = afterData ? new Date(afterData.createdAt) : null;

    const beforeData = input.before ? cursor.decode(input.before) : null;
    const beforeCreatedAt = beforeData ? new Date(beforeData.createdAt) : null;

    const rows = await adminUserRepo.list({
      limit,
      afterCreatedAt,
      afterId: afterData?.id ?? null,
      beforeCreatedAt,
      beforeId: beforeData?.id ?? null,
      search,
    });

    if (rows.length === 0) {
      return {
        data: [],
        nextCursor: null,
        prevCursor: null,
        hasMore: false,
        hasPrevious: false,
      };
    }

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;

    const firstItem = data[0]!;
    const lastItem = data[data.length - 1]!;
    const nextCursor = hasMore ? cursor.encode({ createdAt: lastItem.createdAt.toISOString(), id: lastItem.id }) : null;
    const prevCursor = cursor.encode({ createdAt: firstItem.createdAt.toISOString(), id: firstItem.id });

    return {
      data,
      nextCursor,
      prevCursor,
      hasMore,
      hasPrevious: input.after !== undefined || input.before !== undefined,
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
      "premiumTier?": "'premium' | 'premium2'",
      "premiumExpiresAt?": "string",
    }),
  )
  .handler(async ({ input }) => {
    const existingUser = await adminUserRepo.getById({ id: input.id });

    if (!existingUser) {
      throw new ORPCError("NOT_FOUND", {
        message: "User tidak ditemukan",
      });
    }

    const updatedUser = await adminUserRepo.updatePremium({
      id: input.id,
      data: {
        isPremium: input.isPremium,
        premiumTier: input.isPremium ? (input.premiumTier ?? PREMIUM_TIERS.PREMIUM) : null,
        premiumExpiresAt: input.premiumExpiresAt ? new Date(input.premiumExpiresAt) : null,
      },
    });

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
      premiumTier: updatedUser.premiumTier,
      premiumExpiresAt: updatedUser.premiumExpiresAt,
    };
  });

export const adminUserRouter = {
  list: listUsers,
  premium: { update: updateUserPremium },
};
