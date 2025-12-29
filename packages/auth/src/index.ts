import { db } from "@habitutor/db";
import * as schema from "@habitutor/db/schema/auth";
import { type } from "arktype";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY as string);

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
	trustedOrigins: [
		process.env.CORS_ORIGIN || "http://localhost:3000",
		"http://localhost:3000",
		"https://habitutor.devino.me",
	],
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			await resend.emails.send({
				from: "Habitutor <ithabitutor@gmail.com>",
				to: user.email,
				subject: "Reset password Habitutor.id",
				html: `<strong>klik ini bos: ${url}</strong>`,
				// template: {
				// 	id: "reset-your-password",
				// 	variables: {
				// 		url,
				// 	},
				// },
			});
		},
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
			enabled: false,
		},
	},
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
			domain: process.env.NODE_ENV === "production" ? ".habitutor.devino.me" : undefined,
		},
	},
});
