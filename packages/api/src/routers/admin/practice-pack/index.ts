import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { admin } from "../../../index";
import { cursor } from "../../../utils/cursor";
import { adminPracticePackRepo, formatPackQuestions } from "./repo";

const list = admin
  .route({
    path: "/admin/practice-packs",
    method: "GET",
    tags: ["Admin - Practice Packs"],
  })
  .input(
    type({
      "limit?": "number",
      "after?": "string",
      "before?": "string",
      "search?": "string",
    }),
  )
  .handler(async ({ input, errors }) => {
    if (input.after && input.before) {
      throw errors.UNPROCESSABLE_CONTENT({ message: "Cannot specify both after and before" });
    }

    const limit = Math.min(input.limit || 10, 50);
    const search = input.search || "";

    const afterData = input.after ? cursor.decode(input.after) : null;
    const afterCreatedAt = afterData ? new Date(afterData.createdAt) : null;

    const beforeData = input.before ? cursor.decode(input.before) : null;
    const beforeCreatedAt = beforeData ? new Date(beforeData.createdAt) : null;

    const rows = await adminPracticePackRepo.list({
      limit,
      afterCreatedAt,
      afterId: afterData ? Number(afterData.id) : null,
      beforeCreatedAt,
      beforeId: beforeData ? Number(beforeData.id) : null,
      search,
    });

    if (rows.length === 0) {
      return {
        data: [],
        nextCursor: null,
        prevCursor: null,
        hasMore: false,
        hasPrevious: false,
      };
    }

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;

    const firstItem = data[0]!;
    const lastItem = data[data.length - 1]!;
    const nextCursor = hasMore
      ? cursor.encode({ createdAt: lastItem.createdAt!.toISOString(), id: String(lastItem.id) })
      : null;
    const prevCursor = cursor.encode({ createdAt: firstItem.createdAt!.toISOString(), id: String(firstItem.id) });

    return {
      data,
      nextCursor,
      prevCursor,
      hasMore,
      hasPrevious: input.after !== undefined || input.before !== undefined,
    };
  });

const get = admin
  .route({
    path: "/admin/practice-packs/{id}",
    method: "GET",
    tags: ["Admin - Practice Packs"],
  })
  .input(type({ id: "number" }))
  .handler(async ({ input }) => {
    const pack = await adminPracticePackRepo.getById({ id: input.id });

    if (!pack)
      throw new ORPCError("NOT_FOUND", {
        message: "Practice pack tidak ditemukan",
      });

    return pack;
  });

const create = admin
  .route({
    path: "/admin/practice-packs",
    method: "POST",
    tags: ["Admin - Practice Packs"],
  })
  .input(
    type({
      title: "string",
      "description?": "string",
    }),
  )
  .handler(async ({ input }) => {
    const pack = await adminPracticePackRepo.create({
      values: { title: input.title, description: input.description },
    });

    if (!pack)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Gagal membuat practice pack",
      });

    return pack;
  });

const update = admin
  .route({
    path: "/admin/practice-packs/{id}",
    method: "PUT",
    tags: ["Admin - Practice Packs"],
  })
  .input(
    type({
      id: "number",
      title: "string",
      "description?": "string",
    }),
  )
  .handler(async ({ input }) => {
    const pack = await adminPracticePackRepo.update({
      id: input.id,
      values: { title: input.title, description: input.description },
    });

    if (!pack)
      throw new ORPCError("NOT_FOUND", {
        message: "Practice pack tidak ditemukan",
      });

    return pack;
  });

const delete_ = admin
  .route({
    path: "/admin/practice-packs/{id}",
    method: "DELETE",
    tags: ["Admin - Practice Packs"],
  })
  .input(type({ id: "number" }))
  .handler(async ({ input }) => {
    const pack = await adminPracticePackRepo.delete({ id: input.id });

    if (!pack)
      throw new ORPCError("NOT_FOUND", {
        message: "Practice pack tidak ditemukan",
      });

    return { message: "Berhasil menghapus practice pack" };
  });

