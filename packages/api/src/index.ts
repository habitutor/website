import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { o } from "./lib/orpc";
import { requireAdmin } from "./middlewares/rbac";

export const pub = o;
const requireAuth = o.middleware(async ({ context, next, errors }) => {
  if (!context.session?.user) throw errors.UNAUTHORIZED();
  if (
    context.session.user.flashcardStreak === 0 &&
    Date.now() - context.session.user.lastCompletedFlashcardAt.getTime() >= 2 * 24 * 3600 * 1000
  ) {
    await db.update(user).set({ flashcardStreak: 0 });
  }

  return next({
    context: {
      session: context.session,
    },
  });
});

export const authed = pub.use(requireAuth);
export const admin = authed.use(requireAdmin);
