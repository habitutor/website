import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { o } from "./lib/orpc";
import { requireAdmin } from "./middlewares/rbac";

export const pub = o;
const requireAuth = o.middleware(async ({ context, next, errors }) => {
	if (!context.session?.user) throw errors.UNAUTHORIZED();

	// Reset user data based on expiry
	if (
		context.session.user.flashcardStreak > 0 &&
		context.session.user.lastCompletedFlashcardAt &&
		Date.now() - context.session.user.lastCompletedFlashcardAt.getTime() >= 2 * 24 * 3600 * 1000
	) {
		await db.update(user).set({ flashcardStreak: 0 });
	}
	if (
		context.session.user.isPremium &&
		context.session.user.premiumExpiresAt &&
		context.session.user.premiumExpiresAt.getTime() < Date.now()
	) {
		await db.update(user).set({ isPremium: false });
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
