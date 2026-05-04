import { db } from "@habitutor/db";
import { logger } from "@habitutor/shared/logger";
import * as schema from "@habitutor/db/schema/auth";
import { type } from "arktype";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { referral } from "./lib/referral";
import { generateResetPasswordEmail } from "./lib/templates/reset-password";

const localDevOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const trustedOrigins = Array.from(
  new Set([
    process.env.CORS_ORIGIN || "http://localhost:3000",
    ...localDevOrigins,
    "https://habitutor.id",
    "https://www.habitutor.id",
    "https://api.habitutor.id",
  ]),
);

const resendClient = new Resend(process.env.RESEND_API_KEY || "Re_api_key");

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
      premiumTier: {
        type: "string",
        validator: {
          input: type('"premium" | "premium2" | null'),
        },
        required: false,
        defaultValue: null,
        input: false,
      },
      phoneNumber: {
        type: "string",
        validator: {
          input: type("string | null"),
        },
        required: false,
        defaultValue: null,
        input: true,
      },
      totalScore: {
        type: "number",
        validator: {
          input: type("number | null"),
        },
        defaultValue: 0,
        input: false,
      },
      referralCode: {
        type: "string",
        required: false,
        input: false,
      },
      referralUsage: {
        type: "number",
        required: false,
        defaultValue: 0,
        input: false,
      },
      dreamCampus: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
      dreamMajor: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
    },
  },

  trustedOrigins,

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      resendClient.emails
        .send({
          from: "Habitutor <noreply@habitutor.id>",
          to: user.email,
          subject: "Pesan Otomatis: Permintaan Pengaturan Ulang Kata Sandi",
          html: generateResetPasswordEmail(user.name, url, token),
        })
        .catch(() => {
          logger.error("Failed to send reset email");
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
          await referral.createForUser(user.id);
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

export type AuthInstance = typeof auth;
