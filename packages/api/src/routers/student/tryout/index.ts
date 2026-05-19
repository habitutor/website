import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { authed } from "../../../index";
import { tryoutRepo } from "./repo";
import { toOrpcError } from "./logic";

/**
 * Daftar tryout yang dipublish
 * GET /tryout
 */
const listPublishedTryouts = authed
    .route({
        path: "/tryout",
        method: "GET",
        tags: ["Student - Tryout"],
    })
    .handler(async () => {
        try {
            return await tryoutRepo.listPublishedTryouts({});
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil daftar tryout");
        }
    });

/**
 * Daftar subtes berdasarkan tryout
 * GET /tryout/{tryoutId}/subtes
 */
const listSubtesByTryout = authed
    .route({
        path: "/tryout/{tryoutId}/subtes",
        method: "GET",
        tags: ["Student - Tryout"],
    })
    .input(type({ tryoutId: "string" }))
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.listSubtesByTryout({ tryoutId: input.tryoutId });
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil daftar subtes");
        }
    });

/**
 * Mulai Tryout - buat sesi baru atau return existing
 * POST /tryout/{tryoutId}/start
 */
const startTryout = authed
    .route({
        path: "/tryout/{tryoutId}/start",
        method: "POST",
        tags: ["Student - Tryout"],
    })
    .input(
        type({
            tryoutId: "string",
        }),
    )
    .handler(async ({ input, context }) => {
        if (!context.session?.user?.id) {
            throw new ORPCError("UNAUTHORIZED", { message: "User tidak terautentikasi" });
        }

        try {
            const result = await tryoutRepo.startTryout({
                userId: context.session.user.id,
                tryoutId: input.tryoutId,
            });

            return {
                sesiId: result.sesi.id,
                sesiSubtesId: result.sesiSubtes?.id,
                mulaiAt: result.sesi.mulaiAt,
            };
        } catch (error) {
            throw toOrpcError(error, "Gagal memulai tryout");
        }
    });

/**
 * Ambil soal berdasarkan sesi_subtes_id
 * GET /tryout/subtes/{sesiSubtesId}/questions
 */
const getQuestions = authed
    .route({
        path: "/tryout/subtes/{sesiSubtesId}/questions",
        method: "GET",
        tags: ["Student - Tryout"],
    })
    .input(
        type({
            sesiSubtesId: "string",
        }),
    )
    .handler(async ({ input }) => {
        try {
            const questions = await tryoutRepo.getQuestions({
                sesiSubtesId: input.sesiSubtesId,
            });

            return {
                soal: questions,
                totalSoal: questions.length,
            };
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil soal");
        }
    });

/**
 * Submit jawaban per soal
 * POST /tryout/questions/submit-answer
 */
const submitAnswer = authed
    .route({
        path: "/tryout/questions/submit-answer",
        method: "POST",
        tags: ["Student - Tryout"],
    })
    .input(
        type({
            sesiId: "string",
            sesiSoalId: "string",
            "pilihanId?": "string | null",
            "isRagu?": "boolean",
        }),
    )
    .handler(async ({ input }) => {
        try {
            const result = await tryoutRepo.submitAnswer({
                sesiId: input.sesiId,
                sesiSoalId: input.sesiSoalId,
                pilihanId: input.pilihanId || null,
                isRagu: input.isRagu || false,
            });

            if (!result) {
                throw new Error("Gagal membuat jawaban");
            }

            return {
                success: true,
                jawaban: {
                    id: result.id,
                    sesiSoalId: result.sesiSoalId,
                    isBenar: result.isBenar,
                    poinDapat: result.poinDapat,
                },
            };
        } catch (error) {
            throw toOrpcError(error, "Gagal submit jawaban");
        }
    });

/**
 * Submit subtes - hitung skor dan cek subtes berikutnya
 * POST /tryout/subtes/submit
 */