const addQuestion = admin
  .route({
    path: "/admin/practice-packs/{practicePackId}/questions",
    method: "POST",
    tags: ["Admin - Practice Pack Questions"],
  })
  .input(
    type({
      practicePackId: "number",
      questionId: "number",
      "order?": "number",
    }),
  )
  .handler(async ({ input }) => {
    const pack = await adminPracticePackRepo.getPracticePackById({ id: input.practicePackId });

    if (!pack)
      throw new ORPCError("NOT_FOUND", {
        message: "Practice pack tidak ditemukan",
      });

    const q = await adminPracticePackRepo.getQuestionById({ id: input.questionId });

    if (!q)
      throw new ORPCError("NOT_FOUND", {
        message: "Question tidak ditemukan",
      });

    let orderValue = input.order;
    if (orderValue === undefined) {
      const maxOrder = await adminPracticePackRepo.getMaxQuestionOrder({ practicePackId: input.practicePackId });
      orderValue = maxOrder + 1;
    }

    await adminPracticePackRepo.addQuestion({
      values: {
        practicePackId: input.practicePackId,
        questionId: input.questionId,
        order: orderValue ?? 1,
      },
    });

    return { message: "Berhasil menambahkan question ke practice pack" };
  });

const removeQuestion = admin
  .route({
    path: "/admin/practice-packs/{practicePackId}/questions/{questionId}",
    method: "DELETE",
    tags: ["Admin - Practice Pack Questions"],
  })
  .input(
    type({
      practicePackId: "number",
      questionId: "number",
    }),
  )
  .handler(async ({ input }) => {
    await adminPracticePackRepo.removeQuestion({
      practicePackId: input.practicePackId,
      questionId: input.questionId,
    });

    return { message: "Berhasil menghapus question dari practice pack" };
  });

const getQuestions = admin
  .route({
    path: "/admin/practice-packs/{id}/questions",
    method: "GET",
    tags: ["Admin - Practice Packs"],
  })
  .input(type({ id: "number" }))
  .handler(async ({ input }) => {
    const rows = await adminPracticePackRepo.getQuestionsForPack({ packId: input.id });

    if (rows.length === 0) {
      const pack = await adminPracticePackRepo.getPracticePackById({ id: input.id });
      if (!pack) {
        throw new ORPCError("NOT_FOUND", {
          message: "Practice pack not found",
        });
      }
      return { questions: [] };
    }

    return { questions: formatPackQuestions(rows) };
  });

const toggleAvailableForFlashcard = admin
  .route({
    path: "/admin/practice-packs/{id}/toggle-available-for-flashcard",
    method: "POST",
    tags: ["Admin - Practice Packs"],
  })
  .input(
    type({
      id: "number",
      isFlashcardQuestion: "boolean",
    }),
  )
  .output(
    type({
      id: "number",
      message: "string",
      updatedCount: "number",
    }),
  )
  .handler(async ({ input, errors }) => {
    const pack = await adminPracticePackRepo.getPracticePackById({ id: input.id });

    if (!pack) throw errors.NOT_FOUND({ message: "Practice pack tidak ditemukan" });

    const questionIds = await adminPracticePackRepo.getQuestionIdsForPack({ packId: input.id });

    if (questionIds.length === 0) {
      return {
        id: input.id,
        message: "Tidak ada pertanyaan di practice pack ini",
        updatedCount: 0,
      };
    }

    const ids = questionIds.map((q: { questionId: number }) => q.questionId);

    const result = await adminPracticePackRepo.updateQuestionsFlashcard({
      questionIds: ids,
      isFlashcardQuestion: input.isFlashcardQuestion,
    });

    return {
      id: input.id,
      message: input.isFlashcardQuestion
        ? "Berhasil menjadikan semua pertanyaan available di Flashcard!"
        : "Berhasil menjadikan semua pertanyaan tidak available di Flashcard!",
      updatedCount: result.length,
    };
  });

export const adminPracticePackRouter = {
  list,
  find: get,
  create,
  update,
  remove: delete_,
  question: {
    list: getQuestions,
    add: addQuestion,
    remove: removeQuestion,
  },
  toggleFlashcard: toggleAvailableForFlashcard,
};
