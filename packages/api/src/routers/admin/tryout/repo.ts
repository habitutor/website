import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { deleteCloudinaryImageByUrl, uploadTryoutImage } from "../../../lib/cloudinary";
import {
    tryout,
    tryoutJawaban,
    tryoutPilihanJawaban,
    tryoutSesi,
    tryoutSesiSoal,
    tryoutSesiSubtes,
    tryoutSoal,
    tryoutSubtes,
} from "@habitutor/db/schema/tryout";
import { user } from "@habitutor/db/schema/user";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { fisherYatesShuffle } from "./logic";

export const tryoutRepo = {
    listTryouts: async ({
        db = defaultDb,
        status,
        page = 1,
        limit = 20,
    }: {
        db?: DrizzleDatabase;
        status?: "draft" | "published" | "archived";
        page?: number;
        limit?: number;
    }) => {
        const safeLimit = Math.max(1, Math.min(limit, 100));
        const offset = (Math.max(page, 1) - 1) * safeLimit;
        const where = status ? eq(tryout.status, status) : undefined;

        const [rows, countRows] = await Promise.all([
            db.query.tryout.findMany({
                where,
                orderBy: (t, { desc: d }) => [d(t.createdAt)],
                limit: safeLimit,
                offset,
                with: {
                    subtes: true,
                },
            }),
            db
                .select({ count: sql<number>`count(*)` })
                .from(tryout)
                .where(where),
        ]);

        const total = Number(countRows[0]?.count || 0);
        return {
            items: rows,
            page: Math.max(page, 1),
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit),
        };
    },

    getTryoutDetail: async ({
        db = defaultDb,
        tryoutId,
    }: {
        db?: DrizzleDatabase;
        tryoutId: string;
    }) => {
        const row = await db.query.tryout.findFirst({
            where: eq(tryout.id, tryoutId),
            with: {
                subtes: {
                    orderBy: (s) => [s.urutan],
                },
            },
        });
        if (!row) throw new Error("Tryout tidak ditemukan");
        return row;
    },

    listSubtesByTryout: async ({
        db = defaultDb,
        tryoutId,
    }: {
        db?: DrizzleDatabase;
        tryoutId: string;
    }) => {
        return db.query.tryoutSubtes.findMany({
            where: eq(tryoutSubtes.tryoutId, tryoutId),
            orderBy: (s) => [s.urutan],
        });
    },

    getSubtesDetail: async ({
        db = defaultDb,
        subtesId,
    }: {
        db?: DrizzleDatabase;
        subtesId: string;
    }) => {
        const row = await db.query.tryoutSubtes.findFirst({
            where: eq(tryoutSubtes.id, subtesId),
            with: {
                soal: {
                    orderBy: (q, { asc: a }) => [a(q.createdAt)],
                },
            },
        });
        if (!row) throw new Error("Subtes tidak ditemukan");
        return row;
    },

    listSoalBySubtes: async ({
        db = defaultDb,
        subtesId,
    }: {
        db?: DrizzleDatabase;
        subtesId: string;
    }) => {
        return db.query.tryoutSoal.findMany({
            where: eq(tryoutSoal.subtesId, subtesId),
            orderBy: (q, { asc: a }) => [a(q.createdAt)],
        });
    },

    getSoalDetail: async ({
        db = defaultDb,
        soalId,
    }: {
        db?: DrizzleDatabase;
        soalId: string;
    }) => {
        const row = await db.query.tryoutSoal.findFirst({
            where: eq(tryoutSoal.id, soalId),
            with: {
                pilihanJawaban: {
                    orderBy: (p, { asc: a }) => [a(p.label)],
                },
            },
        });
        if (!row) throw new Error("Soal tidak ditemukan");
        return row;
    },

    listPilihanBySoal: async ({
        db = defaultDb,
        soalId,
    }: {
        db?: DrizzleDatabase;
        soalId: string;
    }) => {
        return db.query.tryoutPilihanJawaban.findMany({
            where: eq(tryoutPilihanJawaban.soalId, soalId),
            orderBy: (p, { asc: a }) => [a(p.label)],
        });
    },

    listSesiByTryout: async ({
        db = defaultDb,
        tryoutId,
        page = 1,
        limit = 20,
    }: {
        db?: DrizzleDatabase;
        tryoutId: string;
        page?: number;
        limit?: number;
    }) => {
        const safeLimit = Math.max(1, Math.min(limit, 100));
        const offset = (Math.max(page, 1) - 1) * safeLimit;
        const where = eq(tryoutSesi.tryoutId, tryoutId);

        const [rows, countRows] = await Promise.all([
            db.query.tryoutSesi.findMany({
                where,
                limit: safeLimit,
                offset,
                orderBy: (s, { desc: d }) => [d(s.createdAt)],
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    sesiSubtes: true,
                },
            }),
            db.select({ count: sql<number>`count(*)` }).from(tryoutSesi).where(where),
        ]);

        const total = Number(countRows[0]?.count || 0);
        return {
            items: rows,
            page: Math.max(page, 1),
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit),
        };
    },

    createTryout: async ({
        db = defaultDb,
        dibuatOleh,
        judul,
        deskripsi,
        mulaiAt,
        selesaiAt,
    }: {
        db?: DrizzleDatabase;
        dibuatOleh: string;
        judul: string;
        deskripsi?: string | null;
        mulaiAt?: Date | null;
        selesaiAt?: Date | null;
    }) => {
        const [created] = await db
            .insert(tryout)
            .values({
                dibuatOleh,
                judul,
                deskripsi: deskripsi ?? null,
                mulaiAt: mulaiAt ?? null,
                selesaiAt: selesaiAt ?? null,
                status: "draft",
            })
            .returning();

        if (!created) throw new Error("Gagal membuat tryout");
        return created;
    },

    updateTryout: async ({
        db = defaultDb,
        tryoutId,
        judul,
        deskripsi,
        mulaiAt,
        selesaiAt,
    }: {
        db?: DrizzleDatabase;
        tryoutId: string;
        judul?: string;
        deskripsi?: string | null;
        mulaiAt?: Date | null;
        selesaiAt?: Date | null;
    }) => {
        const [updated] = await db
            .update(tryout)
            .set({
                ...(judul !== undefined && { judul }),
                ...(deskripsi !== undefined && { deskripsi }),
                ...(mulaiAt !== undefined && { mulaiAt }),
                ...(selesaiAt !== undefined && { selesaiAt }),
                updatedAt: new Date(),
            })
            .where(eq(tryout.id, tryoutId))
            .returning();

        if (!updated) throw new Error("Tryout tidak ditemukan");
        return updated;
    },

    deleteTryout: async ({
        db = defaultDb,
        tryoutId,
    }: {
        db?: DrizzleDatabase;
        tryoutId: string;
    }) => {
        // Pastikan tryout masih draft sebelum dihapus
        const existing = await db.query.tryout.findFirst({
            where: eq(tryout.id, tryoutId),
        });

        if (!existing) throw new Error("Tryout tidak ditemukan");
        if (existing.status === "published") {
            throw new Error("Tryout yang sudah dipublish tidak dapat dihapus. Batalkan publish terlebih dahulu.");
        }

        const subtesList = await db.query.tryoutSubtes.findMany({
            where: eq(tryoutSubtes.tryoutId, tryoutId),
            columns: { id: true },
        });
        for (const subtes of subtesList) {
            const soalList = await db.query.tryoutSoal.findMany({
                where: eq(tryoutSoal.subtesId, subtes.id),
                with: {
                    pilihanJawaban: {
                        columns: {
                            gambarUrl: true,
                        },
                    },
                },
                columns: {
                    gambarUrl: true,
                    pembahasanGambar: true,
                },
            });

            for (const soal of soalList) {
                await deleteCloudinaryImageByUrl(soal.gambarUrl);
                await deleteCloudinaryImageByUrl(soal.pembahasanGambar);
                for (const pilihan of soal.pilihanJawaban) {
                    await deleteCloudinaryImageByUrl(pilihan.gambarUrl);
                }
            }
        }

        const [deleted] = await db
            .delete(tryout)
            .where(eq(tryout.id, tryoutId))
            .returning();

        if (!deleted) throw new Error("Gagal menghapus tryout");
        return deleted;
    },

    createSubtes: async ({
        db = defaultDb,
        tryoutId,
        namaSubtes,
        jumlahSoal,
        durasiMenit,
        urutan,
        nilaiMinimum,
    }: {
        db?: DrizzleDatabase;
        tryoutId: string;
        namaSubtes: string;
        jumlahSoal: number;
        durasiMenit: number;
        urutan: number;
        nilaiMinimum?: number | null;
    }) => {
        const [created] = await db
            .insert(tryoutSubtes)
            .values({
                tryoutId,
                namaSubtes,
                jumlahSoal,
                durasiMenit,
                urutan,
                nilaiMinimum: nilaiMinimum ?? null,
            })
            .returning();

        if (!created) throw new Error("Gagal membuat subtes");
        return created;
    },

    updateSubtes: async ({
        db = defaultDb,
        subtesId,
        namaSubtes,
        jumlahSoal,
        durasiMenit,
        urutan,
        nilaiMinimum,
    }: {
        db?: DrizzleDatabase;
        subtesId: string;
        namaSubtes?: string;
        jumlahSoal?: number;
        durasiMenit?: number;
        urutan?: number;
        nilaiMinimum?: number | null;
    }) => {
        const [updated] = await db
            .update(tryoutSubtes)
            .set({
                ...(namaSubtes !== undefined && { namaSubtes }),
                ...(jumlahSoal !== undefined && { jumlahSoal }),
                ...(durasiMenit !== undefined && { durasiMenit }),
                ...(urutan !== undefined && { urutan }),
                ...(nilaiMinimum !== undefined && { nilaiMinimum }),
            })
            .where(eq(tryoutSubtes.id, subtesId))
            .returning();

        if (!updated) throw new Error("Subtes tidak ditemukan");
        return updated;
    },

    deleteSubtes: async ({
        db = defaultDb,
        subtesId,
    }: {
        db?: DrizzleDatabase;
        subtesId: string;
    }) => {
        const soalList = await db.query.tryoutSoal.findMany({
            where: eq(tryoutSoal.subtesId, subtesId),
            with: {
                pilihanJawaban: {
                    columns: {
                        gambarUrl: true,
                    },
                },
            },
            columns: {
                gambarUrl: true,
                pembahasanGambar: true,
            },
        });

        for (const soal of soalList) {
            await deleteCloudinaryImageByUrl(soal.gambarUrl);
            await deleteCloudinaryImageByUrl(soal.pembahasanGambar);
            for (const pilihan of soal.pilihanJawaban) {
                await deleteCloudinaryImageByUrl(pilihan.gambarUrl);
            }
        }

        const [deleted] = await db
            .delete(tryoutSubtes)
            .where(eq(tryoutSubtes.id, subtesId))
            .returning();

        if (!deleted) throw new Error("Subtes tidak ditemukan");
        return deleted;
    },

    createSoal: async ({
        db = defaultDb,
        subtesId,
        pertanyaan,
        tipe,
        poin,
        gambarUrl,
        pembahasan,
        pembahasanGambar,
    }: {
        db?: DrizzleDatabase;
        subtesId: string;
        pertanyaan: string;
        tipe: "pilgan" | "multiple";
        poin: number;
        gambarUrl?: string | null;
        pembahasan?: string | null;
        pembahasanGambar?: string | null;
    }) => {
        const uploadedGambarUrl = gambarUrl ? await uploadTryoutImage(gambarUrl, "habitutor/tryout/Soal") : null;
        const uploadedPembahasanGambar = pembahasanGambar ? await uploadTryoutImage(pembahasanGambar, "habitutor/tryout/Soal") : null;

        const [created] = await db
            .insert(tryoutSoal)
            .values({
                subtesId,
                pertanyaan,
                tipe,
                poin,
                gambarUrl: uploadedGambarUrl,
                pembahasan: pembahasan ?? null,
                pembahasanGambar: uploadedPembahasanGambar,
            })
            .returning();

        if (!created) throw new Error("Gagal membuat soal");
        return created;
    },

    updateSoal: async ({
        db = defaultDb,
        soalId,
        pertanyaan,
        tipe,
        poin,
        gambarUrl,
        pembahasan,
        pembahasanGambar,
    }: {
        db?: DrizzleDatabase;
        soalId: string;
        pertanyaan?: string;
        tipe?: "pilgan" | "multiple";
        poin?: number;
        gambarUrl?: string | null;
        pembahasan?: string | null;
        pembahasanGambar?: string | null;
    }) => {
        const existing = await db.query.tryoutSoal.findFirst({
            where: eq(tryoutSoal.id, soalId),
            columns: {
                gambarUrl: true,
                pembahasanGambar: true,
            },
        });
        if (!existing) throw new Error("Soal tidak ditemukan");

        let nextGambarUrl: string | null | undefined = undefined;
        if (gambarUrl !== undefined) {
            if (gambarUrl === null) {
                await deleteCloudinaryImageByUrl(existing.gambarUrl);
                nextGambarUrl = null;
            } else if (gambarUrl !== existing.gambarUrl) {
                const uploaded = await uploadTryoutImage(gambarUrl, "habitutor/tryout/Soal");
                await deleteCloudinaryImageByUrl(existing.gambarUrl);
                nextGambarUrl = uploaded;
            } else {
                nextGambarUrl = existing.gambarUrl;
            }
        }

        let nextPembahasanGambar: string | null | undefined = undefined;
        if (pembahasanGambar !== undefined) {
            if (pembahasanGambar === null) {
                await deleteCloudinaryImageByUrl(existing.pembahasanGambar);
                nextPembahasanGambar = null;
            } else if (pembahasanGambar !== existing.pembahasanGambar) {
                const uploaded = await uploadTryoutImage(pembahasanGambar, "habitutor/tryout/Soal");
                await deleteCloudinaryImageByUrl(existing.pembahasanGambar);
                nextPembahasanGambar = uploaded;
            } else {
                nextPembahasanGambar = existing.pembahasanGambar;
            }
        }

        const [updated] = await db
            .update(tryoutSoal)
            .set({
                ...(pertanyaan !== undefined && { pertanyaan }),
                ...(tipe !== undefined && { tipe }),
                ...(poin !== undefined && { poin }),
                ...(nextGambarUrl !== undefined && { gambarUrl: nextGambarUrl }),
                ...(pembahasan !== undefined && { pembahasan }),
                ...(nextPembahasanGambar !== undefined && { pembahasanGambar: nextPembahasanGambar }),
            })
            .where(eq(tryoutSoal.id, soalId))
            .returning();

        if (!updated) throw new Error("Soal tidak ditemukan");
        return updated;
    },

    deleteSoal: async ({
        db = defaultDb,
        soalId,
    }: {
        db?: DrizzleDatabase;
        soalId: string;
    }) => {
        const existing = await db.query.tryoutSoal.findFirst({
            where: eq(tryoutSoal.id, soalId),
            with: {
                pilihanJawaban: {
                    columns: {
                        gambarUrl: true,
                    },
                },
            },
            columns: {
                gambarUrl: true,
                pembahasanGambar: true,
            },
        });
        if (!existing) throw new Error("Soal tidak ditemukan");

        await deleteCloudinaryImageByUrl(existing.gambarUrl);
        await deleteCloudinaryImageByUrl(existing.pembahasanGambar);
        for (const pilihan of existing.pilihanJawaban) {
            await deleteCloudinaryImageByUrl(pilihan.gambarUrl);
        }

        const [deleted] = await db
            .delete(tryoutSoal)
            .where(eq(tryoutSoal.id, soalId))
            .returning();

        if (!deleted) throw new Error("Soal tidak ditemukan");
        return deleted;
    },

    createPilihanJawaban: async ({
        db = defaultDb,
        soalId,
        label,
        isi,
        isBenar,
        gambarUrl,
    }: {
        db?: DrizzleDatabase;
        soalId: string;
        label: string;
        isi: string;
        isBenar: boolean;
        gambarUrl?: string | null;
    }) => {
        const uploadedGambarUrl = gambarUrl ? await uploadTryoutImage(gambarUrl, "habitutor/tryout/Pilihan") : null;

        const [created] = await db
            .insert(tryoutPilihanJawaban)
            .values({
                soalId,
                label,
                isi,
                isBenar,
                gambarUrl: uploadedGambarUrl,
            })
            .returning();

        if (!created) throw new Error("Gagal membuat pilihan jawaban");
        return created;
    },

    updatePilihanJawaban: async ({
        db = defaultDb,
        pilihanId,
        label,
        isi,
        isBenar,
        gambarUrl,
    }: {
        db?: DrizzleDatabase;
        pilihanId: string;
        label?: string;
        isi?: string;
        isBenar?: boolean;
        gambarUrl?: string | null;
    }) => {
        const existing = await db.query.tryoutPilihanJawaban.findFirst({
            where: eq(tryoutPilihanJawaban.id, pilihanId),
            columns: { gambarUrl: true },
        });
        if (!existing) throw new Error("Pilihan jawaban tidak ditemukan");

        let nextGambarUrl: string | null | undefined = undefined;
        if (gambarUrl !== undefined) {
            if (gambarUrl === null) {
                await deleteCloudinaryImageByUrl(existing.gambarUrl);
                nextGambarUrl = null;
            } else if (gambarUrl !== existing.gambarUrl) {
                const uploaded = await uploadTryoutImage(gambarUrl, "habitutor/tryout/Pilihan");
                await deleteCloudinaryImageByUrl(existing.gambarUrl);
                nextGambarUrl = uploaded;
            } else {
                nextGambarUrl = existing.gambarUrl;
            }
        }

        const [updated] = await db
            .update(tryoutPilihanJawaban)
            .set({
                ...(label !== undefined && { label }),
                ...(isi !== undefined && { isi }),
                ...(isBenar !== undefined && { isBenar }),
                ...(nextGambarUrl !== undefined && { gambarUrl: nextGambarUrl }),
            })
            .where(eq(tryoutPilihanJawaban.id, pilihanId))
            .returning();

        if (!updated) throw new Error("Pilihan jawaban tidak ditemukan");
        return updated;
    },

    deletePilihanJawaban: async ({
        db = defaultDb,
        pilihanId,
    }: {
        db?: DrizzleDatabase;
        pilihanId: string;
    }) => {
        const existing = await db.query.tryoutPilihanJawaban.findFirst({
            where: eq(tryoutPilihanJawaban.id, pilihanId),
            columns: { gambarUrl: true },
        });
        if (!existing) throw new Error("Pilihan jawaban tidak ditemukan");
        await deleteCloudinaryImageByUrl(existing.gambarUrl);

        const [deleted] = await db
            .delete(tryoutPilihanJawaban)
            .where(eq(tryoutPilihanJawaban.id, pilihanId))
            .returning();

        if (!deleted) throw new Error("Pilihan jawaban tidak ditemukan");
        return deleted;
    },

    publishTryout: async ({
        db = defaultDb,
        tryoutId,
    }: {
        db?: DrizzleDatabase;
        tryoutId: string;
    }) => {
        const [updated] = await db
            .update(tryout)
            .set({
                status: "published",
                updatedAt: new Date(),
            })
            .where(eq(tryout.id, tryoutId))
            .returning();

        if (!updated) throw new Error("Tryout tidak ditemukan");
        return updated;
    },

    unpublishTryout: async ({
        db = defaultDb,
        tryoutId,
    }: {
        db?: DrizzleDatabase;
        tryoutId: string;
    }) => {
        const [updated] = await db
            .update(tryout)
            .set({
                status: "draft",
                updatedAt: new Date(),
            })
            .where(eq(tryout.id, tryoutId))
            .returning();

        if (!updated) throw new Error("Tryout tidak ditemukan");
        return updated;
    },

    /**
     * Mulai tryout - buat sesi baru atau return existing
     */
    startTryout: async ({
        db = defaultDb,
        userId,
        tryoutId,
    }: {
        db?: DrizzleDatabase;
        userId: string;
        tryoutId: string;
    }) => {
        // Cek apakah sesi sudah ada
        const existingSesi = await db.query.tryoutSesi.findFirst({
            where: and(eq(tryoutSesi.userId, userId), eq(tryoutSesi.tryoutId, tryoutId)),
        });

        if (existingSesi) {
            // Return sesi yang existing beserta subtes pertama
            const firstSubtes = await db.query.tryoutSesiSubtes.findFirst({
                where: eq(tryoutSesiSubtes.sesiId, existingSesi.id),
                orderBy: (st) => [st.urutanPengerjaan],
            });
            return { sesi: existingSesi, sesiSubtes: firstSubtes };
        }

        // Buat sesi baru
        const newSesiArray = await db
            .insert(tryoutSesi)
            .values({
                userId,
                tryoutId,
                mulaiAt: new Date(),
                status: "berjalan",
            })
            .returning();

        if (!newSesiArray[0]) {
            throw new Error("Gagal membuat sesi");
        }
        const newSesi = newSesiArray[0];

        // Ambil subtes pertama
        const firstSubtes = await db.query.tryoutSubtes.findFirst({
            where: eq(tryoutSubtes.tryoutId, tryoutId),
            orderBy: (s) => [s.urutan],
        });

        if (!firstSubtes) {
            throw new Error("Tidak ada subtes di tryout ini");
        }

        // Buat sesi_subtes untuk subtes pertama
        const durationMs = firstSubtes.durasiMenit * 60 * 1000;
        const now = new Date();

        const newSesiSubtesArray = await db
            .insert(tryoutSesiSubtes)
            .values({
                sesiId: newSesi.id,
                subtesId: firstSubtes.id,
                urutanPengerjaan: 1,
                mulaiAt: now,
                deadlineAt: new Date(now.getTime() + durationMs),
                status: "berjalan",
            })
            .returning();

        if (!newSesiSubtesArray[0]) {
            throw new Error("Gagal membuat sesi subtes");
        }
        const newSesiSubtes = newSesiSubtesArray[0];

        // Ambil soal untuk subtes ini
        const soalList = await db.query.tryoutSoal.findMany({
            where: eq(tryoutSoal.subtesId, firstSubtes.id),
        });

        // Acak soal dengan Fisher-Yates shuffle
        const shuffledSoal = fisherYatesShuffle(soalList);

        // Buat sesi_soal untuk setiap soal
        const sesiSoalValues = shuffledSoal.map((soal, index) => ({
            sesiSubtesId: newSesiSubtes.id,
            soalId: soal.id,
            urutanTampil: index + 1,
            isDijawab: false,
            isRagu: false,
        }));

        await db.insert(tryoutSesiSoal).values(sesiSoalValues);

        return { sesi: newSesi, sesiSubtes: newSesiSubtes };
    },

    /**
     * Ambil soal berdasarkan sesi_subtes_id
     */
    getQuestions: async ({
        db = defaultDb,
        sesiSubtesId,
    }: {
        db?: DrizzleDatabase;
        sesiSubtesId: string;
    }) => {
        const sesiSoalList = await db.query.tryoutSesiSoal.findMany({
            where: eq(tryoutSesiSoal.sesiSubtesId, sesiSubtesId),
            orderBy: (ss) => [ss.urutanTampil],
            with: {
                soal: {
                    with: {
                        pilihanJawaban: {
                            columns: {
                                id: true,
                                label: true,
                                isi: true,
                                gambarUrl: true,
                                // isBenar TIDAK diikutkan di response
                            },
                            orderBy: (pj) => [pj.label],
                        },
                    },
                },
                sesiSubtes: {
                    columns: {
                        sesiId: true,
                    },
                },
            },
        });

        // Ambil jawaban yang sudah dipilih
        const sesiId = sesiSoalList[0]?.sesiSubtes.sesiId;
        let jawabanMap = new Map<string, string | null>();

        if (sesiId) {
            const jawaban = await db.query.tryoutJawaban.findMany({
                where: eq(tryoutJawaban.sesiId, sesiId),
                columns: {
                    sesiSoalId: true,
                    pilihanId: true,
                },
            });

            jawaban.forEach((j) => {
                jawabanMap.set(j.sesiSoalId, j.pilihanId);
            });
        }

        return sesiSoalList.map((ss) => ({
            sesiSoalId: ss.id,
            soalId: ss.soalId,
            pertanyaan: ss.soal.pertanyaan,
            gambarUrl: ss.soal.gambarUrl,
            tipe: ss.soal.tipe,
            poin: ss.soal.poin,
            pilihan: ss.soal.pilihanJawaban,
            jawaban_dipilih: jawabanMap.get(ss.id) || null,
            is_ragu: ss.isRagu,
        }));
    },

    /**
     * Submit jawaban per soal (upsert)
     */
    submitAnswer: async ({
        db = defaultDb,
        sesiId,
        sesiSoalId,
        pilihanId,
        isRagu,
    }: {
        db?: DrizzleDatabase;
        sesiId: string;
        sesiSoalId: string;
        pilihanId: string | null;
        isRagu: boolean;
    }) => {
        // Cek apakah sudah ada jawaban
        const existingJawaban = await db.query.tryoutJawaban.findFirst({
            where: eq(tryoutJawaban.sesiSoalId, sesiSoalId),
        });

        // Ambil info soal untuk cek jawaban yang benar
        const sesiSoal = await db.query.tryoutSesiSoal.findFirst({
            where: eq(tryoutSesiSoal.id, sesiSoalId),
            with: {
                soal: true,
            },
        });

        if (!sesiSoal) {
            throw new Error("Sesi soal tidak ditemukan");
        }

        let isBenar = false;
        let poinDapat = 0;

        if (pilihanId) {
            // Cek apakah pilihan yang dipilih adalah yang benar
            const pilihan = await db.query.tryoutPilihanJawaban.findFirst({
                where: eq(tryoutPilihanJawaban.id, pilihanId),
            });

            if (pilihan?.isBenar) {
                isBenar = true;
                poinDapat = sesiSoal.soal.poin;
            }
        }

        if (existingJawaban) {
            // Update
            const [updated] = await db
                .update(tryoutJawaban)
                .set({
                    pilihanId,
                    isBenar,
                    poinDapat,
                    dijawabAt: pilihanId ? new Date() : null,
                })
                .where(eq(tryoutJawaban.sesiSoalId, sesiSoalId))
                .returning();

            // Update sesi_soal
            await db
                .update(tryoutSesiSoal)
                .set({
                    isDijawab: !!pilihanId,
                    isRagu,
                })
                .where(eq(tryoutSesiSoal.id, sesiSoalId));

            return updated;
        } else {
            // Insert
            const [created] = await db
                .insert(tryoutJawaban)
                .values({
                    sesiId,
                    sesiSoalId,
                    pilihanId,
                    isBenar,
                    poinDapat,
                    dijawabAt: pilihanId ? new Date() : null,
                })
                .returning();

            // Update sesi_soal
            await db
                .update(tryoutSesiSoal)
                .set({
                    isDijawab: !!pilihanId,
                    isRagu,
                })
                .where(eq(tryoutSesiSoal.id, sesiSoalId));

            return created;
        }
    },

    /**
     * Submit subtes - hitung skor, update status, cek subtes berikutnya
     */
    submitSubtest: async ({
        db = defaultDb,
        sesiSubtesId,
        isExpired = false,
    }: {
        db?: DrizzleDatabase;
        sesiSubtesId: string;
        isExpired?: boolean;
    }) => {
        // Ambil sesi_subtes dengan relasi
        const sesiSubtes = await db.query.tryoutSesiSubtes.findFirst({
            where: eq(tryoutSesiSubtes.id, sesiSubtesId),
            with: {
                sesi: true,
                subtes: true,
            },
        });

        if (!sesiSubtes) {
            throw new Error("Sesi subtes tidak ditemukan");
        }

        // Hitung skor untuk subtes ini
        const jawabanList = await db
            .select()
            .from(tryoutJawaban)
            .innerJoin(
                tryoutSesiSoal,
                eq(tryoutJawaban.sesiSoalId, tryoutSesiSoal.id),
            )
            .where(eq(tryoutSesiSoal.sesiSubtesId, sesiSubtesId));

        const totalSkor = jawabanList.reduce((sum, record) => {
            return sum + (record.tryout_jawaban.poinDapat || 0);
        }, 0);

        // Cek apakah lulus
        const nilaiMinimum = sesiSubtes.subtes.nilaiMinimum || 0;
        const isLulus = totalSkor >= nilaiMinimum;

        // Update sesi_subtes
        const updatedSesiSubtesArray = await db
            .update(tryoutSesiSubtes)
            .set({
                skorSubtes: totalSkor,
                isLulus,
                status: isExpired ? "expired" : "selesai",
                selesaiAt: new Date(),
            })
            .where(eq(tryoutSesiSubtes.id, sesiSubtesId))
            .returning();

        if (!updatedSesiSubtesArray[0]) {
            throw new Error("Gagal update sesi subtes");
        }
        const updatedSesiSubtes = updatedSesiSubtesArray[0];

        // Cek subtes berikutnya
        const nextSubtes = await db.query.tryoutSubtes.findFirst({
            where: and(
                eq(tryoutSubtes.tryoutId, sesiSubtes.sesi.tryoutId),
                gt(tryoutSubtes.urutan, sesiSubtes.subtes.urutan),
            ),
            orderBy: (s) => [s.urutan],
        });

        let nextSesiSubtes = null;

        if (nextSubtes) {
            // Cek apakah sudah ada sesi_subtes untuk subtes berikutnya
            const existingNextSesiSubtes = await db.query.tryoutSesiSubtes.findFirst({
                where: and(
                    eq(tryoutSesiSubtes.sesiId, sesiSubtes.sesi.id),
                    eq(tryoutSesiSubtes.subtesId, nextSubtes.id),
                ),
            });

            if (!existingNextSesiSubtes) {
                // Buat sesi_subtes baru untuk subtes berikutnya
                const durationMs = nextSubtes.durasiMenit * 60 * 1000;
                const now = new Date();

                const createdArray = await db
                    .insert(tryoutSesiSubtes)
                    .values({
                        sesiId: sesiSubtes.sesi.id,
                        subtesId: nextSubtes.id,
                        urutanPengerjaan: sesiSubtes.urutanPengerjaan + 1,
                        mulaiAt: now,
                        deadlineAt: new Date(now.getTime() + durationMs),
                        status: "berjalan",
                    })
                    .returning();

                if (!createdArray[0]) {
                    throw new Error("Gagal membuat sesi subtes berikutnya");
                }
                const created = createdArray[0];

                nextSesiSubtes = created;

                // Ambil soal untuk subtes berikutnya dan acak
                const soalList = await db.query.tryoutSoal.findMany({
                    where: eq(tryoutSoal.subtesId, nextSubtes.id),
                });

                const shuffledSoal = fisherYatesShuffle(soalList);

                const sesiSoalValues = shuffledSoal.map((soal, index) => ({
                    sesiSubtesId: created.id,
                    soalId: soal.id,
                    urutanTampil: index + 1,
                    isDijawab: false,
                    isRagu: false,
                }));

                await db.insert(tryoutSesiSoal).values(sesiSoalValues);
            } else {
                nextSesiSubtes = existingNextSesiSubtes;
            }
        }

        return {
            currentSubtes: {
                id: updatedSesiSubtes.id,
                skorSubtes: updatedSesiSubtes.skorSubtes,
                isLulus: updatedSesiSubtes.isLulus,
                status: updatedSesiSubtes.status,
                namaSubtes: sesiSubtes.subtes.namaSubtes,
            },
            nextSubtes: nextSesiSubtes
                ? {
                    id: nextSesiSubtes.id,
                    subtesId: nextSubtes!.id,
                    namaSubtes: nextSubtes!.namaSubtes,
                    durasiMenit: nextSubtes!.durasiMenit,
                    mulaiAt: nextSesiSubtes.mulaiAt,
                    deadlineAt: nextSesiSubtes.deadlineAt,
                }
                : null,
        };
    },

    /**
     * Ambil hasil akhir (total skor, peringkat, skor per subtes)
     */
    getResult: async ({
        db = defaultDb,
        sesiId,
    }: {
        db?: DrizzleDatabase;
        sesiId: string;
    }) => {
        // Ambil sesi dengan user info
        const sesi = await db.query.tryoutSesi.findFirst({
            where: eq(tryoutSesi.id, sesiId),
            with: {
                user: {
                    columns: {
                        isPremium: true,
                        premiumExpiresAt: true,
                    },
                },
            },
        });

        if (!sesi) {
            throw new Error("Sesi tidak ditemukan");
        }

        // Ambil semua sesi_subtes untuk hitung total skor
        const allSubtesScores = await db.query.tryoutSesiSubtes.findMany({
            where: eq(tryoutSesiSubtes.sesiId, sesiId),
        });

        const totalSkor = allSubtesScores.reduce((sum, ss) => sum + (ss.skorSubtes || 0), 0);

        // Ambil semua sesi untuk tryout yang sama untuk hitung peringkat
        const allSesi = await db
            .select({
                id: tryoutSesi.id,
                totalSkor: sql<number>`COALESCE(SUM(${tryoutSesiSubtes.skorSubtes}), 0)`.as("total_skor"),
            })
            .from(tryoutSesi)
            .leftJoin(tryoutSesiSubtes, eq(tryoutSesi.id, tryoutSesiSubtes.sesiId))
            .where(eq(tryoutSesi.tryoutId, sesi.tryoutId))
            .groupBy(tryoutSesi.id)
            .orderBy(desc(sql`total_skor`));

        const ranking =
            allSesi.findIndex((s) => s.id === sesiId) + 1;

        // Ambil skor per subtes dengan relasi
        const subtesScores = await db.query.tryoutSesiSubtes.findMany({
            where: eq(tryoutSesiSubtes.sesiId, sesiId),
            with: {
                subtes: true,
            },
        });

        const skorPerSubtes = await Promise.all(
            subtesScores.map(async (ss) => {
                // Hitung statistik jawaban
                const jawaban = await db
                    .select({
                        isBenar: tryoutJawaban.isBenar,
                        isDijawab: tryoutSesiSoal.isDijawab,
                    })
                    .from(tryoutJawaban)
                    .innerJoin(
                        tryoutSesiSoal,
                        eq(tryoutJawaban.sesiSoalId, tryoutSesiSoal.id),
                    )
                    .where(eq(tryoutSesiSoal.sesiSubtesId, ss.id));

                const benar = jawaban.filter((j) => j.isDijawab && j.isBenar).length;
                const salah = jawaban.filter((j) => j.isDijawab && !j.isBenar).length;
                const kosong = jawaban.filter((j) => !j.isDijawab).length;

                return {
                    subtesId: ss.subtesId,
                    namaSubtes: ss.subtes.namaSubtes,
                    skor: ss.skorSubtes || 0,
                    isLulus: ss.isLulus,
                    benar,
                    salah,
                    kosong,
                };
            }),
        );

        // Cek akses pembahasan
        const premiumExpiresAt = sesi.user?.premiumExpiresAt;
        const aksesPembahasan =
            Boolean(sesi.user?.isPremium) &&
            premiumExpiresAt !== null &&
            premiumExpiresAt !== undefined &&
            new Date() < premiumExpiresAt;

        return {
            sesiId,
            totalSkor,
            peringkat: ranking,
            aksesPembahasan,
            skorPerSubtes,
        };
    },

    /**
     * Ambil pembahasan soal (hanya untuk premium user)
     */
    getPembahasan: async ({
        db = defaultDb,
        soalId,
        userId,
    }: {
        db?: DrizzleDatabase;
        soalId: string;
        userId: string;
    }) => {
        // Cek apakah user premium
        const userData = await db.query.user.findFirst({
            where: eq(user.id, userId),
            columns: {
                isPremium: true,
                premiumExpiresAt: true,
            },
        });

        if (!userData?.isPremium || !userData.premiumExpiresAt || new Date() >= userData.premiumExpiresAt) {
            throw new Error("PREMIUM_REQUIRED");
        }

        // Ambil soal dengan pembahasan
        const soal = await db.query.tryoutSoal.findFirst({
            where: eq(tryoutSoal.id, soalId),
            with: {
                pilihanJawaban: {
                    orderBy: (pj) => [pj.label],
                },
            },
        });

        if (!soal) {
            throw new Error("Soal tidak ditemukan");
        }

        return {
            soalId: soal.id,
            pertanyaan: soal.pertanyaan,
            gambarUrl: soal.gambarUrl,
            tipe: soal.tipe,
            poin: soal.poin,
            pilihan: soal.pilihanJawaban.map((p) => ({
                id: p.id,
                label: p.label,
                isi: p.isi,
                gambarUrl: p.gambarUrl,
                isBenar: p.isBenar,
            })),
            pembahasan: soal.pembahasan,
            pembahasanGambar: soal.pembahasanGambar,
        };
    },

    /**
     * Auto submit saat waktu habis
     */
    autoSubmitSubtest: async ({
        db = defaultDb,
        sesiSubtesId,
    }: {
        db?: DrizzleDatabase;
        sesiSubtesId: string;
    }) => {
        return tryoutRepo.submitSubtest({ db, sesiSubtesId, isExpired: true });
    },
};
