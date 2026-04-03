import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { o } from "../lib/orpc";
import { transactionRepo } from "../routers/transaction/repo";

export const requireAdmin = o.middleware(async ({ context, next }) => {
  if (context.session?.user.role !== "admin") throw new ORPCError("UNAUTHORIZED");

  return next();
});

export const requireAuth = o.middleware(async ({ context, next, errors }) => {
  if (!context.session?.user) throw errors.UNAUTHORIZED();
  const sessionUser = context.session.user as typeof context.session.user;

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
