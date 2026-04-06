import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { logger } from "@habitutor/shared/logger";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { o } from "../lib/orpc";
import { transactionRepo } from "../routers/transaction/repo";
import { reconcileLatestPendingTransaction } from "../routers/transaction/sync";

const RECONCILE_COOLDOWN_MS = 30 * 1000;
const lastReconcileByUser = new Map<string, number>();

function shouldReconcileNow(userId: string): boolean {
  const now = Date.now();
  const lastRunAt = lastReconcileByUser.get(userId) ?? 0;

  if (now - lastRunAt < RECONCILE_COOLDOWN_MS) {
    return false;
  }

  lastReconcileByUser.set(userId, now);
  return true;
}

export const syncSessionLifecycle = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  const sessionUser = context.session.user as typeof context.session.user;

  if (
    sessionUser.flashcardStreak > 0 &&
    sessionUser.lastCompletedFlashcardAt &&
    Date.now() - sessionUser.lastCompletedFlashcardAt.getTime() >= 2 * 24 * 3600 * 1000
  ) {
    await db.update(user).set({ flashcardStreak: 0 }).where(eq(user.id, sessionUser.id));
    sessionUser.flashcardStreak = 0;
  }

  if (sessionUser.isPremium && sessionUser.premiumExpiresAt && sessionUser.premiumExpiresAt.getTime() < Date.now()) {
    await transactionRepo.updateUserPremium({
      userId: sessionUser.id,
      isPremium: false,
      premiumTier: null,
      premiumExpiresAt: null,
    });
    sessionUser.isPremium = false;
    sessionUser.premiumExpiresAt = null;
    sessionUser.premiumTier = null;
  }

  if (!sessionUser.isPremium && shouldReconcileNow(sessionUser.id)) {
    try {
      await reconcileLatestPendingTransaction(sessionUser.id);

      const [latestUserState] = await db
        .select({
          isPremium: user.isPremium,
          premiumTier: user.premiumTier,
          premiumExpiresAt: user.premiumExpiresAt,
        })
        .from(user)
        .where(eq(user.id, sessionUser.id))
        .limit(1);

      if (latestUserState?.isPremium) {
        sessionUser.isPremium = latestUserState.isPremium;
        sessionUser.premiumTier = latestUserState.premiumTier;
        sessionUser.premiumExpiresAt = latestUserState.premiumExpiresAt;
      }
    } catch (error) {
      logger.error("Failed to reconcile pending transaction during session lifecycle", {
        userId: sessionUser.id,
        error,
      });
    }
  }

  return next({
    context: {
      session: context.session,
    },
  });
});
