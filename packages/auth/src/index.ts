import { db } from "@habitutor/db";
import * as schema from "@habitutor/db/schema/auth";
import { type } from "arktype";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

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
			},
			isPremium: {
				type: "boolean",
				validator: {
					input: type("boolean"),
				},
				defaultValue: false,
				input: false,
			},
			flashcardStreak: {
				type: "number",
				validator: {
					input: type("number"),
				},
				defaultValue: 0,
				input: false,
			},
			lastCompletedFlashcardAt: {
				type: "date",
				validator: {
					input: type("Date"),
				},
				defaultValue: null,
				input: false,
			},
		},
	},
	trustedOrigins: [process.env.CORS_ORIGIN || "http://localhost:3000"],
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: (process.env.GOOGLE_CLIENT_ID as string)?.trim(),
			clientSecret: (process.env.GOOGLE_CLIENT_SECRET as string)?.trim(),
			accessType: "offline",
			prompt: "select_account consent",
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
				domain: new URL(process.env.CORS_ORIGIN || "http://localhost:3000").hostname,
			},
		}),
	},
	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				if (type === "forget-password")
					await resend.emails.send({
						to: email,
						subject: "Reset password anda",
						template: {
							id: "reset-your-password",
							variables: {
								OTP: otp,
							},
						},
					});
			},
		}),
	],
});
