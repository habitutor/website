import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";
import { requireAdmin } from "./middlewares/rbac";

export const o = os.$context<Context>();

export const pub = o;

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({
		context: {
			session: context.session,
		},
	});
});

export const authed = pub.use(requireAuth);
export const admin = authed.use(requireAdmin);
