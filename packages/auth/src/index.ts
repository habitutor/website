import { db } from "@habitutor/db";
import * as schema from "@habitutor/db/schema/auth";
import { type } from "arktype";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	user: {
		additionalFields: {
			role: {
				type: "string",
				validator: {
					input: type('"user" | "admin"'),
				},
				defaultValue: "user",
				input: false,
				returned: true,
			},
		},
	},
	trustedOrigins: [process.env.CORS_ORIGIN || "http://localhost:3000"],
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60,
		},
	},
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
	advanced: {
		defaultCookieAttributes: {
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
		},
		...(process.env.NODE_ENV === "production" && {
			crossSubDomainCookies: {
				enabled: true,
				domain: new URL(process.env.CORS_ORIGIN || "http://localhost:3000")
					.hostname,
			},
		}),
	},
});
