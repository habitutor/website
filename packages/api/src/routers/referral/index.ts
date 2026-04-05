import { db } from "@habitutor/db";
import { type } from "arktype";
import { authed } from "../..";
import { logger } from "@habitutor/shared/logger";
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
    const validation = await referralRepo.validateCodeForUser({ userId, code });

    if (!validation.ok) {
      if (validation.reason === "invalid_length") {
        throw errors.UNPROCESSABLE_CONTENT({ message: "Kode referral harus 11 karakter." });
      }
      if (validation.reason === "not_found") {
        throw errors.NOT_FOUND({ message: "Kode referral tidak ditemukan." });
      }
      if (validation.reason === "own_code") {
        throw errors.UNPROCESSABLE_CONTENT({
          message: "Kamu tidak bisa menggunakan kode referral milikmu sendiri.",
        });
      }
      throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah pernah menggunakan kode referral." });
    }

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
    const validation = await referralRepo.validateCodeForUser({ userId, code });

    if (!validation.ok) {
      if (validation.reason === "invalid_length") {
        throw errors.UNPROCESSABLE_CONTENT({ message: "Kode referral tidak valid." });
      }
      if (validation.reason === "not_found") {
        throw errors.NOT_FOUND({ message: "Kode referral tidak ditemukan." });
      }
      if (validation.reason === "own_code") {
        throw errors.UNPROCESSABLE_CONTENT({
          message: "Kamu tidak bisa menggunakan kode referral milikmu sendiri.",
        });
      }
      throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah pernah menggunakan kode referral." });
    }

    // Increment referral count dan create usage record dengan transaction
    try {
      await db.transaction(async (tx) => {
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
