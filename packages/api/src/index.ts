import { o } from "./lib/orpc";
import { rateLimit } from "./middlewares/rate-limit";
import { requireAdmin, requireAuth, requirePremium } from "./middlewares/rbac";
import { syncSessionLifecycle } from "./middlewares/session-lifecycle";

export const pub = o;
export const authed = pub.use(requireAuth).use(syncSessionLifecycle);
export const premium = authed.use(requirePremium);
export const admin = authed.use(requireAdmin);
export const authedRateLimited = authed.use(rateLimit);
