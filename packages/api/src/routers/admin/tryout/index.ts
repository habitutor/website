import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { admin } from "../../../index";
import { tryoutRepo } from "./repo";
import { toOrpcError } from "./logic";

const listTryouts = admin
    .route({
        path: "/admin/tryouts",
        method: "GET",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            "status?": "'draft' | 'published' | 'archived'",
            "page?": "number",
            "limit?": "number",
        }),
    )
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.listTryouts({
                status: input.status,
                page: input.page,
                limit: input.limit,
            });
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil daftar tryout");
        }
    });

const getTryoutDetail = admin
    .route({
        path: "/admin/tryouts/{tryoutId}",
        method: "GET",
        tags: ["Admin - Tryout"],
    })
    .input(type({ tryoutId: "string" }))
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.getTryoutDetail({ tryoutId: input.tryoutId });
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil detail tryout");
        }
    });

const createTryout = admin
    .route({
        path: "/admin/tryouts",
        method: "POST",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            judul: "string",
            "deskripsi?": "string | null",
            "mulaiAt?": "string | null",
            "selesaiAt?": "string | null",
        }),
    )
    .handler(async ({ input, context }) => {
        if (!context.session?.user?.id) {
            throw new ORPCError("UNAUTHORIZED", { message: "User tidak terautentikasi" });
        }
        try {
            const result = await tryoutRepo.createTryout({
                dibuatOleh: context.session.user.id,
                judul: input.judul,
                deskripsi: input.deskripsi ?? null,
                mulaiAt: input.mulaiAt ? new Date(input.mulaiAt) : null,
                selesaiAt: input.selesaiAt ? new Date(input.selesaiAt) : null,
            });
            return result;
        } catch (error) {
            throw toOrpcError(error, "Gagal membuat tryout");
        }
    });

/**
 * Update Tryout
 * PUT /admin/tryouts/{tryoutId}
 */
const updateTryout = admin
    .route({
        path: "/admin/tryouts/{tryoutId}",
        method: "PUT",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            tryoutId: "string",
            "judul?": "string",
            "deskripsi?": "string | null",
            "mulaiAt?": "string | null",
            "selesaiAt?": "string | null",
        }),
    )
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.updateTryout({
                tryoutId: input.tryoutId,
                judul: input.judul,
                deskripsi: input.deskripsi,
                mulaiAt: input.mulaiAt ? new Date(input.mulaiAt) : input.mulaiAt === null ? null : undefined,
                selesaiAt: input.selesaiAt ? new Date(input.selesaiAt) : input.selesaiAt === null ? null : undefined,
            });
        } catch (error) {
            throw toOrpcError(error, "Gagal update tryout");
        }
    });

/**
 * Delete Tryout
 * DELETE /admin/tryouts/{tryoutId}
 */
const deleteTryout = admin
    .route({
        path: "/admin/tryouts/{tryoutId}",
        method: "DELETE",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            tryoutId: "string",
        }),
    )
    .handler(async ({ input }) => {
        try {
            await tryoutRepo.deleteTryout({ tryoutId: input.tryoutId });
            return { success: true, message: "Tryout berhasil dihapus" };
        } catch (error) {
            throw toOrpcError(error, "Gagal menghapus tryout");
        }
    });

const createSubtes = admin
    .route({
        path: "/admin/tryouts/{tryoutId}/subtes",
        method: "POST",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            tryoutId: "string",
            namaSubtes: "string",
            jumlahSoal: "number",
            durasiMenit: "number",
            urutan: "number",
            "nilaiMinimum?": "number | null",
        }),
    )
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.createSubtes(input);
        } catch (error) {
            throw toOrpcError(error, "Gagal membuat subtes");
        }
    });

const listSubtesByTryout = admin
    .route({
        path: "/admin/tryouts/{tryoutId}/subtes",
        method: "GET",
        tags: ["Admin - Tryout"],
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
 * Update Subtes
 * PUT /admin/tryouts/subtes/{subtesId}
 */
const updateSubtes = admin
    .route({
        path: "/admin/tryouts/subtes/{subtesId}",
        method: "PUT",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            subtesId: "string",
            "namaSubtes?": "string",
            "jumlahSoal?": "number",
            "durasiMenit?": "number",
            "urutan?": "number",
            "nilaiMinimum?": "number | null",
        }),
    )
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.updateSubtes(input);
        } catch (error) {
            throw toOrpcError(error, "Gagal update subtes");
        }
    });

const getSubtesDetail = admin
    .route({
        path: "/admin/tryouts/subtes/{subtesId}",
        method: "GET",
        tags: ["Admin - Tryout"],
    })
    .input(type({ subtesId: "string" }))
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.getSubtesDetail({ subtesId: input.subtesId });
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil detail subtes");
        }
    });

