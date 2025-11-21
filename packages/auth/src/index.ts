import { db } from "@habitutor/db";
import * as schema from "@habitutor/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// create new instance for every request due to cloudflare's serverless nature
export const auth = (
	env: CloudflareBindings,
): ReturnType<typeof betterAuth> => {
	const dbInstance = db(env);

	return betterAuth({
		database: drizzleAdapter(dbInstance, {
			provider: "pg",
			schema,
		}),
		trustedOrigins: [env.CORS_ORIGIN],
		emailAndPassword: {
			enabled: true,
		},
		// uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
		session: {
			cookieCache: {
				enabled: true,
				maxAge: 60,
			},
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		advanced: {
			defaultCookieAttributes: {
				//sameSite none + secure true untuk production (HTTPS + cross domain)
				//sameSite lax + secure false untuk dev (HTTP + same domain localhost)
				sameSite: env.NODE_ENV === "production" ? "none" : "lax",
				secure: env.NODE_ENV === "production",
				httpOnly: true,
			},
			//crossSubDomainCookies hanya untuk production deployment
			//tidak perlu di localhost karena localhost:3000 dan localhost:3001 adalah same domain
			...(env.NODE_ENV === "production" && {
				crossSubDomainCookies: {
					enabled: true,
					//Extract hostname dari CORS_ORIGIN untuk production
					domain: new URL(env.CORS_ORIGIN).hostname,
				},
			}),
		},
	});
};

export type Auth = ReturnType<typeof auth>;
