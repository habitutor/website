import { db } from "@habitutor/db";
import * as schema from "@habitutor/db/schema/auth";
import { referralCode } from "@habitutor/db/schema/referral";
import { type } from "arktype";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { generateResetPasswordEmail } from "./lib/templates/reset-password";

const REFERRAL_CODE_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-_";
const REFERRAL_CODE_LENGTH = 11;

function generateReferralCodeString(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(REFERRAL_CODE_LENGTH));
	return Array.from(bytes)
		.map((byte) => REFERRAL_CODE_CHARS[byte % REFERRAL_CODE_CHARS.length])
		.join("");
}

async function createReferralCodeForUser(userId: string) {
	const existing = await db.select().from(referralCode).where(eq(referralCode.userId, userId)).limit(1);
	if (existing[0]) return;

	for (let attempt = 0; attempt < 5; attempt++) {
		const code = generateReferralCodeString();
		const [result] = await db
			.insert(referralCode)
			.values({ code, userId })
			.onConflictDoNothing({ target: referralCode.code })
			.returning();
		if (result) return;
	}
	console.error(`Failed to generate referral code for user ${userId}`);
}

export const resend = new Resend(process.env.RESEND_API_KEY || "");

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
			premiumExpiresAt: {
				type: "date",
				validator: {
					input: type("Date"),
				},
				required: false,
				defaultValue: null,
				input: false,
			},
		},
	},
	trustedOrigins: [
		process.env.CORS_ORIGIN || "http://localhost:3000",
		"https://habitutor.id",
		"https://www.habitutor.id",
		"https://api.habitutor.id",
	],
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url, token }) => {
			resend.emails
				.send({
					from: "Habitutor <noreply@habitutor.id>",
					to: user.email,
					subject: "Pesan Otomatis: Permintaan Pengaturan Ulang Kata Sandi",
					html: generateResetPasswordEmail(user.name, url, token),
				})
				.catch((error) => {
					console.error("Failed to send password reset email:", error);
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
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await createReferralCodeForUser(user.id);
				},
			},
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "Lax",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
		},
		...(process.env.NODE_ENV === "production" && {
			crossSubDomainCookies: {
				enabled: true,
				domain: ".habitutor.id",
			},
		}),
	},
});
