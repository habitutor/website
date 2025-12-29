import { os } from "@orpc/server";
import type { Context } from "../context";

export const o = os.$context<Context>().errors({
	NOT_FOUND: { message: "Gagal menemukan resource yang diminta." },
	UNAUTHORIZED: { message: "Anda tidak memiliki akses ke resource ini." },
	UNPROCESSABLE_CONTENT: { message: "Permintaan anda tidak dapat diproses." },
	INTERNAL_SERVER_ERROR: { message: "Terjadi kesalahan pada sisi kami, silahkan coba lagi." },
});
