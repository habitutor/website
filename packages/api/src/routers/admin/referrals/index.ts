import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { admin } from "../../../index";
import { referralRepo } from "../../referral/repo";

export interface CursorData {
  createdAt: string;
  id: string;
}

export function encodeCursor(data: CursorData): string {
  return Buffer.from(JSON.stringify(data)).toString("base64url");
}

export function decodeCursor(cursor: string): CursorData {
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
      "page?": "number",
      "cursor?": "string",
      "search?": "string",
    }),
  )
  .handler(async ({ input }) => {
    const limit = Math.min(input.limit || 10, 50);
    const search = input.search?.trim() ?? "";

    const page = input.page ? Math.max(1, Math.floor(input.page)) : null;
    const cursorData = !page && input.cursor ? decodeCursor(input.cursor) : null;
    const cursorCreatedAt = cursorData ? new Date(cursorData.createdAt) : null;
    const total = page ? await referralRepo.countAdminReferralTransactions({ search }) : null;

    const rows = await referralRepo.listAdminReferralTransactions({
      limit,
      offset: page ? (page - 1) * limit : 0,
      cursorCreatedAt,
      cursorId: cursorData?.id ?? null,
      search,
    });

    if (rows.length === 0) {
      return {
        data: [],
        nextCursor: null,
        hasMore: false,
        total: total ?? 0,
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
      total: total ?? data.length,
    };
  });

export const adminReferralRouter = {
  listReferralTransactions,
};
