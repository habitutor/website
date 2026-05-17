import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
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
import { fisherYatesShuffle, TryoutError } from "./logic";

export const tryoutRepo = {
    /**
     * List tryout yang sudah dipublish
     */
    listPublishedTryouts: async ({
        db = defaultDb,
    }: {
        db?: DrizzleDatabase;
    }) => {
        const tryouts = await db.query.tryout.findMany({
            where: eq(tryout.status, "published"),
            orderBy: (t) => [desc(t.createdAt)],
            with: {
                subtes: {
                    columns: {
                        id: true,
                        jumlahSoal: true,
                        durasiMenit: true,
                    },
                },
            },
        });

        return tryouts.map((t) => ({
            id: t.id,
            judul: t.judul,
            deskripsi: t.deskripsi,
            mulaiAt: t.mulaiAt,
            selesaiAt: t.selesaiAt,
            totalSubtes: t.subtes.length,
            totalSoal: t.subtes.reduce((sum, s) => sum + s.jumlahSoal, 0),
            totalDurasi: t.subtes.reduce((sum, s) => sum + s.durasiMenit, 0),
            createdAt: t.createdAt,
        }));
    },

    /**
     * List subtes berdasarkan tryout ID
     */
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
            throw new TryoutError("BAD_REQUEST", "Tidak ada subtes di tryout ini");
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
        const jawabanMap = new Map<string, string | null>();

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
            throw new TryoutError("NOT_FOUND", "Sesi soal tidak ditemukan");
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
            throw new TryoutError("NOT_FOUND", "Sesi subtes tidak ditemukan");
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
                tryout: {
                    columns: {
                        judul: true,
                    },
                },
            },
        });

        if (!sesi) {
            throw new TryoutError("NOT_FOUND", "Sesi tidak ditemukan");
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
                    durasiMenit: ss.subtes.durasiMenit,
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
            judulTryout: sesi.tryout.judul,
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
            throw new TryoutError("FORBIDDEN", "Pembahasan hanya tersedia untuk member premium");
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
            throw new TryoutError("NOT_FOUND", "Soal tidak ditemukan");
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

    /**
     * Ambil info sesi subtes (untuk timer, nama subtest, dll)
     */
    getSesiSubtesInfo: async ({
        db = defaultDb,
        sesiSubtesId,
    }: {
        db?: DrizzleDatabase;
        sesiSubtesId: string;
    }) => {
        const sesiSubtes = await db.query.tryoutSesiSubtes.findFirst({
            where: eq(tryoutSesiSubtes.id, sesiSubtesId),
            with: {
                subtes: {
                    columns: {
                        namaSubtes: true,
                        jumlahSoal: true,
                        durasiMenit: true,
                    },
                },
                sesi: {
                    columns: {
                        id: true,
                        tryoutId: true,
                    },
                },
            },
        });

        if (!sesiSubtes) {
            throw new TryoutError("NOT_FOUND", "Sesi subtes tidak ditemukan");
        }

        return {
            sesiSubtesId: sesiSubtes.id,
            sesiId: sesiSubtes.sesi.id,
            tryoutId: sesiSubtes.sesi.tryoutId,
            namaSubtes: sesiSubtes.subtes.namaSubtes,
            jumlahSoal: sesiSubtes.subtes.jumlahSoal,
            durasiMenit: sesiSubtes.subtes.durasiMenit,
            mulaiAt: sesiSubtes.mulaiAt,
            deadlineAt: sesiSubtes.deadlineAt,
            status: sesiSubtes.status,
        };
    },

    /**
     * Ambil riwayat sesi tryout user
     */
    getHistory: async ({
        db = defaultDb,
        userId,
    }: {
        db?: DrizzleDatabase;
        userId: string;
    }) => {
        const history = await db.query.tryoutSesi.findMany({
            where: eq(tryoutSesi.userId, userId),
            orderBy: (ts) => [desc(ts.createdAt)],
            with: {
                tryout: {
                    columns: {
                        judul: true,
                        deskripsi: true,
                    },
                },
                sesiSubtes: {
                    columns: {
                        skorSubtes: true,
                    },
                },
            },
        });

        return history.map((h) => {
            const totalSkor = h.sesiSubtes.reduce((sum, ss) => sum + (ss.skorSubtes || 0), 0);
            return {
                id: h.id,
                tryoutId: h.tryoutId,
                judul: h.tryout.judul,
                status: h.status,
                totalSkor,
                mulaiAt: h.mulaiAt,
                selesaiAt: h.selesaiAt,
            };
        });
    },
};