const submitSubtest = authed
    .route({
        path: "/tryout/subtes/submit",
        method: "POST",
        tags: ["Student - Tryout"],
    })
    .input(
        type({
            sesiSubtesId: "string",
        }),
    )
    .handler(async ({ input }) => {
        try {
            const result = await tryoutRepo.submitSubtest({
                sesiSubtesId: input.sesiSubtesId,
            });

            return {
                success: true,
                selesaiSubtes: result.currentSubtes,
                subtesBerikutnya: result.nextSubtes,
            };
        } catch (error) {
            throw toOrpcError(error, "Gagal submit subtes");
        }
    });

/**
 * Auto submit saat waktu habis
 * POST /tryout/subtes/auto-submit
 */
const autoSubmitSubtest = authed
    .route({
        path: "/tryout/subtes/auto-submit",
        method: "POST",
        tags: ["Student - Tryout"],
    })
    .input(
        type({
            sesiSubtesId: "string",
        }),
    )
    .handler(async ({ input }) => {
        try {
            const result = await tryoutRepo.autoSubmitSubtest({
                sesiSubtesId: input.sesiSubtesId,
            });

            return {
                success: true,
                selesaiSubtes: result.currentSubtes,
                subtesBerikutnya: result.nextSubtes,
            };
        } catch (error) {
            throw toOrpcError(error, "Gagal auto submit subtes");
        }
    });

/**
 * Ambil hasil akhir tryout
 * GET /tryout/{sesiId}/results
 */
const getResults = authed
    .route({
        path: "/tryout/{sesiId}/results",
        method: "GET",
        tags: ["Student - Tryout"],
    })
    .input(
        type({
            sesiId: "string",
        }),
    )
    .handler(async ({ input }) => {
        try {
            const result = await tryoutRepo.getResult({
                sesiId: input.sesiId,
            });

            return result;
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil hasil");
        }
    });

/**
 * Ambil pembahasan soal (hanya untuk premium user)
 * GET /tryout/soal/{soalId}/pembahasan
 */
const getPembahasan = authed
    .route({
        path: "/tryout/soal/{soalId}/pembahasan",
        method: "GET",
        tags: ["Student - Tryout"],
    })
    .input(
        type({
            soalId: "string",
        }),
    )
    .handler(async ({ input, context }) => {
        if (!context.session?.user?.id) {
            throw new ORPCError("UNAUTHORIZED", { message: "User tidak terautentikasi" });
        }

        try {
            const result = await tryoutRepo.getPembahasan({
                soalId: input.soalId,
                userId: context.session.user.id,
            });

            return result;
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil pembahasan");
        }
    });

/**
 * Ambil info sesi subtes (timer, nama, status)
 * GET /tryout/sesi-subtes/{sesiSubtesId}/info
 */
const getSesiSubtesInfo = authed
    .route({
        path: "/tryout/sesi-subtes/{sesiSubtesId}/info",
        method: "GET",
        tags: ["Student - Tryout"],
    })
    .input(
        type({
            sesiSubtesId: "string",
        }),
    )
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.getSesiSubtesInfo({
                sesiSubtesId: input.sesiSubtesId,
            });
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil info sesi subtes");
        }
    });

/**
 * Ambil riwayat tryout user
 * GET /tryout/history
 */
const getHistory = authed
    .route({
        path: "/tryout/history",
        method: "GET",
        tags: ["Student - Tryout"],
    })
    .handler(async ({ context }) => {
        if (!context.session?.user?.id) {
            throw new ORPCError("UNAUTHORIZED", { message: "User tidak terautentikasi" });
        }

        try {
            return await tryoutRepo.getHistory({
                userId: context.session.user.id,
            });
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil riwayat tryout");
        }
    });

export const studentTryoutRouter = {
    list: listPublishedTryouts,
    listSubtes: listSubtesByTryout,
    start: startTryout,
    questions: getQuestions,
    sesiSubtesInfo: getSesiSubtesInfo,
    answer: {
        submit: submitAnswer,
    },
    subtes: {
        submit: submitSubtest,
        autoSubmit: autoSubmitSubtest,
    },
    results: getResults,
    pembahasan: getPembahasan,
    history: getHistory,
};

