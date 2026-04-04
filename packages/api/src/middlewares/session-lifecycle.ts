import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { o } from "../lib/orpc";
import { transactionRepo } from "../routers/transaction/repo";

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

  return next({
    context: {
      session: context.session,
    },
  });
});
