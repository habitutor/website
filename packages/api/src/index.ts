import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { eq } from "drizzle-orm";
import { o } from "./lib/orpc";
import { rateLimit } from "./middlewares/rate-limit";
import { requireAdmin } from "./middlewares/rbac";
import {
  DEFAULT_PREMIUM_TIER,
  shouldBackfillPremiumTier,
} from "./routers/transaction/premium-tier";
import { transactionRepo } from "./routers/transaction/repo";

export const pub = o;
const requireAuth = o.middleware(async ({ context, next, errors }) => {
  if (!context.session?.user) throw errors.UNAUTHORIZED();
  const sessionUser = context.session.user as typeof context.session.user & {
    premiumTier?: "premium" | "premium2" | null;
  };

  // Reset user data based on expiry
  if (
    sessionUser.flashcardStreak > 0 &&
    sessionUser.lastCompletedFlashcardAt &&
    Date.now() - sessionUser.lastCompletedFlashcardAt.getTime() >=
      2 * 24 * 3600 * 1000
  ) {
    await db
      .update(user)
      .set({ flashcardStreak: 0 })
      .where(eq(user.id, sessionUser.id))
      .then(() => {
        context.session!.user.flashcardStreak = 0;
      });
  }
  if (
    sessionUser.isPremium &&
    sessionUser.premiumExpiresAt &&
    sessionUser.premiumExpiresAt.getTime() < Date.now()
  ) {
    await transactionRepo
      .updateUserPremium({
        userId: sessionUser.id,
        isPremium: false,
        premiumTier: null,
        premiumExpiresAt: null,
      })
      .then(() => {
        context.session!.user.isPremium = false;
        sessionUser.premiumTier = null;
      });
  }

  if (
    shouldBackfillPremiumTier({
      isPremium: sessionUser.isPremium,
      premiumTier: sessionUser.premiumTier,
      premiumExpiresAt: sessionUser.premiumExpiresAt ?? null,
    })
  ) {
    await transactionRepo
      .updateUserPremium({
        userId: sessionUser.id,
        isPremium: true,
        premiumTier: null,
        premiumExpiresAt: sessionUser.premiumExpiresAt ?? null,
      })
      .then(() => {
        sessionUser.premiumTier = DEFAULT_PREMIUM_TIER;
      });
  }

  return next({
    context: {
      session: context.session,
    },
  });
});

const requirePremium = o.middleware(({ context, next, errors }) => {
  if (!context.session?.user.isPremium)
    throw errors.FORBIDDEN({
      message: "Akun premium dibutuhkan untuk mengakses resource ini.",
    });

  return next({
    context: {
      session: context.session,
    },
  });
});

export const authed = pub.use(requireAuth);
export const premium = authed.use(requirePremium);
export const admin = authed.use(requireAdmin);
export const authedRateLimited = authed.use(rateLimit);