/**
 * Delete Subtes
 * DELETE /admin/tryouts/subtes/{subtesId}
 */
const deleteSubtes = admin
    .route({
        path: "/admin/tryouts/subtes/{subtesId}",
        method: "DELETE",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            subtesId: "string",
        }),
    )
    .handler(async ({ input }) => {
        try {
            await tryoutRepo.deleteSubtes({ subtesId: input.subtesId });
            return { success: true, message: "Subtes berhasil dihapus" };
        } catch (error) {
            throw toOrpcError(error, "Gagal menghapus subtes");
        }
    });

const createSoal = admin
    .route({
        path: "/admin/tryouts/subtes/{subtesId}/soal",
        method: "POST",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            subtesId: "string",
            pertanyaan: "string",
            tipe: "'pilgan' | 'multiple'",
            poin: "number",
            "gambarUrl?": "string | null",
            "pembahasan?": "string | null",
            "pembahasanGambar?": "string | null",
        }),
    )
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.createSoal(input);
        } catch (error) {
            throw toOrpcError(error, "Gagal membuat soal");
        }
    });

const listSoalBySubtes = admin
    .route({
        path: "/admin/tryouts/subtes/{subtesId}/soal",
        method: "GET",
        tags: ["Admin - Tryout"],
    })
    .input(type({ subtesId: "string" }))
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.listSoalBySubtes({ subtesId: input.subtesId });
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil daftar soal");
        }
    });

/**
 * Update Soal
 * PUT /admin/tryouts/soal/{soalId}
 */
const updateSoal = admin
    .route({
        path: "/admin/tryouts/soal/{soalId}",
        method: "PUT",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            soalId: "string",
            "pertanyaan?": "string",
            "tipe?": "'pilgan' | 'multiple'",
            "poin?": "number",
            "gambarUrl?": "string | null",
            "pembahasan?": "string | null",
            "pembahasanGambar?": "string | null",
        }),
    )
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.updateSoal(input);
        } catch (error) {
            throw toOrpcError(error, "Gagal update soal");
        }
    });

const getSoalDetail = admin
    .route({
        path: "/admin/tryouts/soal/{soalId}",
        method: "GET",
        tags: ["Admin - Tryout"],
    })
    .input(type({ soalId: "string" }))
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.getSoalDetail({ soalId: input.soalId });
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil detail soal");
        }
    });

/**
 * Delete Soal
 * DELETE /admin/tryouts/soal/{soalId}
 */
const deleteSoal = admin
    .route({
        path: "/admin/tryouts/soal/{soalId}",
        method: "DELETE",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            soalId: "string",
        }),
    )
    .handler(async ({ input }) => {
        try {
            await tryoutRepo.deleteSoal({ soalId: input.soalId });
            return { success: true, message: "Soal berhasil dihapus" };
        } catch (error) {
            throw toOrpcError(error, "Gagal menghapus soal");
        }
    });

const createPilihanJawaban = admin
    .route({
        path: "/admin/tryouts/soal/{soalId}/pilihan",
        method: "POST",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            soalId: "string",
            label: "string",
            isi: "string",
            isBenar: "boolean",
            "gambarUrl?": "string | null",
        }),
    )
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.createPilihanJawaban(input);
        } catch (error) {
            throw toOrpcError(error, "Gagal membuat pilihan jawaban");
        }
    });

const listPilihanBySoal = admin
    .route({
        path: "/admin/tryouts/soal/{soalId}/pilihan",
        method: "GET",
        tags: ["Admin - Tryout"],
    })
    .input(type({ soalId: "string" }))
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.listPilihanBySoal({ soalId: input.soalId });
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil daftar pilihan jawaban");
        }
    });

/**
 * Update Pilihan Jawaban
 * PUT /admin/tryouts/pilihan/{pilihanId}
 */
const updatePilihanJawaban = admin
    .route({
        path: "/admin/tryouts/pilihan/{pilihanId}",
        method: "PUT",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            pilihanId: "string",
            "label?": "string",
            "isi?": "string",
            "isBenar?": "boolean",
            "gambarUrl?": "string | null",
        }),
    )
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.updatePilihanJawaban(input);
        } catch (error) {
            throw toOrpcError(error, "Gagal update pilihan jawaban");
        }
    });

/**
 * Delete Pilihan Jawaban
 * DELETE /admin/tryouts/pilihan/{pilihanId}
 */
