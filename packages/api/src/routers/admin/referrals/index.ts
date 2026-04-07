import { type } from "arktype";
import { admin } from "../../../index";
import { cursor } from "../../../utils/cursor";
import { referralRepo } from "../../referral/repo";

export type { CursorData } from "../../../utils/cursor";

const listReferralTransactions = admin
  .route({
    path: "/admin/referrals/transactions",
    method: "GET",
    tags: ["Admin - Referrals"],
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
    const search = input.search?.trim() ?? "";

    const afterData = input.after ? cursor.decode(input.after) : null;
    const afterCreatedAt = afterData ? new Date(afterData.createdAt) : null;

    const beforeData = input.before ? cursor.decode(input.before) : null;
    const beforeCreatedAt = beforeData ? new Date(beforeData.createdAt) : null;

    const rows = await referralRepo.listAdminReferralTransactions({
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
    const nextCursor = hasMore
      ? cursor.encode({ createdAt: lastItem.usedAt.toISOString(), id: lastItem.usageId })
      : null;
    const prevCursor = cursor.encode({ createdAt: firstItem.usedAt.toISOString(), id: firstItem.usageId });

    return {
      data,
      nextCursor,
      prevCursor,
      hasMore,
      hasPrevious: input.after !== undefined || input.before !== undefined,
    };
  });

export const adminReferralRouter = {
  listReferralTransactions,
};
