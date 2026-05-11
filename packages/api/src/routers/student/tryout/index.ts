import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { authed } from "../../../index";
import { tryoutRepo } from "./repo";

/**
 * Mulai Tryout - buat sesi baru atau return existing
 * POST /student/tryouts/{tryoutId}/start
 */
const startTryout = authed
    .route({
        path: "/student/tryouts/{tryoutId}/start",
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
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: error instanceof Error ? error.message : "Gagal memulai tryout",
            });
        }
    });

/**
 * Ambil soal berdasarkan sesi_subtes_id
 * GET /student/tryouts/subtes/{sesiSubtesId}/questions
 */
const getQuestions = authed
    .route({
        path: "/student/tryouts/subtes/{sesiSubtesId}/questions",
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
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: error instanceof Error ? error.message : "Gagal mengambil soal",
            });
        }
    });

/**
 * Submit jawaban per soal
 * POST /student/tryouts/questions/submit-answer
 */
const submitAnswer = authed
    .route({
        path: "/student/tryouts/questions/submit-answer",
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
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: error instanceof Error ? error.message : "Gagal submit jawaban",
            });
        }
    });

/**
 * Submit subtes - hitung skor dan cek subtes berikutnya
 * POST /student/tryouts/subtes/submit
 */
const submitSubtest = authed
    .route({
        path: "/student/tryouts/subtes/submit",
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
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: error instanceof Error ? error.message : "Gagal submit subtes",
            });
        }
    });

/**
 * Auto submit saat waktu habis
 * POST /student/tryouts/subtes/auto-submit
 */
const autoSubmitSubtest = authed
    .route({
        path: "/student/tryouts/subtes/auto-submit",
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
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: error instanceof Error ? error.message : "Gagal auto submit subtes",
            });
        }
    });

/**
 * Ambil hasil akhir tryout
 * GET /student/tryouts/{sesiId}/results
 */
const getResults = authed
    .route({
        path: "/student/tryouts/{sesiId}/results",
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
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: error instanceof Error ? error.message : "Gagal mengambil hasil",
            });
        }
    });

/**
 * Ambil pembahasan soal (hanya untuk premium user)
 * GET /student/tryouts/soal/{soalId}/pembahasan
 */
const getPembahasan = authed
    .route({
        path: "/student/tryouts/soal/{soalId}/pembahasan",
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
            if (error instanceof Error && error.message === "PREMIUM_REQUIRED") {
                throw new ORPCError("FORBIDDEN", {
                    message: "Pembahasan hanya tersedia untuk member premium",
                });
            }
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: error instanceof Error ? error.message : "Gagal mengambil pembahasan",
            });
        }
    });

export const studentTryoutRouter = {
    start: startTryout,
    questions: getQuestions,
    answer: {
        submit: submitAnswer,
    },
    subtes: {
        submit: submitSubtest,
        autoSubmit: autoSubmitSubtest,
    },
    results: getResults,
    pembahasan: getPembahasan,
};
