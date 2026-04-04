import type { ReferralValidationReason } from "./repo";
import { referralRepo } from "./repo";

type ReferralErrors = {
  UNPROCESSABLE_CONTENT: (payload: { message: string }) => unknown;
  NOT_FOUND: (payload: { message: string }) => unknown;
};

type ReferralValidationMessages = {
  invalidLength: string;
  notFound: string;
  ownCode: string;
  alreadyUsed: string;
};

export const REFERRAL_VALIDATION_MESSAGES = {
  standard: {
    invalidLength: "Kode referral harus 11 karakter.",
    notFound: "Kode referral tidak ditemukan.",
    ownCode: "Kamu tidak bisa menggunakan kode referral milikmu sendiri.",
    alreadyUsed: "Kamu sudah pernah menggunakan kode referral.",
  },
  referralUse: {
    invalidLength: "Kode referral tidak valid.",
    notFound: "Kode referral tidak ditemukan.",
    ownCode: "Kamu tidak bisa menggunakan kode referral milikmu sendiri.",
    alreadyUsed: "Kamu sudah pernah menggunakan kode referral.",
  },
} as const;

function throwReferralValidationError({
  errors,
  reason,
  messages,
}: {
  errors: ReferralErrors;
  reason: ReferralValidationReason;
  messages: ReferralValidationMessages;
}): never {
  if (reason === "invalid_length") {
    throw errors.UNPROCESSABLE_CONTENT({ message: messages.invalidLength });
  }

  if (reason === "not_found") {
    throw errors.NOT_FOUND({ message: messages.notFound });
  }

  if (reason === "own_code") {
    throw errors.UNPROCESSABLE_CONTENT({ message: messages.ownCode });
  }

  throw errors.UNPROCESSABLE_CONTENT({ message: messages.alreadyUsed });
}

export async function ensureReferralCodeUsableForUser({
  userId,
  code,
  errors,
  messages,
  allowPendingSameCode = false,
}: {
  userId: string;
  code: string;
  errors: ReferralErrors;
  messages: ReferralValidationMessages;
  allowPendingSameCode?: boolean;
}) {
  const validation = await referralRepo.validateCodeForUser({
    userId,
    code,
    allowPendingSameCode,
  });

  if (!validation.ok) {
    throwReferralValidationError({
      errors,
      reason: validation.reason,
      messages,
    });
  }

  return validation;
}

export async function resolveSubscriptionReferralCode({
  userId,
  referralCodeInput,
  errors,
}: {
  userId: string;
  referralCodeInput?: string;
  errors: ReferralErrors;
}) {
  const existingUsage = await referralRepo.getUserUsage({ userId });

  if (referralCodeInput) {
    const validation = await ensureReferralCodeUsableForUser({
      userId,
      code: referralCodeInput.trim(),
      errors,
      messages: REFERRAL_VALIDATION_MESSAGES.standard,
      allowPendingSameCode: true,
    });

    return validation.codeRecord.id;
  }

  // Referral submitted during registration should be applied automatically
  // to the first paid transaction.
  if (existingUsage && !existingUsage.transactionId) {
    return existingUsage.referralCodeId;
  }

  return undefined;
}
