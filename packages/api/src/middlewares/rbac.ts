import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { o } from "../lib/orpc";
import { DEFAULT_PREMIUM_TIER, shouldBackfillPremiumTier } from "../routers/transaction/premium-tier";
import { transactionRepo } from "../routers/transaction/repo";

export const requireAdmin = o.middleware(async ({ context, next }) => {
  if (context.session?.user.role !== "admin") throw new ORPCError("UNAUTHORIZED");

  return next();
});

export const requireAuth = o.middleware(async ({ context, next, errors }) => {
  if (!context.session?.user) throw errors.UNAUTHORIZED();
  const sessionUser = context.session.user as typeof context.session.user & {
    premiumTier?: "premium" | "premium2" | null;
  };

  const [dbUser] = await db
    .select({
      isPremium: user.isPremium,
      premiumTier: user.premiumTier,
      premiumExpiresAt: user.premiumExpiresAt,
    })
    .from(user)
    .where(eq(user.id, sessionUser.id))
    .limit(1);

  if (dbUser) {
    const dbIsPremium = dbUser.isPremium ?? false;
    context.session.user.isPremium = dbIsPremium;
    sessionUser.isPremium = dbIsPremium;
    sessionUser.premiumExpiresAt = dbUser.premiumExpiresAt;
    sessionUser.premiumTier = dbIsPremium
      ? dbUser.premiumTier === "premium2"
        ? "premium2"
        : "premium"
      : null;
  }

  // Reset user data based on expiry
  if (
    sessionUser.flashcardStreak > 0 &&
    sessionUser.lastCompletedFlashcardAt &&
    Date.now() - sessionUser.lastCompletedFlashcardAt.getTime() >= 2 * 24 * 3600 * 1000
  ) {
    await db
      .update(user)
      .set({ flashcardStreak: 0 })
      .where(eq(user.id, sessionUser.id))
      .then(() => {
        context.session!.user.flashcardStreak = 0;
      });
  }
  if (sessionUser.isPremium && sessionUser.premiumExpiresAt && sessionUser.premiumExpiresAt.getTime() < Date.now()) {
    await transactionRepo
      .updateUserPremium({
        userId: sessionUser.id,
        isPremium: false,
        premiumTier: null,
        premiumExpiresAt: null,
      })
      .then(() => {
        context.session!.user.isPremium = false;
        sessionUser.premiumExpiresAt = null;
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
        context.session!.user.isPremium = true;
        sessionUser.premiumTier = DEFAULT_PREMIUM_TIER;
      });
  }

  return next({
    context: {
      session: context.session,
    },
  });
});

export const requirePremium = o.middleware(({ context, next, errors }) => {
  if (!context.session?.user.isPremium && context.session?.user.role !== "admin")
    throw errors.FORBIDDEN({
      message: "Akun premium dibutuhkan untuk mengakses resource ini.",
    });

  return next({
    context: {
      session: context.session,
    },
  });
});
