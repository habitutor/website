import { db } from "@habitutor/db";
import { subtest, subtestContent } from "@habitutor/db/schema/subtest";
import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { eq } from "drizzle-orm";
import { admin } from "../../index";

const listSubtests = admin
  .route({
    path: "/admin/subtests",
    method: "GET",
    tags: ["Admin - Subtests"],
  })
  .handler(async () => {
    const subtests = await db
      .select({
        id: subtest.id,
        name: subtest.name,
        shortName: subtest.shortName,
        description: subtest.description,
        order: subtest.order,
      })
      .from(subtest)
      .orderBy(subtest.order);

    return subtests;
  });

const getSubtest = admin
  .route({
    path: "/admin/subtests/{id}",
    method: "GET",
    tags: ["Admin - Subtests"],
  })
  .input(type({ id: "number" }))
  .handler(async ({ input }) => {
    const [subtestData] = await db
      .select({
        id: subtest.id,
        name: subtest.name,
        shortName: subtest.shortName,
        description: subtest.description,
        order: subtest.order,
      })
      .from(subtest)
      .where(eq(subtest.id, input.id))
      .limit(1);

    if (!subtestData)
      throw new ORPCError("NOT_FOUND", {
        message: "Subtest tidak ditemukan",
      });

    const contents = await db
      .select({
        id: subtestContent.id,
        type: subtestContent.type,
        title: subtestContent.title,
        order: subtestContent.order,
        videoUrl: subtestContent.videoUrl,
        notes: subtestContent.notes,
      })
      .from(subtestContent)
      .where(eq(subtestContent.subtestId, input.id))
      .orderBy(subtestContent.order);

    return {
      ...subtestData,
      contents,
    };
  });

const getContent = admin
  .route({
    path: "/admin/subtests/content/{contentId}",
    method: "GET",
    tags: ["Admin - Subtest Content"],
  })
  .input(type({ contentId: "number" }))
  .handler(async ({ input }) => {
    const [content] = await db
      .select({
        id: subtestContent.id,
        subtestId: subtestContent.subtestId,
        type: subtestContent.type,
        title: subtestContent.title,
        order: subtestContent.order,
        videoUrl: subtestContent.videoUrl,
        notes: subtestContent.notes,
      })
      .from(subtestContent)
      .where(eq(subtestContent.id, input.contentId))
      .limit(1);

    if (!content)
      throw new ORPCError("NOT_FOUND", {
        message: "Konten tidak ditemukan",
      });

    return content;
  });

const updateContentNotes = admin
  .route({
    path: "/admin/subtests/content/{contentId}",
    method: "PUT",
    tags: ["Admin - Subtest Content"],
  })
  .input(
    type({
      contentId: "number",
      notes: "string",
    })
  )
  .handler(async ({ input }) => {
    try {
      const parsed = JSON.parse(input.notes);
      if (!parsed || typeof parsed !== "object" || !("root" in parsed)) {
        throw new Error("Invalid Lexical JSON format");
      }
    } catch {
      throw new ORPCError("BAD_REQUEST", {
        message: "Notes harus dalam format Lexical JSON yang valid",
      });
    }

    const [updated] = await db
      .update(subtestContent)
      .set({
        notes: input.notes,
      })
      .where(eq(subtestContent.id, input.contentId))
      .returning();

    if (!updated)
      throw new ORPCError("NOT_FOUND", {
        message: "Konten tidak ditemukan",
      });

    return {
      message: "Berhasil memperbarui konten",
      content: updated,
    };
  });

/*
  Update full content (title, videoUrl, notes)
*/
const updateContent = admin
  .route({
    path: "/admin/subtests/content/{contentId}/full",
    method: "PUT",
    tags: ["Admin - Subtest Content"],
  })
  .input(
    type({
      contentId: "number",
      title: "string",
      "videoUrl?": "string",
      "notes?": "string",
    })
  )
  .handler(async ({ input }) => {
    // Validate notes format if provided
    if (input.notes) {
      try {
        const parsed = JSON.parse(input.notes);
        if (!parsed || typeof parsed !== "object" || !("root" in parsed)) {
          throw new Error("Invalid Lexical JSON format");
        }
      } catch {
        throw new ORPCError("BAD_REQUEST", {
          message: "Notes harus dalam format Lexical JSON yang valid",
        });
      }
    }

    // Convert empty strings to null for optional fields
    const updateData: {
      title: string;
      videoUrl?: string | null;
      notes?: string | null;
    } = {
      title: input.title,
      videoUrl: input.videoUrl === undefined ? undefined : (input.videoUrl || null),
      notes: input.notes === undefined ? undefined : (input.notes || null),
    };

    const [updated] = await db
      .update(subtestContent)
      .set(updateData)
      .where(eq(subtestContent.id, input.contentId))
      .returning();

    if (!updated)
      throw new ORPCError("NOT_FOUND", {
        message: "Konten tidak ditemukan",
      });

    return {
      message: "Berhasil memperbarui konten",
      content: updated,
    };
  });

// Create new content
const createContent = admin
  .route({
    path: "/admin/subtests/{subtestId}/content",
    method: "POST",
    tags: ["Admin - Subtest Content"],
  })
  .input(
    type({
      subtestId: "number",
      type: "'materi' | 'tips_and_trick'",
      title: "string",
      order: "number",
      "videoUrl?": "string",
      "notes?": "string",
    })
  )
  .handler(async ({ input }) => {
    // Check if subtest exists
    const [subtestData] = await db
      .select({ id: subtest.id })
      .from(subtest)
      .where(eq(subtest.id, input.subtestId))
      .limit(1);

    if (!subtestData)
      throw new ORPCError("NOT_FOUND", {
        message: "Subtest tidak ditemukan",
      });

    // Validate notes format if provided
    if (input.notes) {
      try {
        const parsed = JSON.parse(input.notes);
        if (!parsed || typeof parsed !== "object" || !("root" in parsed)) {
          throw new Error("Invalid Lexical JSON format");
        }
      } catch {
        throw new ORPCError("BAD_REQUEST", {
          message: "Notes harus dalam format Lexical JSON yang valid",
        });
      }
    }

    const [created] = await db
      .insert(subtestContent)
      .values({
        subtestId: input.subtestId,
        type: input.type,
        title: input.title,
        order: input.order,
        videoUrl: input.videoUrl,
        notes: input.notes,
      })
      .returning();

    if (!created)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Gagal membuat konten",
      });

    return {
      message: "Berhasil membuat konten",
      content: created,
    };
  });

// Delete content
const deleteContent = admin
  .route({
    path: "/admin/subtests/content/{contentId}",
    method: "DELETE",
    tags: ["Admin - Subtest Content"],
  })
  .input(type({ contentId: "number" }))
  .handler(async ({ input }) => {
    const [deleted] = await db
      .delete(subtestContent)
      .where(eq(subtestContent.id, input.contentId))
      .returning();

    if (!deleted)
      throw new ORPCError("NOT_FOUND", {
        message: "Konten tidak ditemukan",
      });

    return { message: "Berhasil menghapus konten" };
  });

export const adminSubtestRouter = {
  listSubtests,
  getSubtest,
  getContent,
  updateContentNotes,
  updateContent,
  createContent,
  deleteContent,
};

