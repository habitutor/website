import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { contentItem, noteMaterial, recentContentView, subtest, userProgress, videoMaterial } from "../schema/subtest";

/* =========================
   MASTER DATA
========================= */

const SUBTEST_DATA = [
	{
		name: "Kemampuan Penalaran Umum",
		shortName: "PU",
		description: "Mengukur kemampuan berpikir logis, analitis, dan kritis melalui penalaran deduktif dan induktif.",
		order: 1,
	},
	{
		name: "Pengetahuan dan Pemahaman Umum",
		shortName: "PPU",
		description: "Mengukur kemampuan memahami dan menganalisis informasi dari berbagai teks dan konteks.",
		order: 2,
	},
	{
		name: "Kemampuan Memahami Bacaan dan Menulis",
		shortName: "PBM",
		description: "Mengukur kemampuan memahami isi bacaan, menemukan ide pokok, dan menyusun kalimat yang efektif.",
		order: 3,
	},
	{
		name: "Pengetahuan Kuantitatif",
		shortName: "PK",
		description: "Mengukur kemampuan menggunakan konsep matematika dasar dan penalaran numerik.",
		order: 4,
	},
	{
		name: "Literasi dalam Bahasa Indonesia",
		shortName: "LBI",
		description: "Mengukur kemampuan memahami, menganalisis, dan mengevaluasi teks berbahasa Indonesia.",
		order: 5,
	},
	{
		name: "Literasi dalam Bahasa Inggris",
		shortName: "LBing",
		description: "Mengukur kemampuan memahami dan menganalisis teks berbahasa Inggris.",
		order: 6,
	},
	{
		name: "Penalaran Matematika",
		shortName: "PM",
		description: "Mengukur kemampuan penalaran dan pemecahan masalah menggunakan konsep matematika tingkat lanjut.",
		order: 7,
	},
];

const SAMPLE_CONTENT = [
	{
		subtestShortName: "PU",
		contents: [
			{
				type: "material" as const,
				title: "Pengantar Penalaran Logis",
				order: 1,
				video: {
					videoUrl: "https://www.youtube.com/watch?v=sqoOzGMqCQU",
					content: {
						type: "doc",
						version: 1,
						content: [
							{
								type: "paragraph",
								content: [
									{
										type: "text",
										text: "Penalaran logis membantu menarik kesimpulan yang valid.",
									},
								],
							},
						],
					},
				},
				notes: {
					type: "doc",
					version: 1,
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Penalaran logis membantu menarik kesimpulan yang valid.",
								},
							],
						},
					],
				},
			},
			{
				type: "tips_and_trick" as const,
				title: "Tips Cepat Menjawab Soal Logika",
				order: 2,
				notes: {
					type: "doc",
					version: 1,
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Gunakan eliminasi opsi dan fokus pada pola.",
								},
							],
						},
					],
				},
			},
		],
	},
	{
		subtestShortName: "PM",
		contents: [
			{
				type: "material" as const,
				title: "Dasar Penalaran Matematika",
				order: 1,
				video: {
					videoUrl: "https://www.youtube.com/watch?v=example123",
				},
				notes: {
					type: "doc",
					version: 1,
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Fokus pada hubungan antar angka dan operasi.",
								},
							],
						},
					],
				},
			},
		],
	},
];

/* =========================
   CLEAR
========================= */

export async function clearSubtest(db: NodePgDatabase) {
	await db.delete(userProgress);
	await db.delete(recentContentView);
	await db.delete(videoMaterial);
	await db.delete(noteMaterial);
	await db.delete(contentItem);
	await db.delete(subtest);
}

/* =========================
   SEED
========================= */

export async function seedSubtest(db: NodePgDatabase) {
	/* ---------- SUBTEST ---------- */
	const insertedSubtests = await db.insert(subtest).values(SUBTEST_DATA).returning({
		id: subtest.id,
		shortName: subtest.shortName,
	});

	console.log(`✔ Subtest: ${insertedSubtests.length} created`);

	const contentItemIds: number[] = [];

	for (const sample of SAMPLE_CONTENT) {
		const targetSubtest = insertedSubtests.find((s) => s.shortName === sample.subtestShortName);
		if (!targetSubtest) continue;

		for (const content of sample.contents) {
			/* ---------- CONTENT ITEM ---------- */
			const [row] = await db
				.insert(contentItem)
				.values({
					subtestId: targetSubtest.id,
					type: content.type,
					title: content.title,
					order: content.order,
				})
				.returning({ id: contentItem.id });

			if (!row) throw new Error("Failed to insert content item");

			const contentItemId = row.id;
			contentItemIds.push(contentItemId);

			/* ---------- VIDEO ---------- */
			if (content.video) {
				await db.insert(videoMaterial).values({
					contentItemId,
					title: content.title,
					videoUrl: content.video.videoUrl,
					content:
						"content" in content.video && content.video.content
							? content.video.content
							: {
									source: "youtube",
								},
				});
			}

			/* ---------- NOTES ---------- */
			if (content.notes) {
				await db.insert(noteMaterial).values({
					contentItemId,
					content: content.notes,
				});
			}
		}
	}

	console.log("✔ Content items created");

	/* =========================
     USER PROGRESS (OPTIONAL)
  ========================= */

	// const SAMPLE_USERS = ["user_1", "user_2"];

	// for (const userId of SAMPLE_USERS) {
	// 	for (const contentItemId of contentItemIds) {
	// 		await db.insert(userProgress).values({
	// 			userId,
	// 			contentItemId,
	// 			videoCompleted: false,
	// 			noteCompleted: false,
	// 			quizCompleted: false,
	// 		});
	// 	}
	// }

	// console.log("✔ User progress seeded");

	/* =========================
     RECENT CONTENT VIEW (OPTIONAL)
  ========================= */

	// for (const userId of SAMPLE_USERS) {
	// 	for (const contentItemId of contentItemIds.slice(0, 3)) {
	// 		await db.insert(recentContentView).values({
	// 			userId,
	// 			contentItemId,
	// 		});
	// 	}
	// }

	// console.log("✔ Recent content view seeded");
}
