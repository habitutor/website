import { os } from "@orpc/server";
import type { Context } from "../context";

export const o = os.$context<Context>().errors({
  NOT_FOUND: { message: "Gagal menemukan resource yang diminta." },
  UNAUTHORIZED: { message: "Anda tidak memiliki akses ke resource ini." },
});

