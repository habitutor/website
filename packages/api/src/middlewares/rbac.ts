import { isAdminRole } from "@habitutor/shared/auth-domain";
import { ORPCError } from "@orpc/server";
import { o } from "../lib/orpc";

export const requireAdmin = o.middleware(async ({ context, next }) => {
  if (!isAdminRole(context.session?.user.role)) throw new ORPCError("UNAUTHORIZED");

  return next();
});

export const requireAuth = o.middleware(async ({ context, next, errors }) => {
  if (!context.session?.user) throw errors.UNAUTHORIZED();

  return next({
    context: {
      session: context.session,
    },
  });
});

export const requirePremium = o.middleware(({ context, next, errors }) => {
  if (!context.session?.user.isPremium && !isAdminRole(context.session?.user.role))
    throw errors.FORBIDDEN({
      message: "Akun premium dibutuhkan untuk mengakses resource ini.",
    });

  return next({
    context: {
      session: context.session,
    },
  });
});
