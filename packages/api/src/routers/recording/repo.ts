import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { recording } from "@habitutor/db/schema/recording";
import { and, desc, eq } from "drizzle-orm";

type RecordingCategory = "TKA" | "SNBT" | "MANDIRI";

type RecordingInput = {
  category: RecordingCategory;
  title: string;
  teacher: string | null;
  youtubeUrl: string;
  recordedAt: string;
  isPublished: boolean;
};

export const recordingRepo = {
  listPublishedByCategory: async ({
    db = defaultDb,
    category,
  }: {
    db?: DrizzleDatabase;
    category: RecordingCategory;
  }) => {
    return db
      .select({
        id: recording.id,
        category: recording.category,
        title: recording.title,
        teacher: recording.teacher,
        youtubeUrl: recording.youtubeUrl,
        recordedAt: recording.recordedAt,
      })
      .from(recording)
      .where(and(eq(recording.category, category), eq(recording.isPublished, true)))
      .orderBy(desc(recording.recordedAt), desc(recording.id));
  },

  listAll: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    return db.select().from(recording).orderBy(desc(recording.recordedAt), desc(recording.id));
  },

  create: async ({ db = defaultDb, input }: { db?: DrizzleDatabase; input: RecordingInput }) => {
    const [row] = await db.insert(recording).values(input).returning();
    return row;
  },

  update: async ({ db = defaultDb, id, input }: { db?: DrizzleDatabase; id: number; input: RecordingInput }) => {
    const [row] = await db
      .update(recording)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(recording.id, id))
      .returning();
    return row;
  },

  remove: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [row] = await db.delete(recording).where(eq(recording.id, id)).returning({ id: recording.id });
    return row;
  },
};