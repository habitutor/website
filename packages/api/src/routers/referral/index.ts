import { db } from "@habitutor/db";
import { type } from "arktype";
import { authed } from "../..";
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
      "message?": "string",
    }),
  )
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    const code = input.code.trim();

    if (code.length !== 11) {
      return { valid: false, message: "Kode referral harus 11 karakter." };
    }

    const codeRecord = await referralRepo.getCodeByCode({ code });
    if (!codeRecord) {
      return { valid: false, message: "Kode referral tidak ditemukan." };
    }

    if (codeRecord.userId === userId) {
      return {
        valid: false,
        message: "Kamu tidak bisa menggunakan kode referral milikmu sendiri.",
      };
    }

    const existingUsage = await referralRepo.getUserUsage({ userId });
    if (existingUsage) {
      return {
        valid: false,
        message: "Kamu sudah pernah menggunakan kode referral.",
      };
    }

    return { valid: true };
  });

const use = authed
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
      "message?": "string",
    }),
  )
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    const code = input.code.trim();

    if (!code || code.length !== 11) {
      return { success: false, message: "Kode referral tidak valid." };
    }

    const codeRecord = await referralRepo.getCodeByCode({ code });
    if (!codeRecord) {
      return { success: false, message: "Kode referral tidak ditemukan." };
    }

    if (codeRecord.userId === userId) {
      return {
        success: false,
        message: "Kamu tidak bisa menggunakan kode referral milikmu sendiri.",
      };
    }

    const existingUsage = await referralRepo.getUserUsage({ userId });
    if (existingUsage) {
      return {
        success: false,
        message: "Kamu sudah pernah menggunakan kode referral.",
      };
    }

    // Increment referral count dan create usage record dengan transaction
    try {
      await db.transaction(async (tx) => {
        await referralRepo.incrementReferralCount({
          db: tx,
          referralCodeId: codeRecord.id,
        });
        await referralRepo.createUsage({
          db: tx,
          userId,
          referralCodeId: codeRecord.id,
          transactionId: undefined,
          cashbackAmount: undefined,
        });
      });

      return { success: true, message: "Kode referral berhasil digunakan!" };
    } catch (error) {
      const errorMsg = (error as any)?.message || "Unknown error";
      console.error("[Referral] Error using referral code:", errorMsg, error);

      if (errorMsg.includes("unique") || errorMsg.includes("duplicate")) {
        return {
          success: false,
          message: "Kamu sudah pernah menggunakan kode referral.",
        };
      }
      return {
        success: false,
        message: "Terjadi kesalahan saat memproses kode referral.",
      };
    }
  });

export const referralRouter = {
  getMyCode,
  validate,
  use,
};
