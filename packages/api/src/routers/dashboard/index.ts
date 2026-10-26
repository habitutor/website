import { type } from "arktype";
import { PREMIUM_TIERS, isAdminRole } from "@habitutor/shared/auth-domain";
import { authed } from "../..";
import { getLiveClassTiming } from "../live-class/logic";
import { liveClassRepo } from "../live-class/repo";
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
        link: "string | null",
        access: "'3x' | '5x'",
        order: "number",
        startsAt: "string",
        endsAt: "string",
        joinOpensAt: "string",
        locked: "boolean",
      }).array(),
    }),
  )
  .handler(async ({ context }) => {
    const isAdmin = isAdminRole(context.session.user.role);
    const isPremium = Boolean(context.session.user.isPremium);
    const isPremiumTier2 = context.session.user.premiumTier === PREMIUM_TIERS.PREMIUM_2;
    const canJoin = isAdmin || isPremium;

    const announcements = await dashboardRepo.listPublishedAnnouncements({});

    // Non-premium tetap melihat jadwal (tanpa link) sebagai ajakan upgrade; kelas Mandiri hanya untuk pembelinya.
    const includeMandiri =
      isAdmin || (isPremium && (await liveClassRepo.hasMandiriPackage({ userId: context.session.user.id })));
    const rows = await dashboardRepo.listLiveClasses({
      onlyThreeX: canJoin && !isAdmin && isPremiumTier2,
      includeMandiri,
    });
    const now = new Date();

    const liveClasses = rows.map(({ isoDate, durationMinutes, link, ...row }) => {
      const timing = getLiveClassTiming({ date: isoDate, time: row.time, durationMinutes, now });
      return {
        ...row,
        startsAt: timing.startsAt.toISOString(),
        endsAt: timing.endsAt.toISOString(),
        joinOpensAt: timing.joinOpensAt.toISOString(),
        locked: !canJoin,
        // Link Zoom hanya untuk yang berhak dan baru saat ruang kelas sudah dibuka.
        link: canJoin && timing.isJoinOpen ? link : null,
      };
    });

    return {
      announcements,
      liveClasses,
    };
  });

export const dashboardRouter = {
  content,
};
