import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { admin } from "../../../index";
import { referralRepo } from "../../referral/repo";

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

const listReferralTransactions = admin
  .route({
    path: "/admin/referrals/transactions",
    method: "GET",
    tags: ["Admin - Referrals"],
  })
  .input(
    type({
      "limit?": "number",
      "cursor?": "string",
      "search?": "string",
    }),
  )
  .handler(async ({ input }) => {
    const limit = Math.min(input.limit || 10, 50);
    const search = input.search?.trim() ?? "";

    const cursorData = input.cursor ? decodeCursor(input.cursor) : null;
    const cursorCreatedAt = cursorData ? new Date(cursorData.createdAt) : null;

    const rows = await referralRepo.listAdminReferralTransactions({
      limit,
      cursorCreatedAt,
      cursorId: cursorData?.id ?? null,
      search,
    });

    if (rows.length === 0) {
      return {
        data: [],
        nextCursor: null,
        hasMore: false,
      };
    }

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;

    const lastItem = data[data.length - 1];
    const nextCursor =
      hasMore && lastItem
        ? encodeCursor({
            createdAt: lastItem.usedAt.toISOString(),
            id: lastItem.usageId,
          })
        : null;

    return {
      data,
      nextCursor,
      hasMore,
    };
  });

export const adminReferralRouter = {
  listReferralTransactions,
};
