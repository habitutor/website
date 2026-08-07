import type { DrizzleDatabase } from "@habitutor/db";
import type { groupBuy } from "@habitutor/db/schema/group-buy";
import { PREMIUM_TIERS } from "@habitutor/shared/auth-domain";
import { logger } from "@habitutor/shared/logger";
import { Resend } from "resend";
import { SNBT_2027_DEADLINE } from "../../lib/constants";
import { generateGroupBuyExpiredEmail } from "../../lib/templates/group-buy-expired";
import { transactionRepo } from "../transaction/repo";
import { groupBuyRepo } from "./repo";

type GroupBuyRow = typeof groupBuy.$inferSelect;

let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY || "Re_api_key");
  }
  return resendClient;
}

function grantPerintisPremium(trx: DrizzleDatabase, userId: string) {
  return transactionRepo.updateUserPremium({
    db: trx,
    userId,
    isPremium: true,
    premiumTier: PREMIUM_TIERS.PREMIUM,
    premiumExpiresAt: SNBT_2027_DEADLINE,
  });
}

// Runs inside the same DB transaction as markTransactionAsSuccess so a seat
// settlement, the member state change, and any premium grants commit
// atomically. Group-buy products are type "product", so the generic
// subscription premium grant never fires for them — access is exclusively
// managed here.
export async function applyGroupBuySettlement({
  db: trx,
  orderId,
  paidAt,
}: {
  db: DrizzleDatabase;
  orderId: string;
  paidAt: Date;
}) {
  const seatMember = await groupBuyRepo.getMemberBySeatTransactionId({ db: trx, transactionId: orderId, lock: true });

  if (seatMember) {
    // The group row lock serializes concurrent seat settlements so the
    // "all members paid" check can never miss the completion transition.
    const group = await groupBuyRepo.getGroupById({ db: trx, id: seatMember.groupBuyId, lock: true });
    if (!group) return;

    if (seatMember.status === "pending_payment") {
      await groupBuyRepo.markMemberPaid({ db: trx, memberId: seatMember.id, paidAt });
    }

    if (group.status === "completed") {
      // A seat that settles after the group already completed still gets
      // premium — the member paid and the group succeeded.
      await grantPerintisPremium(trx, seatMember.userId);
      return;
    }

    // Expired group: the member stays "paid" and resolves via top-up/refund.
    if (group.status !== "active") return;

    const paidMembers = await groupBuyRepo.getPaidMembers({ db: trx, groupBuyId: group.id });
    if (paidMembers.length >= group.requiredMembers) {
      await groupBuyRepo.updateGroupStatus({
        db: trx,
        id: group.id,
        status: "completed",
        completedAt: new Date(),
        onlyIfCurrentStatus: "active",
      });
      for (const member of paidMembers) {
        await grantPerintisPremium(trx, member.userId);
      }
      logger.info("Group buy completed, premium granted to all members", {
        groupBuyId: group.id,
        memberCount: paidMembers.length,
      });
    }
    return;
  }

  const topupMember = await groupBuyRepo.getMemberByTopupTransactionId({
    db: trx,
    transactionId: orderId,
    lock: true,
  });
  if (topupMember) {
    await groupBuyRepo.markMemberUpgraded({ db: trx, memberId: topupMember.id });
    await grantPerintisPremium(trx, topupMember.userId);
  }
}

async function notifyGroupExpired(group: GroupBuyRow) {
  try {
    const members = await groupBuyRepo.getMembersWithUsers({ groupBuyId: group.id });
    const paidMembers = members.filter(({ member }) => member.status === "paid");
    const seatPrice = Number(group.seatPrice);
    const topupAmount = Number(group.fullPrice) - seatPrice;
    const groupPageUrl = `${process.env.CORS_ORIGIN}/group-buy`;

    await Promise.all(
      paidMembers.map(({ userName, userEmail }) =>
        getResend().emails.send({
          from: "Habitutor <noreply@habitutor.id>",
          to: userEmail,
          subject: "Grup patungan kamu belum terisi penuh — pilih opsi kamu",
          html: generateGroupBuyExpiredEmail({ userName, seatPrice, topupAmount, groupPageUrl }),
        }),
      ),
    );

    await groupBuyRepo.markGroupExpiredNotified({ id: group.id });
  } catch (error) {
    logger.error("Failed to notify expired group buy members", { groupBuyId: group.id, error });
  }
}

export async function expireGroupBuy(groupId: string) {
  const expired = await groupBuyRepo.updateGroupStatus({
    id: groupId,
    status: "expired",
    onlyIfCurrentStatus: "active",
  });
  if (!expired) return null;

  logger.info("Group buy expired", { groupBuyId: groupId });
  await notifyGroupExpired(expired);

  return expired;
}

// Reads can race the background sweep by a few minutes, so any endpoint that
// returns group state first settles an overdue "active" group into "expired".
export async function resolveGroupFreshness(group: GroupBuyRow) {
  if (group.status !== "active" || group.expiresAt.getTime() > Date.now()) {
    return group;
  }

  const expired = await expireGroupBuy(group.id);
  if (expired) return expired;

  return (await groupBuyRepo.getGroupById({ id: group.id })) ?? group;
}

export async function expireDueGroupBuys() {
  const dueGroups = await groupBuyRepo.getDueActiveGroups({ now: new Date() });

  let expired = 0;
  for (const group of dueGroups) {
    try {
      const result = await expireGroupBuy(group.id);
      if (result) expired += 1;
    } catch (error) {
      logger.error("Failed to expire group buy", { groupBuyId: group.id, error });
    }
  }

  if (dueGroups.length > 0) {
    logger.info("Expired due group buys", { checked: dueGroups.length, expired });
  }

  return { checked: dueGroups.length, expired };
}
