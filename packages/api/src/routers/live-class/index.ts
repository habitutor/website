import { PREMIUM_TIERS, isAdminRole } from "@habitutor/shared/auth-domain";
import { type } from "arktype";
import { authed } from "../..";
import { getLiveClassLock, getLiveClassTiming } from "./logic";
import { liveClassRepo } from "./repo";

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function addDays(date: string, days: number) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

const schedule = authed
  .route({
    path: "/live-class/schedule",
    method: "GET",
    tags: ["Live Class"],
  })
  .input(type({ weekStart: "string" }))
  .handler(async ({ input, context, errors }) => {
    if (!DATE_PATTERN.test(input.weekStart)) throw errors.BAD_REQUEST({ message: "Tanggal tidak valid" });

    const user = context.session.user;
    const isAdmin = isAdminRole(user.role);
    const isPremium = Boolean(user.isPremium);
    const [rows, hasMandiriPackage] = await Promise.all([
      liveClassRepo.listPublishedBetween({ from: input.weekStart, to: addDays(input.weekStart, 7) }),
      isPremium ? liveClassRepo.hasMandiriPackage({ userId: user.id }) : Promise.resolve(false),
    ]);
    const now = new Date();

    const classes = rows.map(({ link, ...row }) => {
      const timing = getLiveClassTiming({ ...row, now });
      const lockReason = getLiveClassLock({
        isAdmin,
        isPremium,
        isPremiumTier2: user.premiumTier === PREMIUM_TIERS.PREMIUM_2,
        hasMandiriPackage,
        category: row.category,
        access: row.access,
      });

      return {
        id: row.id,
        title: row.title,
        teacher: row.teacher,
        category: row.category,
        date: row.date,
        time: row.time,
        durationMinutes: row.durationMinutes,
        startsAt: timing.startsAt.toISOString(),
        endsAt: timing.endsAt.toISOString(),
        joinOpensAt: timing.joinOpensAt.toISOString(),
        status: timing.status,
        lockReason,
        // Link Zoom hanya dikirim ke yang berhak, dan baru saat ruang kelas sudah dibuka.
        link: !lockReason && timing.isJoinOpen ? link : null,
      };
    });

    return { classes, now: now.toISOString() };
  });

export const liveClassRouter = {
  schedule,
};
