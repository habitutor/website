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
			return { valid: false, message: "Kamu tidak bisa menggunakan kode referral milikmu sendiri." };
		}

		const existingUsage = await referralRepo.getUserUsage({ userId });
		if (existingUsage) {
			return { valid: false, message: "Kamu sudah pernah menggunakan kode referral." };
		}

		return { valid: true };
	});

export const referralRouter = {
	getMyCode,
	validate,
};
