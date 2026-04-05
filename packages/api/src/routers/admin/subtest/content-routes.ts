import { db } from "@habitutor/db";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { admin } from "../../../index";
import { adminSubtestRepo } from "./repo";

export const createContent = admin
  .route({
    path: "/admin/content",
    method: "POST",
    tags: ["Admin - Content"],
  })
  .input(
    type({
      subtestId: "number",
      type: "'material' | 'tips_and_trick'",
      title: "string",
      order: "number",
      video: "object?",
      note: "object?",
      practiceQuestionIds: "number[]?",
    }),
  )
  .output(
    type({
      message: "string",
      contentId: "number",
      createdMaterials: "object",
    }),
  )
  .handler(async ({ input }) => {
    const hasVideo = input.video !== undefined && input.video !== null;
    const hasNote = input.note !== undefined && input.note !== null;
    const hasPracticeQuestions =
      input.practiceQuestionIds !== undefined &&
      input.practiceQuestionIds !== null &&
      input.practiceQuestionIds.length > 0;

    if (!hasVideo && !hasNote && !hasPracticeQuestions) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Konten harus memiliki minimal salah satu: video, catatan, atau latihan soal",
      });
    }

    if (input.type === "tips_and_trick" && hasPracticeQuestions) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Tips & Trick tidak boleh memiliki latihan soal",
      });
    }

    if (hasVideo) {
      if (
        typeof input.video !== "object" ||
        !("title" in input.video) ||
        !("videoUrl" in input.video) ||
        !("content" in input.video) ||
        typeof input.video.title !== "string" ||
        typeof input.video.videoUrl !== "string" ||
        !input.video.videoUrl.trim()
      ) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Video harus memiliki title, videoUrl, dan content yang valid",
        });
      }
    }

    if (hasNote) {
      if (typeof input.note !== "object" || !("content" in input.note) || typeof input.note.content !== "object") {
        throw new ORPCError("BAD_REQUEST", {
          message: "Catatan harus memiliki content yang valid (Tiptap JSON)",
        });
      }
    }

    const result = await db.transaction(async (tx) => {
      const maxOrder = await adminSubtestRepo.getMaxContentOrder({
        db: tx,
        subtestId: input.subtestId,
        type: input.type,
      });

      const newContent = await adminSubtestRepo.createContentItem({
        db: tx,
        subtestId: input.subtestId,
        type: input.type,
        title: input.title,
        order: maxOrder + 1,
      });

      if (!newContent)
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Gagal membuat konten",
        });

      const createdMaterials: {
        video?: number;
        note?: number;
        practiceQuestions?: number;
      } = {};

      if (hasVideo && input.video) {
        const video = await adminSubtestRepo.upsertVideoMaterial({
          db: tx,
          contentItemId: newContent.id,
          videoUrl: (input.video as { videoUrl: string }).videoUrl,
          content: (input.video as { content: object }).content,
        });

        if (video) createdMaterials.video = video.id;
      }

      if (hasNote && input.note) {
        const note = await adminSubtestRepo.upsertNoteMaterial({
          db: tx,
          contentItemId: newContent.id,
          content: (input.note as { content: object }).content,
        });

        if (note) createdMaterials.note = note.id;
      }

      if (hasPracticeQuestions && input.practiceQuestionIds && input.type === "material") {
        await adminSubtestRepo.insertPracticeQuestions({
          db: tx,
          contentItemId: newContent.id,
          questionIds: input.practiceQuestionIds,
        });

        createdMaterials.practiceQuestions = input.practiceQuestionIds.length;
      }

      return {
        contentId: newContent.id,
        createdMaterials,
      };
    });

    return {
      message: "Konten berhasil dibuat",
      contentId: result.contentId,
      createdMaterials: result.createdMaterials,
    };
  });

export const updateContent = admin
  .route({
    path: "/admin/content/{id}",
    method: "PATCH",
    tags: ["Admin - Content"],
  })
  .input(
    type({
      id: "number",
      title: "string?",
      order: "number?",
    }),
  )
  .output(type({ message: "string" }))
  .handler(async ({ input }) => {
    const updateData: { title?: string; order?: number; updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.order !== undefined) updateData.order = input.order;

    const updated = await adminSubtestRepo.updateContentItem({ id: input.id, data: updateData });

    if (!updated)
      throw new ORPCError("NOT_FOUND", {
        message: "Konten tidak ditemukan",
      });

    return { message: "Konten berhasil diperbarui" };
  });

export const deleteContent = admin
  .route({
    path: "/admin/content/{id}",
    method: "DELETE",
    tags: ["Admin - Content"],
  })
  .input(type({ id: "number" }))
  .output(type({ message: "string" }))
  .handler(async ({ input }) => {
    const deleted = await adminSubtestRepo.deleteContentItem({ id: input.id });

    if (!deleted)
      throw new ORPCError("NOT_FOUND", {
        message: "Konten tidak ditemukan",
      });

    return { message: "Konten berhasil dihapus" };
  });

