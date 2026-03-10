import { o } from "./lib/orpc";
import { rateLimit } from "./middlewares/rate-limit";
import { requireAdmin, requireAuth, requirePremium } from "./middlewares/rbac";

export const pub = o;
export const authed = pub.use(requireAuth);
export const premium = authed.use(requirePremium);
export const admin = authed.use(requireAdmin);
export const authedRateLimited = authed.use(rateLimit);