const deletePilihanJawaban = admin
    .route({
        path: "/admin/tryouts/pilihan/{pilihanId}",
        method: "DELETE",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            pilihanId: "string",
        }),
    )
    .handler(async ({ input }) => {
        try {
            await tryoutRepo.deletePilihanJawaban({ pilihanId: input.pilihanId });
            return { success: true, message: "Pilihan jawaban berhasil dihapus" };
        } catch (error) {
            throw toOrpcError(error, "Gagal menghapus pilihan jawaban");
        }
    });

const publishTryout = admin
    .route({
        path: "/admin/tryouts/{tryoutId}/publish",
        method: "POST",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            tryoutId: "string",
        }),
    )
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.publishTryout({ tryoutId: input.tryoutId });
        } catch (error) {
            throw toOrpcError(error, "Gagal publish tryout");
        }
    });

/**
 * Unpublish (batalkan publish) Tryout - kembalikan ke status draft
 * POST /admin/tryouts/{tryoutId}/unpublish
 */
const unpublishTryout = admin
    .route({
        path: "/admin/tryouts/{tryoutId}/unpublish",
        method: "POST",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            tryoutId: "string",
        }),
    )
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.unpublishTryout({ tryoutId: input.tryoutId });
        } catch (error) {
            throw toOrpcError(error, "Gagal membatalkan publish tryout");
        }
    });

/**
 * Mulai Tryout - buat sesi baru atau return existing
 * POST /admin/tryouts/{tryoutId}/start
 */
const startTryout = admin
    .route({
        path: "/admin/tryouts/{tryoutId}/start",
        method: "POST",
        tags: ["Admin - Tryout"],
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
 * GET /admin/tryouts/subtes/{sesiSubtesId}/questions
 */
const getQuestions = admin
    .route({
        path: "/admin/tryouts/subtes/{sesiSubtesId}/questions",
        method: "GET",
        tags: ["Admin - Tryout"],
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
 * POST /admin/tryouts/questions/submit-answer
 */
const submitAnswer = admin
    .route({
        path: "/admin/tryouts/questions/submit-answer",
        method: "POST",
        tags: ["Admin - Tryout"],
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
 * POST /admin/tryouts/subtes/submit
 */
const submitSubtest = admin
    .route({
        path: "/admin/tryouts/subtes/submit",
        method: "POST",
        tags: ["Admin - Tryout"],
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
 * POST /admin/tryouts/subtes/auto-submit
 */
const autoSubmitSubtest = admin
    .route({
        path: "/admin/tryouts/subtes/auto-submit",
        method: "POST",
        tags: ["Admin - Tryout"],
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
 * GET /admin/tryouts/{sesiId}/results
 */
const getResults = admin
    .route({
        path: "/admin/tryouts/{sesiId}/results",
        method: "GET",
        tags: ["Admin - Tryout"],
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

const listSesiByTryout = admin
    .route({
        path: "/admin/tryouts/{tryoutId}/sesi",
        method: "GET",
        tags: ["Admin - Tryout"],
    })
    .input(
        type({
            tryoutId: "string",
            "page?": "number",
            "limit?": "number",
        }),
    )
    .handler(async ({ input }) => {
        try {
            return await tryoutRepo.listSesiByTryout({
                tryoutId: input.tryoutId,
                page: input.page,
                limit: input.limit,
            });
        } catch (error) {
            throw toOrpcError(error, "Gagal mengambil daftar sesi tryout");
        }
    });

/**
 * Ambil pembahasan soal (hanya untuk premium user)
 * GET /admin/tryouts/soal/{soalId}/pembahasan
 */
const getPembahasan = admin
    .route({
        path: "/admin/tryouts/soal/{soalId}/pembahasan",
        method: "GET",
        tags: ["Admin - Tryout"],
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

export const adminTryoutRouter = {
    list: {
        tryout: listTryouts,
        subtes: listSubtesByTryout,
        soal: listSoalBySubtes,
        pilihan: listPilihanBySoal,
        sesi: listSesiByTryout,
    },
    detail: {
        tryout: getTryoutDetail,
        subtes: getSubtesDetail,
        soal: getSoalDetail,
    },
    create: {
        tryout: createTryout,
        subtes: createSubtes,
        soal: createSoal,
        pilihan: createPilihanJawaban,
    },
    update: {
        tryout: updateTryout,
        subtes: updateSubtes,
        soal: updateSoal,
        pilihan: updatePilihanJawaban,
    },
    delete: {
        tryout: deleteTryout,
        subtes: deleteSubtes,
        soal: deleteSoal,
        pilihan: deletePilihanJawaban,
    },
    publish: publishTryout,
    unpublish: unpublishTryout,
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

