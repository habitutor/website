import { db } from "@habitutor/db";
import type { groupBuy, groupBuyMember } from "@habitutor/db/schema/group-buy";
import { logger } from "@habitutor/shared/logger";
import { type } from "arktype";
import { authed, pub } from "../../index";
import { GROUP_BUY, SNBT_2027_DEADLINE } from "../../lib/constants";
import { createSubscriptionTransaction } from "../../lib/midtrans";
import { transactionRepo } from "../transaction/repo";
import { resolveGroupFreshness } from "./lifecycle";
import { generateInviteCode, groupBuyRepo } from "./repo";

type GroupBuyRow = typeof groupBuy.$inferSelect;
type GroupBuyMemberRow = typeof groupBuyMember.$inferSelect;

const GROUP_BUY_CALLBACK_PATHS = {
  finish: "/group-buy",
  error: "/group-buy",
  pending: "/group-buy",
} as const;

type SessionUser = { id: string; name: string; email: string };

async function createSeatPayment({
  orderId,
  sessionUser,
  grossAmount,
}: {
  orderId: string;
  sessionUser: SessionUser;
  grossAmount: number;
}) {
  return createSubscriptionTransaction({
    id: orderId,
    name: GROUP_BUY.SEAT_NAME,
    grossAmount,
    session: { user: { name: sessionUser.name, email: sessionUser.email } },
    callbackPaths: GROUP_BUY_CALLBACK_PATHS,
  });
}

function serializeGroupState({
  group,
  members,
  viewerUserId,
}: {
  group: GroupBuyRow;
  members: { member: GroupBuyMemberRow; userName: string; userEmail: string }[];
  viewerUserId?: string;
}) {
  const paidStatuses = new Set(["paid", "upgraded", "refund_requested", "refunded"]);
  const paidCount = members.filter(({ member }) => paidStatuses.has(member.status)).length;
  const viewerEntry = viewerUserId ? members.find(({ member }) => member.userId === viewerUserId) : undefined;

  return {
    inviteCode: group.inviteCode,
    status: group.status,
    requiredMembers: group.requiredMembers,
    seatPrice: Number(group.seatPrice),
    fullPrice: Number(group.fullPrice),
    topupAmount: Number(group.fullPrice) - Number(group.seatPrice),
    paidCount,
    memberCount: members.length,
    createdAt: group.createdAt,
    expiresAt: group.expiresAt,
    completedAt: group.completedAt,
    members: members.map(({ member, userName }) => ({
      name: userName,
      isCreator: member.userId === group.creatorUserId,
      hasPaid: paidStatuses.has(member.status),
    })),
    viewer: viewerEntry
      ? {
          memberStatus: viewerEntry.member.status,
          isCreator: viewerEntry.member.userId === group.creatorUserId,
          paidAt: viewerEntry.member.paidAt,
          refundRequestedAt: viewerEntry.member.refundRequestedAt,
        }
      : null,
  };
}

// A user can only be tied to one unresolved group at a time: an active group,
// or an expired group where their paid seat still awaits top-up/refund.
async function findBlockingMembership(userId: string) {
  const memberships = await groupBuyRepo.getMembershipsByUser({ userId });

  for (const entry of memberships) {
    const group = await resolveGroupFreshness(entry.group);
    if (group.status === "active") return { ...entry, group };
    if (group.status === "expired" && entry.member.status === "paid") return { ...entry, group };
  }

  return null;
}

function assertCanPurchase(context: { session: { user: { isPremium?: boolean | null } } }, errors: GroupBuyErrors) {
  if (context.session.user.isPremium) {
    throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah menjadi member premium." });
  }
  if (Date.now() > SNBT_2027_DEADLINE.getTime()) {
    throw errors.UNPROCESSABLE_CONTENT({ message: "Produk premium tidak tersedia lagi." });
  }
}

type GroupBuyErrors = {
  UNPROCESSABLE_CONTENT: (options?: { message?: string }) => Error;
  NOT_FOUND: (options?: { message?: string }) => Error;
  CONFLICT: (options?: { message?: string }) => Error;
  INTERNAL_SERVER_ERROR: (options?: { message?: string }) => Error;
};

