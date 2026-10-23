import { type } from "arktype";
import { FREEMIUM_PEMBAHASAN_PRODUCT, FREEMIUM_PRODUCT, PREMIUM_PROMO_ENDS_AT } from "../../../lib/constants";
import { isPromoActive, listPremiumPackages } from "../../transaction/pricing";
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

const premiumPackageSales = admin
  .route({
    path: "/admin/statistics/premium-package-sales",
    method: "GET",
    tags: ["Admin - Statistics"],
  })
  .handler(async () => {
    const packages = await Promise.all(
      listPremiumPackages().map(async (pkg) => ({
        slug: pkg.slug,
        name: pkg.name,
        currentPrice: pkg.currentPrice,
        soldCount: await transactionRepo.countSuccessfulTransactionsBySlug({ slug: pkg.slug }),
      })),
    );

    return {
      isPromoActive: isPromoActive(),
      promoEndsAt: PREMIUM_PROMO_ENDS_AT.toISOString(),
      packages,
    };
  });

const freemiumSales = admin
  .route({
    path: "/admin/statistics/freemium-sales",
    method: "GET",
    tags: ["Admin - Statistics"],
  })
  .handler(async () => {
    const products = [FREEMIUM_PRODUCT, FREEMIUM_PEMBAHASAN_PRODUCT];
    const [sales, requirementsCompleted] = await Promise.all([
      adminStatisticsRepo.getProductSales({ slugs: products.map((item) => item.SLUG) }),
      adminStatisticsRepo.countFreemiumRequirementsCompleted(),
    ]);

    return {
      requirementsCompleted,
      products: products.map((item) => {
        const row = sales.find((sale) => sale.slug === item.SLUG);
        return {
          slug: item.SLUG,
          name: item.NAME,
          price: item.PRICE,
          soldCount: row?.soldCount ?? 0,
          revenue: row?.revenue ?? 0,
        };
      }),
    };
  });

export const adminStatisticsRouter = {
  freemiumSales,
  stats: get,
  businessOverview,
  timeSeries,
  audienceInsights,
  premiumPackageSales,
};
