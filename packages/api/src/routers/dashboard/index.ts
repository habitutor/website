import { type } from "arktype";
import { PREMIUM_TIERS, isAdminRole } from "@habitutor/shared";
import { authed } from "../..";
import { dashboardRepo } from "./repo";

const content = authed
  .route({
    path: "/dashboard/content",
    method: "GET",
    tags: ["Dashboard"],
  })
  .output(
    type({
      announcements: type({
        id: "number",
        title: "string",
        description: "string",
        variant: "'primary' | 'cashback'",
        "ctaLink?": "string | null",
        "ctaLabel?": "string | null",
        order: "number",
      }).array(),
      liveClasses: type({
        id: "number",
        title: "string",
        date: "string",
        time: "string",
        teacher: "string",
        link: "string",
        access: "'3x' | '5x'",
        order: "number",
      }).array(),
    }),
  )
  .handler(async ({ context }) => {
    const isAdmin = isAdminRole(context.session.user.role);
    const isPremium = Boolean(context.session.user.isPremium);
    const isPremiumTier2 = context.session.user.premiumTier === PREMIUM_TIERS.PREMIUM_2;

    await dashboardRepo.cleanupExpiredLiveClasses({});

    const announcements = await dashboardRepo.listPublishedAnnouncements({});

    const canSeeLiveClass = isAdmin || isPremium;

    if (!canSeeLiveClass) {
      return {
        announcements,
        liveClasses: [],
      };
    }

    const canAccessFiveX = isAdmin || (isPremium && !isPremiumTier2);

    const liveClasses = await dashboardRepo.listLiveClasses({
      onlyThreeX: !canAccessFiveX,
    });

    return {
      announcements,
      liveClasses,
    };
  });

export const dashboardRouter = {
  content,
};