export const reorderContent = admin
  .route({
    path: "/admin/content/reorder",
    method: "PATCH",
    tags: ["Admin - Content"],
  })
  .input(
    type({
      subtestId: "number",
      type: "'material' | 'tips_and_trick'",
      items: "unknown",
    }),
  )
  .output(type({ message: "string" }))
  .handler(async ({ input }) => {
    if (!Array.isArray(input.items)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Items harus berupa array",
      });
    }

    const items = input.items as { id: number; order: number }[];

    for (const item of items) {
      if (typeof item.id !== "number" || typeof item.order !== "number") {
        throw new ORPCError("BAD_REQUEST", {
          message: "Setiap item harus memiliki id dan order bertipe number",
        });
      }
    }

    await db.transaction(async (tx) => {
      for (const [i, item] of items.entries()) {
        await adminSubtestRepo.updateContentOrder({
          db: tx,
          id: item.id,
          order: -(i + 1000),
          subtestId: input.subtestId,
          type: input.type,
        });
      }

      for (const item of items) {
        await adminSubtestRepo.updateContentOrder({
          db: tx,
          id: item.id,
          order: item.order,
          subtestId: input.subtestId,
          type: input.type,
        });
      }
    });

    return { message: "Urutan konten berhasil diperbarui" };
  });

export const upsertVideo = admin
  .route({
    path: "/admin/content/{id}/video",
    method: "POST",
    tags: ["Admin - Content"],
  })
  .input(
    type({
      id: "number",
      videoUrl: "string",
      content: "object",
    }),
  )
  .output(type({ message: "string", videoId: "number" }))
  .handler(async ({ input }) => {
    if (!input.videoUrl) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Video URL wajib diisi",
      });
    }

    const content = await adminSubtestRepo.getContentItemById({ id: input.id });

    if (!content)
      throw new ORPCError("NOT_FOUND", {
        message: "Konten tidak ditemukan",
      });

    const video = await adminSubtestRepo.upsertVideoMaterial({
      contentItemId: input.id,
      videoUrl: input.videoUrl,
      content: input.content,
    });

    if (!video)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Gagal menyimpan video material",
      });

    return { message: "Video material berhasil disimpan", videoId: video.id };
  });

export const deleteVideo = admin
  .route({
    path: "/admin/content/{id}/video",
    method: "DELETE",
    tags: ["Admin - Content"],
  })
  .input(type({ id: "number" }))
  .output(type({ message: "string" }))
  .handler(async ({ input }) => {
    const deleted = await adminSubtestRepo.deleteVideoMaterial({ contentItemId: input.id });

    if (!deleted)
      throw new ORPCError("NOT_FOUND", {
        message: "Video material tidak ditemukan",
      });

    return { message: "Video material berhasil dihapus" };
  });

export const upsertNote = admin
  .route({
    path: "/admin/content/{id}/note",
    method: "POST",
    tags: ["Admin - Content"],
  })
  .input(
    type({
      id: "number",
      content: "object",
    }),
  )
  .output(type({ message: "string", noteId: "number" }))
  .handler(async ({ input }) => {
    const content = await adminSubtestRepo.getContentItemById({ id: input.id });

    if (!content)
      throw new ORPCError("NOT_FOUND", {
        message: "Konten tidak ditemukan",
      });

    const note = await adminSubtestRepo.upsertNoteMaterial({
      contentItemId: input.id,
      content: input.content,
    });

    if (!note)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Gagal menyimpan catatan material",
      });

    return {
      message: "Catatan material berhasil disimpan",
      noteId: note.id,
    };
  });

export const deleteNote = admin
  .route({
    path: "/admin/content/{id}/note",
    method: "DELETE",
    tags: ["Admin - Content"],
  })
  .input(type({ id: "number" }))
  .output(type({ message: "string" }))
  .handler(async ({ input }) => {
    const deleted = await adminSubtestRepo.deleteNoteMaterial({ contentItemId: input.id });

    if (!deleted)
      throw new ORPCError("NOT_FOUND", {
        message: "Catatan material tidak ditemukan",
      });

    return { message: "Catatan material berhasil dihapus" };
  });

export const linkPracticeQuestions = admin
  .route({
    path: "/admin/content/{id}/practice-questions",
    method: "POST",
    tags: ["Admin - Content"],
  })
  .input(
    type({
      id: "number",
      questionIds: "number[]",
    }),
  )
  .output(type({ message: "string" }))
  .handler(async ({ input }) => {
    const content = await adminSubtestRepo.getContentItemWithDetails({ id: input.id });

    if (!content)
      throw new ORPCError("NOT_FOUND", {
        message: "Content not found",
      });

    if (content.type === "tips_and_trick") {
      throw new ORPCError("BAD_REQUEST", {
        message: "Tips & Trick cannot have practice questions",
      });
    }

    await adminSubtestRepo.deletePracticeQuestions({ contentItemId: input.id });

    if (input.questionIds.length > 0) {
      await adminSubtestRepo.insertPracticeQuestions({
        contentItemId: input.id,
        questionIds: input.questionIds,
      });
    }

    return { message: "Latihan soal berhasil dihubungkan ke konten" };
  });

export const unlinkPracticeQuestions = admin
  .route({
    path: "/admin/content/{id}/practice-questions",
    method: "DELETE",
    tags: ["Admin - Content"],
  })
  .input(type({ id: "number" }))
  .output(type({ message: "string" }))
  .handler(async ({ input }) => {
    await adminSubtestRepo.deletePracticeQuestions({ contentItemId: input.id });

    return { message: "Latihan soal berhasil dihapus dari konten" };
  });
