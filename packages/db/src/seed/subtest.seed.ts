import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  subtest,
  contentItem,
  videoMaterial,
  noteMaterial,
  contentQuiz,
  userProgress,
  recentContentView,
} from "../schema/subtest";

/* =========================
   MASTER DATA
========================= */

const SUBTEST_DATA = [
  {
    name: "Kemampuan Penalaran Umum",
    shortName: "PU",
    description:
      "Mengukur kemampuan berpikir logis, analitis, dan kritis melalui penalaran deduktif dan induktif.",
    order: 1,
  },
  {
    name: "Penalaran Matematika",
    shortName: "PM",
    description:
      "Mengukur kemampuan penalaran dan pemecahan masalah matematika.",
    order: 2,
  },
];

const SAMPLE_CONTENT = [
  {
    subtestShortName: "PU",
    contents: [
      {
        type: "material" as const,
        title: "Materi 1: Pengantar Penalaran Logis",
        order: 1,
        video: {
          videoType: "link" as const,
          videoUrl: "https://www.youtube.com/watch?v=example1",
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
                  text: "Penalaran logis adalah kemampuan berpikir sistematis untuk menarik kesimpulan yang valid.",
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
  await db.delete(contentQuiz);
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
  const insertedSubtests = await db
    .insert(subtest)
    .values(SUBTEST_DATA)
    .returning({
      id: subtest.id,
      shortName: subtest.shortName,
    });

  console.log(`Subtest: ${insertedSubtests.length} subtests created`);

  let contentCount = 0;

  for (const sample of SAMPLE_CONTENT) {
    const targetSubtest = insertedSubtests.find(
      (s) => s.shortName === sample.subtestShortName,
    );

    if (!targetSubtest) continue;

    for (const content of sample.contents) {
      /* ---------- CONTENT ITEM ---------- */
      const insertedContent = await db
        .insert(contentItem)
        .values({
          subtestId: targetSubtest.id,
          type: content.type,
          title: content.title,
          order: content.order,
        })
        .returning({ id: contentItem.id });

      const row = insertedContent.at(0);
      if (!row) {
        throw new Error("Failed to insert content item");
      }

      const contentItemId = row.id;

      /* ---------- VIDEO ---------- */
      if (content.video) {
        await db.insert(videoMaterial).values({
          contentItemId,
          title: content.title,
          videoType: content.video.videoType,
          videoUrl: content.video.videoUrl,
          content: {
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

      contentCount++;
    }
  }

  console.log(`Subtest: ${contentCount} content items created`);
}
