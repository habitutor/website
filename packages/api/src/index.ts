import { ORPCError } from "@orpc/server";
import { o } from "./lib/orpc";
import { requireAdmin } from "./middlewares/rbac";

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
