import { type } from "arktype";
import { admin } from "../../../index";
import { groupBuyRepo } from "../../group-buy/repo";

const listGroups = admin
  .route({
    path: "/admin/group-buys",
    method: "GET",
    tags: ["Admin - Group Buys"],
  })
  .input(
    type({
      "status?": "'active' | 'completed' | 'expired'",
      "page?": "number >= 1",
      "limit?": "1 <= number <= 50",
    }),
  )
  .handler(async ({ input }) => {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;

    const { rows, total } = await groupBuyRepo.adminListGroups({ status: input.status, page, limit });
    const paidCounts = await groupBuyRepo.adminCountPaidMembersByGroups({
      groupBuyIds: rows.map((row) => row.group.id),
    });
    const paidCountByGroup = new Map(paidCounts.map((entry) => [entry.groupBuyId, entry.paidCount]));

    return {
      data: rows.map((row) => ({
        id: row.group.id,
        inviteCode: row.group.inviteCode,
        status: row.group.status,
        creatorName: row.creatorName,
        creatorEmail: row.creatorEmail,
        memberCount: row.memberCount,
        paidCount: paidCountByGroup.get(row.group.id) ?? 0,
        requiredMembers: row.group.requiredMembers,
        seatPrice: Number(row.group.seatPrice),
        fullPrice: Number(row.group.fullPrice),
        createdAt: row.group.createdAt,
        expiresAt: row.group.expiresAt,
        completedAt: row.group.completedAt,
      })),
      total,
      page,
      limit,
    };
  });

const listRefunds = admin
  .route({
    path: "/admin/group-buys/refunds",
    method: "GET",
    tags: ["Admin - Group Buys"],
  })
  .input(
    type({
      "status?": "'refund_requested' | 'refunded'",
      "page?": "number >= 1",
      "limit?": "1 <= number <= 50",
    }),
  )
  .handler(async ({ input }) => {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;

    const { rows, total } = await groupBuyRepo.adminListRefundRequests({
      status: input.status ?? "refund_requested",
      page,
      limit,
    });

    return {
      data: rows.map((row) => ({
        memberId: row.member.id,
        status: row.member.status,
        userName: row.userName,
        userEmail: row.userEmail,
        userPhoneNumber: row.userPhoneNumber,
        inviteCode: row.inviteCode,
        refundAmount: Number(row.seatPrice),
        bankName: row.member.refundBankName,
        accountNumber: row.member.refundAccountNumber,
        accountHolder: row.member.refundAccountHolder,
        paidAt: row.member.paidAt,
        refundRequestedAt: row.member.refundRequestedAt,
        refundedAt: row.member.refundedAt,
      })),
      total,
      page,
      limit,
    };
  });

const markRefunded = admin
  .route({
    path: "/admin/group-buys/refunds/{memberId}/mark-refunded",
    method: "POST",
    tags: ["Admin - Group Buys"],
  })
  .input(type({ memberId: "string" }))
  .handler(async ({ input, errors }) => {
    const updated = await groupBuyRepo.markMemberRefunded({ memberId: input.memberId });
    if (!updated) {
      throw errors.NOT_FOUND({ message: "Permintaan refund tidak ditemukan atau sudah diproses." });
    }

    return { status: "refunded" as const, refundedAt: updated.refundedAt };
  });

export const adminGroupBuyRouter = {
  listGroups,
  listRefunds,
  markRefunded,
};
