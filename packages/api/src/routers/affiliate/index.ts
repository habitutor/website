import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { admin, authed, authedRateLimited } from "../..";
import { notifyUser } from "../notification/service";
import { AFFILIATE } from "./logic";
import { AffiliateError, affiliateRepo } from "./repo";

/** Ubah galat bisnis menjadi galat oRPC dengan kode yang tepat. */
async function run<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof AffiliateError) throw new ORPCError(error.code, { message: error.message });
    throw error;
  }
}

const rules = authed
  .route({ path: "/affiliate/rules", method: "GET", tags: ["Affiliate"] })
  .handler(() => ({
    buyerDiscountPercent: AFFILIATE.BUYER_DISCOUNT_PERCENT,
    commissionPercent: AFFILIATE.COMMISSION_PERCENT,
    holdDays: AFFILIATE.HOLD_DAYS,
    minPayout: AFFILIATE.MIN_PAYOUT,
  }));

const overview = authed
  .route({ path: "/affiliate/overview", method: "GET", tags: ["Affiliate"] })
  .handler(({ context }) => affiliateRepo.getOverview({ userId: context.session.user.id }));

/** Dipakai halaman Premium untuk menampilkan harga setelah diskon sebelum pengguna membayar. */
const discount = authed
  .route({ path: "/affiliate/discount", method: "GET", tags: ["Affiliate"] })
  .handler(({ context }) =>
    run(async () => {
      const record = await affiliateRepo.resolveDiscount({ userId: context.session.user.id });
      return { eligible: Boolean(record), code: record?.code ?? null, percent: AFFILIATE.BUYER_DISCOUNT_PERCENT };
    }),
  );

const refreshCode = authedRateLimited
  .route({ path: "/affiliate/refresh-code", method: "POST", tags: ["Affiliate"] })
  .handler(({ context }) =>
    run(async () => {
      const row = await affiliateRepo.refreshLegacyCode({ userId: context.session.user.id });
      return { code: row.code };
    }),
  );

const requestPayout = authedRateLimited
  .route({ path: "/affiliate/payouts", method: "POST", tags: ["Affiliate"] })
  .input(
    type({
      amount: "number.integer",
      bankName: "string",
      accountNumber: "string",
      accountName: "string",
    }),
  )
  .handler(({ input, context }) =>
    run(async () => {
      const payout = await affiliateRepo.requestPayout({ userId: context.session.user.id, ...input });
      return { id: payout?.id };
    }),
  );

// ---------------------------------------------------------------- admin
const adminSummary = admin
  .route({ path: "/admin/affiliate/summary", method: "GET", tags: ["Admin - Affiliate"] })
  .handler(() => affiliateRepo.adminSummary());

const adminAffiliates = admin
  .route({ path: "/admin/affiliate/affiliates", method: "GET", tags: ["Admin - Affiliate"] })
  .handler(() => affiliateRepo.adminAffiliates());

const adminPayouts = admin
  .route({ path: "/admin/affiliate/payouts", method: "GET", tags: ["Admin - Affiliate"] })
  .input(type({ "status?": "'requested' | 'paid' | 'rejected'" }))
  .handler(({ input }) => affiliateRepo.adminPayouts({ status: input.status }));

const adminPayoutPaid = admin
  .route({ path: "/admin/affiliate/payouts/{id}/paid", method: "POST", tags: ["Admin - Affiliate"] })
  .input(type({ id: "string", reference: "string" }))
  .handler(({ input, context }) =>
    run(async () => {
      const payout = await affiliateRepo.processPayout({
        id: input.id,
        adminId: context.session.user.id,
        outcome: "paid",
        reference: input.reference,
      });
      await notifyUser({
        userId: payout.userId,
        type: "system",
        title: "Pencairan komisi sudah ditransfer",
        body: `Rp${payout.amount.toLocaleString("id-ID")} sudah ditransfer ke rekeningmu. Cek mutasi ya.`,
      }).catch(() => {});
      return { id: payout.id };
    }),
  );

const adminPayoutRejected = admin
  .route({ path: "/admin/affiliate/payouts/{id}/reject", method: "POST", tags: ["Admin - Affiliate"] })
  .input(type({ id: "string", note: "string" }))
  .handler(({ input, context }) =>
    run(async () => {
      const payout = await affiliateRepo.processPayout({
        id: input.id,
        adminId: context.session.user.id,
        outcome: "rejected",
        note: input.note,
      });
      await notifyUser({
        userId: payout.userId,
        type: "system",
        title: "Pencairan komisi ditolak",
        body: `${payout.note}. Saldomu dikembalikan, kamu bisa mengajukan lagi.`,
      }).catch(() => {});
      return { id: payout.id };
    }),
  );

export const affiliateRouter = { rules, overview, discount, requestPayout, refreshCode };

export const adminAffiliateRouter = {
  summary: adminSummary,
  affiliates: adminAffiliates,
  payouts: adminPayouts,
  markPaid: adminPayoutPaid,
  reject: adminPayoutRejected,
};
