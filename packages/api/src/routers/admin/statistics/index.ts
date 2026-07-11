import { type } from "arktype";
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

export const adminStatisticsRouter = {
  stats: get,
  businessOverview,
  timeSeries,
  audienceInsights,
};
