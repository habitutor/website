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
			/* =========================
         MATERIAL – LONG CONTENT
      ========================== */
			{
				type: "material" as const,
				title: "Pendalaman Penalaran Logis dan Pola Berpikir",
				order: 1,
				video: {
					videoUrl: "https://www.youtube.com/watch?v=sqoOzGMqCQU",
					content: {
						type: "doc",
						version: 1,
						content: [
							{
								type: "heading",
								attrs: { level: 2 },
								content: [{ type: "text", text: "Apa itu Penalaran Logis?" }],
							},
							{
								type: "paragraph",
								content: [
									{
										type: "text",
										text: "Penalaran logis adalah kemampuan untuk menarik kesimpulan yang benar berdasarkan informasi atau premis yang tersedia. Kemampuan ini menjadi fondasi utama dalam menyelesaikan berbagai soal kemampuan kognitif, khususnya pada subtest Penalaran Umum.",
									},
								],
							},
							{
								type: "paragraph",
								content: [
									{
										type: "text",
										marks: [{ type: "bold" }],
										text: "Dalam konteks ujian, ",
									},
									{
										type: "text",
										text: "penalaran logis tidak menguji hafalan, melainkan cara berpikir dan konsistensi logika seseorang.",
									},
								],
							},

							{
								type: "heading",
								attrs: { level: 3 },
								content: [{ type: "text", text: "Jenis-Jenis Penalaran" }],
							},

							{
								type: "bulletList",
								content: [
									{
										type: "listItem",
										content: [
											{
												type: "paragraph",
												content: [
													{
														type: "text",
														marks: [{ type: "bold" }],
														text: "Deduktif: ",
													},
													{
														type: "text",
														text: "menarik kesimpulan spesifik dari pernyataan umum. Contoh: Semua manusia fana → Andi manusia → Andi fana.",
													},
												],
											},
										],
									},
									{
										type: "listItem",
										content: [
											{
												type: "paragraph",
												content: [
													{
														type: "text",
														marks: [{ type: "bold" }],
														text: "Induktif: ",
													},
													{
														type: "text",
														text: "menyimpulkan pola umum dari beberapa contoh khusus. Jenis ini sering muncul dalam soal deret dan analogi.",
													},
												],
											},
										],
									},
									{
										type: "listItem",
										content: [
											{
												type: "paragraph",
												content: [
													{
														type: "text",
														marks: [{ type: "bold" }],
														text: "Abduktif: ",
													},
													{
														type: "text",
														text: "menentukan penjelasan paling masuk akal dari suatu fenomena, meskipun tidak selalu pasti benar.",
													},
												],
											},
										],
									},
								],
							},

							{
								type: "heading",
								attrs: { level: 3 },
								content: [{ type: "text", text: "Kesalahan Umum Peserta" }],
							},

							{
								type: "orderedList",
								attrs: { order: 1 },
								content: [
									{
										type: "listItem",
										content: [
											{
												type: "paragraph",
												content: [
													{
														type: "text",
														text: "Terlalu cepat menyimpulkan tanpa memeriksa semua premis.",
													},
												],
											},
										],
									},
									{
										type: "listItem",
										content: [
											{
												type: "paragraph",
												content: [
													{
														type: "text",
														text: "Terjebak asumsi pribadi yang tidak tertulis di soal.",
													},
												],
											},
										],
									},
									{
										type: "listItem",
										content: [
											{
												type: "paragraph",
												content: [
													{
														type: "text",
														text: "Tidak membedakan antara kondisi yang perlu dan yang cukup.",
													},
												],
											},
										],
									},
								],
							},

							{
								type: "blockquote",
								content: [
									{
										type: "paragraph",
										content: [
											{
												type: "text",
												text: "Dalam penalaran logis, yang terpenting bukan seberapa cepat kamu menjawab, tetapi seberapa konsisten alur berpikirmu.",
											},
										],
									},
								],
							},

							{
								type: "paragraph",
								content: [
									{
										type: "text",
										marks: [{ type: "italic" }],
										text: "Catatan: Biasakan membaca ulang semua premis sebelum menentukan jawaban.",
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
							type: "heading",
							attrs: { level: 3 },
							content: [{ type: "text", text: "Ringkasan Materi" }],
						},
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Penalaran logis menguji konsistensi berpikir, bukan kecepatan. Fokus utama adalah memahami premis, menghindari asumsi tambahan, dan mengevaluasi validitas kesimpulan.",
								},
							],
						},
						{
							type: "bulletList",
							content: [
								{
									type: "listItem",
									content: [
										{
											type: "paragraph",
											content: [{ type: "text", text: "Baca premis satu per satu." }],
										},
									],
								},
								{
									type: "listItem",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Jangan menambahkan informasi eksternal.",
												},
											],
										},
									],
								},
								{
									type: "listItem",
									content: [
										{
											type: "paragraph",
											content: [{ type: "text", text: "Gunakan eliminasi jawaban." }],
										},
									],
								},
							],
						},
					],
				},
			},

			/* =========================
         TIPS & TRICK – LONG
      ========================== */
			{
				type: "tips_and_trick" as const,
				title: "Framework Cepat Menyelesaikan Soal Logika",
				order: 1,
				notes: {
					type: "doc",
					version: 1,
					content: [
						{
							type: "heading",
							attrs: { level: 3 },
							content: [{ type: "text", text: "Framework 3 Langkah" }],
						},
						{
							type: "orderedList",
							content: [
								{
									type: "listItem",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													marks: [{ type: "bold" }],
													text: "Identifikasi Premis",
												},
											],
										},
									],
								},
								{
									type: "listItem",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													marks: [{ type: "bold" }],
													text: "Uji Konsistensi Logika",
												},
											],
										},
									],
								},
								{
									type: "listItem",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													marks: [{ type: "bold" }],
													text: "Eliminasi Jawaban Lemah",
												},
											],
										},
									],
								},
							],
						},
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Jika sebuah jawaban hanya benar ketika kamu menambahkan asumsi baru, maka jawaban tersebut hampir pasti salah.",
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
	// Clear in order to respect foreign key constraints
	// Use try-catch to handle cases where tables don't exist yet
	try {
		await db.delete(userProgress);
	} catch {
		// Table might not exist yet, ignore
		console.log("⚠ user_progress table not found, skipping clear");
	}

	try {
		await db.delete(recentContentView);
	} catch {
		console.log("⚠ recent_content_view table not found, skipping clear");
	}

	try {
		await db.delete(videoMaterial);
	} catch {
		console.log("⚠ video_material table not found, skipping clear");
	}

	try {
		await db.delete(noteMaterial);
	} catch {
		console.log("⚠ note_material table not found, skipping clear");
	}

	try {
		await db.delete(contentItem);
	} catch {
		console.log("⚠ content_item table not found, skipping clear");
	}

	try {
		await db.delete(subtest);
	} catch {
		console.log("⚠ subtest table not found, skipping clear");
	}
}

/* =========================
   SEED
========================= */

export async function seedSubtest(db: NodePgDatabase) {
	await db.transaction(async (tx) => {
		/* ---------- SUBTEST ---------- */
		const insertedSubtests = await tx.insert(subtest).values(SUBTEST_DATA).returning({
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
				const [row] = await tx
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
					const videoContent =
						"content" in content.video && content.video.content
							? content.video.content
							: {
									type: "doc",
									version: 1,
									content: [],
								};

					// Ensure content is a plain serializable object
					const serializedContent = JSON.parse(JSON.stringify(videoContent));

					await tx.insert(videoMaterial).values({
						contentItemId,
						videoUrl: content.video.videoUrl,
						content: serializedContent,
					});
				}

				/* ---------- NOTES ---------- */
				if (content.notes) {
					// Ensure content is a plain serializable object
					const serializedNotes = JSON.parse(JSON.stringify(content.notes));

					await tx.insert(noteMaterial).values({
						contentItemId,
						content: serializedNotes,
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
		// 		await tx.insert(userProgress).values({
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
		// 		await tx.insert(recentContentView).values({
		// 			userId,
		// 			contentItemId,
		// 		});
		// 	}
		// }

		// console.log("✔ Recent content view seeded");
	});
}
