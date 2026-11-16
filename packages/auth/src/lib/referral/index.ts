import { db } from "@habitutor/db";
import { referralCode } from "@habitutor/db/schema/referral";
import { generateFriendlyCode } from "@habitutor/shared/referral-code";

class ReferralCodeGenerationError extends Error {
  constructor() {
    super("Failed to generate unique referral code");
    this.name = "ReferralCodeGenerationError";
  }
}

async function createForUser(userId: string) {
  let attempts = 0;
  while (true) {
    const code = generateFriendlyCode();
    const [result] = await db
      .insert(referralCode)
      .values({ code, userId })
      .onConflictDoNothing({ target: referralCode.code })
      .returning();
    if (result) return;
    if (++attempts >= 10) throw new ReferralCodeGenerationError();
  }
}

export const referral = {
  createForUser,
};
