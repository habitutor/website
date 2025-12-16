import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
	subtest,
	subtestContent,
	subtestContentQuestions,
	userRecentSubtest,
	userSubtestProgress,
} from "../schema/subtest";

const SUBTEST_DATA = [
	{
		name: "Kemampuan Penalaran Umum",
		shortName: "PU",
		description:
			"Mengukur kemampuan berpikir logis, analitis, dan kritis melalui penalaran deduktif dan induktif.",
		order: 1,
	},
	{
		name: "Pengetahuan dan Pemahaman Umum",
		shortName: "PPU",
		description:
			"Mengukur kemampuan memahami dan menganalisis informasi dari berbagai teks dan konteks.",
		order: 2,
	},
	{
		name: "Kemampuan Memahami Bacaan dan Menulis",
		shortName: "PBM",
		description:
			"Mengukur kemampuan memahami isi bacaan, menemukan ide pokok, dan menyusun kalimat yang efektif.",
		order: 3,
	},
	{
		name: "Pengetahuan Kuantitatif",
		shortName: "PK",
		description:
			"Mengukur kemampuan menggunakan konsep matematika dasar dan penalaran numerik.",
		order: 4,
	},
	{
		name: "Literasi dalam Bahasa Indonesia",
		shortName: "LBI",
		description:
			"Mengukur kemampuan memahami, menganalisis, dan mengevaluasi teks berbahasa Indonesia.",
		order: 5,
	},
	{
		name: "Literasi dalam Bahasa Inggris",
		shortName: "LBing",
		description:
			"Mengukur kemampuan memahami dan menganalisis teks berbahasa Inggris.",
		order: 6,
	},
	{
		name: "Penalaran Matematika",
		shortName: "PM",
		description:
			"Mengukur kemampuan penalaran dan pemecahan masalah menggunakan konsep matematika tingkat lanjut.",
		order: 7,
	},
];

const SAMPLE_CONTENT = [
	{
		subtestShortName: "PU",
		contents: [
			{
				type: "materi" as const,
				title: "Materi 1: Pengantar Penalaran Logis",
				order: 1,
				videoUrl: "https://www.youtube.com/watch?v=example1",
				notes:
					"# Penalaran Logis\n\nPenalaran logis adalah kemampuan untuk berpikir secara sistematis dan menarik kesimpulan yang valid berdasarkan premis-premis yang diberikan.\n\n## Jenis Penalaran\n1. **Deduktif**: Dari umum ke khusus\n2. **Induktif**: Dari khusus ke umum",
			},
			{
				type: "materi" as const,
				title: "Materi 2: Silogisme dan Modus Ponens",
				order: 2,
				videoUrl: "https://www.youtube.com/watch?v=example2",
				notes:
					"# Silogisme\n\nSilogisme adalah bentuk penalaran yang terdiri dari dua premis dan satu kesimpulan.\n\n## Contoh\n- Premis 1: Semua manusia adalah makhluk hidup\n- Premis 2: Budi adalah manusia\n- Kesimpulan: Budi adalah makhluk hidup",
			},
			{
				type: "tips_and_trick" as const,
				title: "Tips & Trick: Cara Cepat Menyelesaikan Soal Logika",
				order: 3,
				videoUrl: "https://www.youtube.com/watch?v=example3",
				notes:
					"# Tips Cepat Soal Logika\n\n1. **Identifikasi jenis soal** - Tentukan apakah silogisme, modus ponens, atau modus tollens\n2. **Gambar diagram Venn** - Untuk soal himpunan\n3. **Gunakan kontrapositif** - Jika p → q, maka ¬q → ¬p\n4. **Eliminasi jawaban salah** - Cari kontradiksi",
			},
		],
	},
	{
		subtestShortName: "PM",
		contents: [
			{
				type: "materi" as const,
				title: "Materi 1: Dasar-dasar Aljabar",
				order: 1,
				videoUrl: "https://www.youtube.com/watch?v=example4",
				notes:
					"# Aljabar Dasar\n\n## Operasi Aljabar\n- Penjumlahan dan pengurangan suku sejenis\n- Perkalian dan pembagian bentuk aljabar\n- Faktorisasi",
			},
			{
				type: "materi" as const,
				title: "Materi 2: Persamaan dan Pertidaksamaan",
				order: 2,
				videoUrl: "https://www.youtube.com/watch?v=example5",
				notes:
					"# Persamaan dan Pertidaksamaan\n\n## Persamaan Linear\nax + b = 0 → x = -b/a\n\n## Persamaan Kuadrat\nax² + bx + c = 0\n- Rumus ABC: x = (-b ± √(b²-4ac)) / 2a",
			},
			{
				type: "tips_and_trick" as const,
				title: "Tips & Trick: Strategi Cepat Soal Matematika",
				order: 3,
				videoUrl: "https://www.youtube.com/watch?v=example6",
				notes:
					"# Tips Matematika UTBK\n\n1. **Substitusi jawaban** - Untuk soal pilihan ganda\n2. **Gunakan angka bulat** - Untuk mengecek rumus\n3. **Perhatikan satuan** - Konversi jika perlu\n4. **Baca soal teliti** - Pahami yang ditanyakan",
			},
		],
	},
];

export async function clearSubtest(db: NodePgDatabase) {
	await db.delete(userSubtestProgress);
	await db.delete(userRecentSubtest);
	await db.delete(subtestContentQuestions);
	await db.delete(subtestContent);
	await db.delete(subtest);
}

export async function seedSubtest(db: NodePgDatabase) {
	const subtests = await db.insert(subtest).values(SUBTEST_DATA).returning();

	console.log(`Subtest: ${subtests.length} subtests created`);

	let contentCount = 0;

	for (const sampleData of SAMPLE_CONTENT) {
		const targetSubtest = subtests.find(
			(s) => s.shortName === sampleData.subtestShortName,
		);

		if (!targetSubtest) continue;

		for (const content of sampleData.contents) {
			await db.insert(subtestContent).values({
				subtestId: targetSubtest.id,
				type: content.type,
				title: content.title,
				order: content.order,
				videoUrl: content.videoUrl,
				notes: content.notes,
			});
			contentCount++;
		}
	}

	console.log(`Subtest: ${contentCount} content items created`);
}
