import type { BunSQLDatabase } from "drizzle-orm/bun-sql";
import { contentItem, noteMaterial, recentContentView, subtest, userProgress, videoMaterial } from "../schema/subtest";

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

export async function clearSubtest(db: BunSQLDatabase) {
  const isMissingTableError = (error: unknown) => {
    if (!(error instanceof Error)) return false;
    if ("code" in error && (error as { code?: string }).code === "42P01") return true;
    return error.message.toLowerCase().includes("does not exist");
  };

  const deleteIfPresent = async (label: string, deleter: () => Promise<unknown>) => {
    try {
      await deleter();
    } catch (error) {
      if (isMissingTableError(error)) {
        console.warn(`${label} table not found, skipping clear`);
        return;
      }
      throw error;
    }
  };

  const cleanupSteps = [
    ["user_progress", () => db.delete(userProgress)],
    ["recent_content_view", () => db.delete(recentContentView)],
    ["video_material", () => db.delete(videoMaterial)],
    ["note_material", () => db.delete(noteMaterial)],
    ["content_item", () => db.delete(contentItem)],
    ["subtest", () => db.delete(subtest)],
  ] as const;

  for (const [label, deleter] of cleanupSteps) {
    await deleteIfPresent(label, deleter);
  }
}

export async function seedSubtest(db: BunSQLDatabase) {
  await db.transaction(async (tx) => {
    const insertedSubtests = await tx.insert(subtest).values(SUBTEST_DATA).returning({
      id: subtest.id,
      shortName: subtest.shortName,
    });

    console.log(`Subtest: ${insertedSubtests.length} created`);

    // const contentItemIds: number[] = [];

    // for (const sample of SAMPLE_CONTENT) {
    // 	const targetSubtest = insertedSubtests.find((s) => s.shortName === sample.subtestShortName);
    // 	if (!targetSubtest) continue;

    // 	for (const content of sample.contents) {
    // 		const [row] = await tx
    // 			.insert(contentItem)
    // 			.values({
    // 				subtestId: targetSubtest.id,
    // 				type: content.type,
    // 				title: content.title,
    // 				order: content.order,
    // 			})
    // 			.returning({ id: contentItem.id });

    // 		if (!row) throw new Error("Failed to insert content item");

    // 		const contentItemId = row.id;
    // 		contentItemIds.push(contentItemId);

    // 		if (content.video) {
    // 			const videoContent =
    // 				"content" in content.video && content.video.content
    // 					? content.video.content
    // 					: {
    // 							type: "doc",
    // 							version: 1,
    // 							content: [],
    // 						};

    // 			const serializedContent = JSON.parse(JSON.stringify(videoContent));

    // 			await tx.insert(videoMaterial).values({
    // 				contentItemId,
    // 				videoUrl: content.video.videoUrl,
    // 				content: serializedContent,
    // 			});
    // 		}

    // 		if (content.notes) {
    // 			const serializedNotes = JSON.parse(JSON.stringify(content.notes));

    // 			await tx.insert(noteMaterial).values({
    // 				contentItemId,
    // 				content: serializedNotes,
    // 			});
    // 		}
    // 	}
    // }

    // console.log("Content items created");
  });
}
