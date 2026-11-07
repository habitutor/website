import { type } from "arktype";
import { PREMIUM_TIERS, isAdminRole } from "@habitutor/shared/auth-domain";
import { authed } from "../..";
import { getLiveClassLock, getLiveClassTiming } from "../live-class/logic";
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
        lockReason: "'premium' | 'package' | 'mandiri' | 'tier' | null",
        category: "'TKA' | 'SNBT' | 'MANDIRI'",
      }).array(),
    }),
  )
  .handler(async ({ context }) => {
    const isAdmin = isAdminRole(context.session.user.role);
    const isPremium = Boolean(context.session.user.isPremium);
    const isPremiumTier2 = context.session.user.premiumTier === PREMIUM_TIERS.PREMIUM_2;

    // Semua jadwal tampil; aksesnya dikunci per kelas sesuai paket, sama seperti halaman jadwal live class.
    // hasLiveClassAccess false untuk pembeli paket "Tanpa Live Class": mereka melihat jadwal tapi tanpa link.
    const [announcements, rows, hasMandiriPackage, hasLiveClassAccess] = await Promise.all([
      dashboardRepo.listPublishedAnnouncements({}),
      dashboardRepo.listLiveClasses({}),
      isPremium ? liveClassRepo.hasMandiriPackage({ userId: context.session.user.id }) : Promise.resolve(false),
      isPremium ? liveClassRepo.hasLiveClassAccess({ userId: context.session.user.id }) : Promise.resolve(true),
    ]);
    const now = new Date();

    const liveClasses = rows.map(({ isoDate, durationMinutes, link, ...row }) => {
      const timing = getLiveClassTiming({ date: isoDate, time: row.time, durationMinutes, now });
      const lockReason = getLiveClassLock({
        isAdmin,
        isPremium,
        isPremiumTier2,
        hasMandiriPackage,
        hasLiveClassAccess,
        category: row.category,
        access: row.access,
      });
      return {
        ...row,
        startsAt: timing.startsAt.toISOString(),
        endsAt: timing.endsAt.toISOString(),
        joinOpensAt: timing.joinOpensAt.toISOString(),
        locked: Boolean(lockReason),
        lockReason,
        // Link Zoom hanya untuk yang berhak dan baru saat ruang kelas sudah dibuka.
        link: !lockReason && timing.isJoinOpen ? link : null,
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
