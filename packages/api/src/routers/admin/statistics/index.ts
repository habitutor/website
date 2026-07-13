import { type } from "arktype";
import { PERINTIS_2027 } from "../../../lib/constants";
import { transactionRepo } from "../../transaction/repo";
import { admin } from "../../../index";
import { adminMetricsRepo } from "./metrics-repo";
import { adminStatisticsRepo } from "./repo";

const get = admin
  .route({
    path: "/admin/statistics",
    method: "GET",
    tags: ["Admin - Statistics"],
  })
  .handler(async () => {
    return adminStatisticsRepo.getStats({});
  });

const businessOverview = admin
  .route({
    path: "/admin/statistics/business-overview",
    method: "GET",
    tags: ["Admin - Statistics"],
  })
  .handler(async () => {
    return adminMetricsRepo.getBusinessOverview({});
  });

const timeSeries = admin
  .route({
    path: "/admin/statistics/time-series",
    method: "GET",
    tags: ["Admin - Statistics"],
  })
  .input(
    type({
      "days?": "number",
    }),
  )
  .handler(async ({ input }) => {
    const days = Math.min(Math.max(input.days ?? 30, 7), 365);
    return adminMetricsRepo.getTimeSeries({ days });
  });

const audienceInsights = admin
  .route({
    path: "/admin/statistics/audience-insights",
    method: "GET",
    tags: ["Admin - Statistics"],
  })
  .handler(async () => {
    return adminMetricsRepo.getAudienceInsights({});
  });

const perintisEarlyBird = admin
  .route({
    path: "/admin/statistics/perintis-early-bird",
    method: "GET",
    tags: ["Admin - Statistics"],
  })
  .handler(async () => {
    const soldCount = await transactionRepo.countSuccessfulTransactionsBySlug({ slug: PERINTIS_2027.SLUG });
    const slotsClaimed = soldCount;
    const slotsRemaining = Math.max(PERINTIS_2027.EARLY_BIRD_QUOTA - soldCount, 0);

    return {
      totalSlots: PERINTIS_2027.EARLY_BIRD_QUOTA,
      slotsClaimed,
      slotsRemaining,
      isActive: slotsRemaining > 0,
      earlyBirdPrice: PERINTIS_2027.EARLY_BIRD_PRICE,
      regularPrice: PERINTIS_2027.REGULAR_PRICE,
    };
  });

export const adminStatisticsRouter = {
  stats: get,
  businessOverview,
  timeSeries,
  audienceInsights,
  perintisEarlyBird,
};
