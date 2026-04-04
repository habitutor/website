import { getDb } from "@habitutor/db";
import { type } from "arktype";
import { authed } from "../..";
import { logger } from "@habitutor/shared";
import { ensureReferralCodeUsableForUser, REFERRAL_VALIDATION_MESSAGES } from "./policy";
import { referralRepo } from "./repo";

const getMyCode = authed
  .route({
    path: "/referral/my-code",
    method: "GET",
    tags: ["Referral"],
  })
  .output(
    type({
      code: "string",
      referralCount: "number",
    }),
  )
  .handler(async ({ context }) => {
    const userId = context.session.user.id;

    let codeRecord = await referralRepo.getCodeByUserId({ userId });

    if (!codeRecord) {
      codeRecord = await referralRepo.generateAndStoreCode({ userId });
    }

    return {
      code: codeRecord.code,
      referralCount: codeRecord.referralCount,
    };
  });

const validate = authed
  .route({
    path: "/referral/validate",
    method: "POST",
    tags: ["Referral"],
  })
  .input(
    type({
      code: "string",
    }),
  )
  .output(
    type({
      valid: "boolean",
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const userId = context.session.user.id;
    const code = input.code.trim();

    await ensureReferralCodeUsableForUser({
      userId,
      code,
      errors,
      messages: REFERRAL_VALIDATION_MESSAGES.standard,
    });

    return { valid: true };
  });

const applyReferralCode = authed
  .route({
    path: "/referral/use",
    method: "POST",
    tags: ["Referral"],
  })
  .input(
    type({
      code: "string",
    }),
  )
  .output(
    type({
      success: "boolean",
      message: "string",
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const userId = context.session.user.id;
    const code = input.code.trim();
    const validation = await ensureReferralCodeUsableForUser({
      userId,
      code,
      errors,
      messages: REFERRAL_VALIDATION_MESSAGES.referralUse,
    });

    // Increment referral count dan create usage record dengan transaction
    try {
      await getDb().transaction(async (tx) => {
        await referralRepo.incrementReferralCount({
          db: tx,
          referralCodeId: validation.codeRecord.id,
        });
        await referralRepo.createUsage({
          db: tx,
          userId,
          referralCodeId: validation.codeRecord.id,
          transactionId: undefined,
          cashbackAmount: undefined,
        });
      });

      return { success: true, message: "Kode referral berhasil digunakan!" };
    } catch (error) {
      if (error instanceof Error && "code" in error && (error as { code: string }).code === "23505") {
        throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah pernah menggunakan kode referral." });
      }
      logger.error(error instanceof Error ? error : new Error("Unknown referral use failure"), {
        userId,
        referralCodeId: validation.codeRecord.id,
      });
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Terjadi kesalahan saat memproses kode referral.",
      });
    }
  });

export const referralRouter = {
  code: getMyCode,
  validate,
  apply: applyReferralCode,
  use: applyReferralCode,
};
