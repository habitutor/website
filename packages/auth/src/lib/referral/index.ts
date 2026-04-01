import { db } from "@habitutor/db";
import { referralCode } from "@habitutor/db/schema/referral";

const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-_";
const CODE_LENGTH = 11;

function generateCodeString(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes)
    .map((byte) => CHARS[byte % CHARS.length])
    .join("");
}

async function createForUser(userId: string) {
  let attempts = 0;
  while (true) {
    const code = generateCodeString();
    const [result] = await db
      .insert(referralCode)
      .values({ code, userId })
      .onConflictDoNothing({ target: referralCode.code })
      .returning();
    if (result) return;
    if (++attempts >= 10) throw new Error("Failed to generate unique referral code");
  }
}

export const referral = {
  createForUser,
};