const start = authed
  .route({
    path: "/group-buy/start",
    method: "POST",
    tags: ["Payment", "Group Buy"],
  })
  .output(
    type({
      token: "string",
      redirectUrl: "string",
      orderId: "string",
      inviteCode: "string",
    }),
  )
  .handler(async ({ context, errors }) => {
    assertCanPurchase(context, errors);

    const existing = await findBlockingMembership(context.session.user.id);
    if (existing) {
      throw errors.CONFLICT({
        message:
          existing.group.status === "active"
            ? "Kamu sudah punya grup patungan yang aktif."
            : "Kamu masih punya grup patungan yang perlu diselesaikan.",
      });
    }

    const seatProduct = await transactionRepo.getProductBySlug({ slug: GROUP_BUY.SEAT_SLUG });
    if (!seatProduct) throw errors.NOT_FOUND({ message: "Produk tidak ditemukan." });

    const orderId = `tx_${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + GROUP_BUY.WINDOW_HOURS * 60 * 60 * 1000);

    const created = await db.transaction(async (trx) => {
      const group = await groupBuyRepo.createGroup({
        db: trx,
        inviteCode: generateInviteCode(),
        creatorUserId: context.session.user.id,
        productId: seatProduct.id,
        seatPrice: String(GROUP_BUY.SEAT_PRICE),
        fullPrice: String(GROUP_BUY.FULL_PRICE),
        requiredMembers: GROUP_BUY.REQUIRED_MEMBERS,
        expiresAt,
      });
      if (!group) return null;

      const tx = await transactionRepo.createTransaction({
        db: trx,
        id: orderId,
        productId: seatProduct.id,
        grossAmount: String(GROUP_BUY.SEAT_PRICE),
        userId: context.session.user.id,
      });
      if (!tx) return null;

      const member = await groupBuyRepo.createMember({
        db: trx,
        groupBuyId: group.id,
        userId: context.session.user.id,
        transactionId: orderId,
      });
      if (!member) return null;

      return { group };
    });

    if (!created) throw errors.INTERNAL_SERVER_ERROR({ message: "Gagal membuat grup. Silahkan coba lagi." });

    let payment: Awaited<ReturnType<typeof createSeatPayment>>;
    try {
      payment = await createSeatPayment({
        orderId,
        sessionUser: context.session.user,
        grossAmount: GROUP_BUY.SEAT_PRICE,
      });
    } catch (error) {
      await transactionRepo.updateTransactionStatus({ orderId, status: "failed" });
      logger.error("Failed to create Midtrans transaction for group buy start", {
        orderId,
        userId: context.session.user.id,
        error,
      });
      throw error;
    }

    return {
      ...payment,
      orderId,
      inviteCode: created.group.inviteCode,
    };
  });

const join = authed
  .route({
    path: "/group-buy/join",
    method: "POST",
    tags: ["Payment", "Group Buy"],
  })
  .input(type({ inviteCode: "string" }))
  .output(
    type({
      token: "string",
      redirectUrl: "string",
      orderId: "string",
      inviteCode: "string",
    }),
  )
  .handler(async ({ input, context, errors }) => {
    assertCanPurchase(context, errors);

    const inviteCode = input.inviteCode.trim().toUpperCase();
    let group = await groupBuyRepo.getGroupByInviteCode({ inviteCode });
    if (!group) throw errors.NOT_FOUND({ message: "Grup patungan tidak ditemukan." });

    group = await resolveGroupFreshness(group);
    if (group.status === "completed") {
      throw errors.UNPROCESSABLE_CONTENT({ message: "Grup patungan ini sudah penuh dan selesai." });
    }
    if (group.status === "expired") {
      throw errors.UNPROCESSABLE_CONTENT({ message: "Grup patungan ini sudah kedaluwarsa." });
    }

    const existingMember = await groupBuyRepo.getMemberByGroupAndUser({
      groupBuyId: group.id,
      userId: context.session.user.id,
    });
    if (existingMember) {
      throw errors.CONFLICT({ message: "Kamu sudah tergabung di grup ini." });
    }

    const blocking = await findBlockingMembership(context.session.user.id);
    if (blocking) {
      throw errors.CONFLICT({
        message:
          blocking.group.status === "active"
            ? "Kamu sudah punya grup patungan yang aktif."
            : "Kamu masih punya grup patungan yang perlu diselesaikan.",
      });
    }

    const orderId = `tx_${crypto.randomUUID()}`;

    const created = await db.transaction(async (trx) => {
      // Lock the group row so two people can't take the last seat at once.
      const lockedGroup = await groupBuyRepo.getGroupById({ db: trx, id: group.id, lock: true });
      if (!lockedGroup || lockedGroup.status !== "active" || lockedGroup.expiresAt.getTime() <= Date.now()) {
        return { error: "expired" as const };
      }

      const memberCount = await groupBuyRepo.countMembers({ db: trx, groupBuyId: lockedGroup.id });
      if (memberCount >= lockedGroup.requiredMembers) {
        return { error: "full" as const };
      }

      const tx = await transactionRepo.createTransaction({
        db: trx,
        id: orderId,
        productId: lockedGroup.productId,
        grossAmount: lockedGroup.seatPrice,
        userId: context.session.user.id,
      });
      if (!tx) return null;

      const member = await groupBuyRepo.createMember({
        db: trx,
        groupBuyId: lockedGroup.id,
        userId: context.session.user.id,
        transactionId: orderId,
      });
      if (!member) return null;

      return { group: lockedGroup };
    });

    if (!created) throw errors.INTERNAL_SERVER_ERROR({ message: "Gagal bergabung ke grup. Silahkan coba lagi." });
    if ("error" in created) {
      throw errors.UNPROCESSABLE_CONTENT({
        message: created.error === "full" ? "Grup patungan ini sudah penuh." : "Grup patungan ini sudah kedaluwarsa.",
      });
    }

    let payment: Awaited<ReturnType<typeof createSeatPayment>>;
    try {
      payment = await createSeatPayment({
        orderId,
        sessionUser: context.session.user,
        grossAmount: Number(created.group.seatPrice),
      });
    } catch (error) {
      await transactionRepo.updateTransactionStatus({ orderId, status: "failed" });
      logger.error("Failed to create Midtrans transaction for group buy join", {
        orderId,
        userId: context.session.user.id,
        error,
      });
      throw error;
    }

    return {
      ...payment,
      orderId,
      inviteCode: created.group.inviteCode,
    };
  });

// Re-issues a payment for an existing unpaid seat (e.g. the Snap popup was
// closed or a previous attempt failed/expired at the gateway).
const retryPayment = authed
  .route({
    path: "/group-buy/retry-payment",
    method: "POST",
    tags: ["Payment", "Group Buy"],
  })
  .output(
    type({
      token: "string",
      redirectUrl: "string",
      orderId: "string",
      inviteCode: "string",
    }),
  )
  .handler(async ({ context, errors }) => {
    assertCanPurchase(context, errors);

    const memberships = await groupBuyRepo.getMembershipsByUser({ userId: context.session.user.id });
    let target: { member: GroupBuyMemberRow; group: GroupBuyRow } | null = null;
    for (const entry of memberships) {
      const group = await resolveGroupFreshness(entry.group);
      if (group.status === "active" && entry.member.status === "pending_payment") {
        target = { member: entry.member, group };
        break;
      }
    }

    if (!target) {
      throw errors.NOT_FOUND({ message: "Tidak ada tagihan grup patungan yang menunggu pembayaran." });
    }
    const targetEntry = target;

    const orderId = `tx_${crypto.randomUUID()}`;

    const created = await db.transaction(async (trx) => {
      const tx = await transactionRepo.createTransaction({
        db: trx,
        id: orderId,
        productId: targetEntry.group.productId,
        grossAmount: targetEntry.group.seatPrice,
        userId: context.session.user.id,
      });
      if (!tx) return null;

      await groupBuyRepo.updateMemberSeatTransaction({
        db: trx,
        memberId: targetEntry.member.id,
        transactionId: orderId,
      });
      return { group: targetEntry.group };
    });

    if (!created) throw errors.INTERNAL_SERVER_ERROR({ message: "Gagal membuat transaksi. Silahkan coba lagi." });

    let payment: Awaited<ReturnType<typeof createSeatPayment>>;
    try {
      payment = await createSeatPayment({
        orderId,
        sessionUser: context.session.user,
        grossAmount: Number(created.group.seatPrice),
      });
    } catch (error) {
      await transactionRepo.updateTransactionStatus({ orderId, status: "failed" });
      logger.error("Failed to create Midtrans transaction for group buy retry", {
        orderId,
        userId: context.session.user.id,
        error,
      });
      throw error;
    }

    return {
      ...payment,
      orderId,
      inviteCode: created.group.inviteCode,
    };
  });

// Public so the invite landing page works before login; viewer info is only
// filled in when a session is present.
const get = pub
  .route({
    path: "/group-buy/{inviteCode}",
    method: "GET",
    tags: ["Group Buy"],
  })
  .input(type({ inviteCode: "string" }))
  .handler(async ({ input, context, errors }) => {
    const inviteCode = input.inviteCode.trim().toUpperCase();
    let group = await groupBuyRepo.getGroupByInviteCode({ inviteCode });
    if (!group) throw errors.NOT_FOUND({ message: "Grup patungan tidak ditemukan." });

    group = await resolveGroupFreshness(group);
    const members = await groupBuyRepo.getMembersWithUsers({ groupBuyId: group.id });

    return serializeGroupState({ group, members, viewerUserId: context.session?.user.id });
  });

const mine = authed
  .route({
    path: "/group-buy/mine",
    method: "GET",
    tags: ["Group Buy"],
  })
  .handler(async ({ context }) => {
    const memberships = await groupBuyRepo.getMembershipsByUser({ userId: context.session.user.id });
    const newest = memberships[0];
    if (!newest) return null;

    let selected: { member: GroupBuyMemberRow; group: GroupBuyRow } | null = null;
    for (const entry of memberships) {
      const group = await resolveGroupFreshness(entry.group);
      const refreshed = { member: entry.member, group };

      if (group.status === "active") {
        selected = refreshed;
        break;
      }
      // An unresolved paid seat (expired group) or a pending refund keeps
      // priority over older finished groups.
      if (
        !selected &&
        group.status === "expired" &&
        (entry.member.status === "paid" || entry.member.status === "refund_requested")
      ) {
        selected = refreshed;
      }
      if (!selected && group.status === "completed") {
        selected = refreshed;
      }
    }

    const target = selected ?? {
      member: newest.member,
      group: await resolveGroupFreshness(newest.group),
    };

    const members = await groupBuyRepo.getMembersWithUsers({ groupBuyId: target.group.id });
    return serializeGroupState({ group: target.group, members, viewerUserId: context.session.user.id });
  });

const payDifference = authed
  .route({
    path: "/group-buy/pay-difference",
    method: "POST",
    tags: ["Payment", "Group Buy"],
  })
  .output(
    type({
      token: "string",
      redirectUrl: "string",
      orderId: "string",
    }),
  )
  .handler(async ({ context, errors }) => {
    assertCanPurchase(context, errors);

    const blocking = await findBlockingMembership(context.session.user.id);
    if (!blocking || blocking.group.status !== "expired" || blocking.member.status !== "paid") {
      throw errors.NOT_FOUND({ message: "Tidak ada grup patungan yang bisa dilunasi." });
    }

    const topupProduct = await transactionRepo.getProductBySlug({ slug: GROUP_BUY.TOPUP_SLUG });
    if (!topupProduct) throw errors.NOT_FOUND({ message: "Produk tidak ditemukan." });

    const topupAmount = Number(blocking.group.fullPrice) - Number(blocking.group.seatPrice);
    const orderId = `tx_${crypto.randomUUID()}`;

    const created = await db.transaction(async (trx) => {
      const tx = await transactionRepo.createTransaction({
        db: trx,
        id: orderId,
        productId: topupProduct.id,
        grossAmount: String(topupAmount),
        userId: context.session.user.id,
      });
      if (!tx) return null;

      await groupBuyRepo.updateMemberTopupTransaction({
        db: trx,
        memberId: blocking.member.id,
        topupTransactionId: orderId,
      });
      return true;
    });

    if (!created) throw errors.INTERNAL_SERVER_ERROR({ message: "Gagal membuat transaksi. Silahkan coba lagi." });

    let payment: Awaited<ReturnType<typeof createSubscriptionTransaction>>;
    try {
      payment = await createSubscriptionTransaction({
        id: orderId,
        name: GROUP_BUY.TOPUP_NAME,
        grossAmount: topupAmount,
        session: context.session,
        callbackPaths: GROUP_BUY_CALLBACK_PATHS,
      });
    } catch (error) {
      await transactionRepo.updateTransactionStatus({ orderId, status: "failed" });
      logger.error("Failed to create Midtrans transaction for group buy top-up", {
        orderId,
        userId: context.session.user.id,
        error,
      });
      throw error;
    }

    return {
      ...payment,
      orderId,
    };
  });

const requestRefund = authed
  .route({
    path: "/group-buy/request-refund",
    method: "POST",
    tags: ["Payment", "Group Buy"],
  })
  .input(
    type({
      bankName: "1 <= string <= 100",
      accountNumber: "1 <= string <= 50",
      accountHolder: "1 <= string <= 100",
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const blocking = await findBlockingMembership(context.session.user.id);
    if (!blocking || blocking.group.status !== "expired" || blocking.member.status !== "paid") {
      throw errors.NOT_FOUND({ message: "Tidak ada grup patungan yang bisa direfund." });
    }

    const updated = await groupBuyRepo.requestMemberRefund({
      memberId: blocking.member.id,
      bankName: input.bankName.trim(),
      accountNumber: input.accountNumber.trim(),
      accountHolder: input.accountHolder.trim(),
    });
    if (!updated) throw errors.UNPROCESSABLE_CONTENT({ message: "Permintaan refund tidak dapat diproses." });

    return { status: "refund_requested" as const };
  });

export const groupBuyRouter = {
  start,
  join,
  retryPayment,
  get,
  mine,
  payDifference,
  requestRefund,
};
