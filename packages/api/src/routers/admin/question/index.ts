import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { admin } from "../../../index";
import { convertToTiptap } from "../../../lib/tiptap";
import { adminQuestionRepo } from "./repo";

const list = admin
  .route({
    path: "/admin/questions",
    method: "GET",
    tags: ["Admin - Questions"],
  })
  .input(
    type({
      "limit?": "number",
      "after?": "string",
      "before?": "string",
      "search?": "string",
      "isFlashcardQuestion?": "boolean",
    }),
  )
  .handler(async ({ input, errors }) => {
    if (input.after && input.before) {
      throw errors.UNPROCESSABLE_CONTENT({ message: "Cannot specify both after and before" });
    }

    const limit = Math.min(input.limit || 20, 50);
    const search = input.search || "";

    const afterData = input.after ? JSON.parse(Buffer.from(input.after, "base64url").toString()) : null;
    const beforeData = input.before ? JSON.parse(Buffer.from(input.before, "base64url").toString()) : null;

    const rawData = await adminQuestionRepo.list({
      limit,
      afterId: afterData?.id ?? null,
      beforeId: beforeData?.id ?? null,
      search,
      isFlashcardQuestion: input.isFlashcardQuestion,
    });

    if (rawData.length === 0) {
      return {
        data: [],
        nextCursor: null,
        prevCursor: null,
        hasMore: false,
        hasPrevious: false,
      };
    }

    const hasMore = rawData.length > limit;
    const data = hasMore ? rawData.slice(0, limit) : rawData;

    const firstItem = data[0]!;
    const lastItem = data[data.length - 1]!;
    const encodeQCursor = (id: number) => Buffer.from(JSON.stringify({ id })).toString("base64url");

    const questions = data.map(
      (q: {
        id: number;
        packCount: number;
        content: string;
        contentJson: unknown;
        discussion: string;
        discussionJson: unknown;
        isFlashcardQuestion: boolean;
      }) => ({
        id: q.id,
        packCount: q.packCount,
        content: q.contentJson || convertToTiptap(q.content),
        discussion: q.discussionJson || convertToTiptap(q.discussion),
        isFlashcardQuestion: q.isFlashcardQuestion,
      }),
    );

    return {
      data: questions,
      nextCursor: hasMore ? encodeQCursor(lastItem.id) : null,
      prevCursor: encodeQCursor(firstItem.id),
      hasMore,
      hasPrevious: input.after !== undefined || input.before !== undefined,
    };
  });

const get = admin
  .route({
    path: "/admin/questions/{id}",
    method: "GET",
    tags: ["Admin - Questions"],
  })
  .input(type({ id: "number" }))
  .handler(async ({ input }) => {
    const q = await adminQuestionRepo.getById({ id: input.id });

    if (!q)
      throw new ORPCError("NOT_FOUND", {
        message: "Question tidak ditemukan",
      });

    return {
      ...q,
      content: q.contentJson || convertToTiptap(q.content),
      discussion: q.discussionJson || convertToTiptap(q.discussion),
      answers: q.answerOptions as Array<{
        id: number;
        content: string;
        code: string;
        isCorrect: boolean;
        questionId: number;
      }>,
    };
  });

const create = admin
  .route({
    path: "/admin/questions",
    method: "POST",
    tags: ["Admin - Questions"],
  })
  .input(
    type({
      content: "unknown",
      discussion: "unknown",
      "isFlashcardQuestion?": "boolean",
    }),
  )
  .handler(async ({ input }) => {
    const contentJson = typeof input.content === "object" ? input.content : null;
    const discussionJson = typeof input.discussion === "object" ? input.discussion : null;

    const contentText = typeof input.content === "string" ? input.content : JSON.stringify(input.content);
    const discussionText = typeof input.discussion === "string" ? input.discussion : JSON.stringify(input.discussion);

    const q = await adminQuestionRepo.create({
      content: contentText,
      discussion: discussionText,
      contentJson,
      discussionJson,
      isFlashcardQuestion: input.isFlashcardQuestion ?? true,
    });

    if (!q)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Gagal membuat question",
      });

    return q;
  });

const update = admin
  .route({
    path: "/admin/questions/{id}",
    method: "PUT",
    tags: ["Admin - Questions"],
  })
  .input(
    type({
      id: "number",
      "content?": "unknown",
      "discussion?": "unknown",
      "isFlashcardQuestion?": "boolean",
    }),
  )
  .handler(async ({ input }) => {
    const updateData: Record<string, unknown> = {};

    if (input.content !== undefined) {
      updateData.contentJson = typeof input.content === "object" ? input.content : null;
      updateData.content = typeof input.content === "string" ? input.content : JSON.stringify(input.content);
    }

    if (input.discussion !== undefined) {
      updateData.discussionJson = typeof input.discussion === "object" ? input.discussion : null;
      updateData.discussion =
        typeof input.discussion === "string" ? input.discussion : JSON.stringify(input.discussion);
    }

    if (input.isFlashcardQuestion !== undefined) {
      updateData.isFlashcardQuestion = input.isFlashcardQuestion;
    }

    const q = await adminQuestionRepo.update({ id: input.id, data: updateData });

    if (!q)
      throw new ORPCError("NOT_FOUND", {
        message: "Question tidak ditemukan",
      });

    return q;
  });

const delete_ = admin
  .route({
    path: "/admin/questions/{id}",
    method: "DELETE",
    tags: ["Admin - Questions"],
  })
  .input(type({ id: "number" }))
  .handler(async ({ input }) => {
    const q = await adminQuestionRepo.delete({ id: input.id });

    if (!q)
      throw new ORPCError("NOT_FOUND", {
        message: "Question tidak ditemukan",
      });

    return { message: "Berhasil menghapus question" };
  });

const bulkUpdateFlashcard = admin
  .route({
    path: "/admin/questions/bulk-flashcard",
    method: "PATCH",
    tags: ["Admin - Questions"],
  })
  .input(
    type({
      questionIds: "number[]",
      isFlashcard: "boolean",
    }),
  )
  .output(type({ message: "string", updatedCount: "number" }))
  .handler(async ({ input }) => {
    if (!Array.isArray(input.questionIds) || input.questionIds.length === 0) {
      throw new ORPCError("BAD_REQUEST", {
        message: "questionIds harus berupa array dengan setidaknya satu ID",
      });
    }

    if (input.questionIds.length > 100) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Maksimal 100 questionId dapat diproses sekaligus",
      });
    }

    const existingQuestions = await adminQuestionRepo.getByIds({ ids: input.questionIds });

    if (existingQuestions.length !== input.questionIds.length) {
      throw new ORPCError("NOT_FOUND", {
        message: "Beberapa pertanyaan tidak ditemukan",
      });
    }

    await adminQuestionRepo.bulkUpdateFlashcard({
      ids: input.questionIds,
      isFlashcard: input.isFlashcard,
    });

    return {
      message: input.isFlashcard
        ? "Pertanyaan berhasil ditandai sebagai flashcard"
        : "Pertanyaan berhasil dicoret dari flashcard",
      updatedCount: input.questionIds.length,
    };
  });

const createAnswer = admin
  .route({
    path: "/admin/questions/{questionId}/answers",
    method: "POST",
    tags: ["Admin - Answer Options"],
  })
  .input(
    type({
      questionId: "number",
      content: "string",
      isCorrect: "boolean",
      code: "string",
    }),
  )
  .handler(async ({ input }) => {
    const q = await adminQuestionRepo.getQuestionById({ id: input.questionId });

    if (!q)
      throw new ORPCError("NOT_FOUND", {
        message: "Question tidak ditemukan",
      });

    const answer = await adminQuestionRepo.createAnswer({
      questionId: input.questionId,
      content: input.content,
      isCorrect: input.isCorrect,
      code: input.code,
    });

    if (!answer)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Gagal membuat answer option",
      });

    return answer;
  });

const updateAnswer = admin
  .route({
    path: "/admin/answers/{id}",
    method: "PUT",
    tags: ["Admin - Answer Options"],
  })
  .input(
    type({
      id: "number",
      content: "string",
      isCorrect: "boolean",
    }),
  )
  .handler(async ({ input }) => {
    const answer = await adminQuestionRepo.updateAnswer({
      id: input.id,
      content: input.content,
      isCorrect: input.isCorrect,
    });

    if (!answer)
      throw new ORPCError("NOT_FOUND", {
        message: "Answer option tidak ditemukan",
      });

    return answer;
  });

const deleteAnswer = admin
  .route({
    path: "/admin/answers/{id}",
    method: "DELETE",
    tags: ["Admin - Answer Options"],
  })
  .input(type({ id: "number" }))
  .handler(async ({ input }) => {
    const answer = await adminQuestionRepo.deleteAnswer({ id: input.id });

    if (!answer)
      throw new ORPCError("NOT_FOUND", {
        message: "Answer option tidak ditemukan",
      });

    return { message: "Berhasil menghapus answer option" };
  });

export const adminQuestionRouter = {
  list,
  find: get,
  create,
  update,
  remove: delete_,
  bulkFlashcard: bulkUpdateFlashcard,
  answer: {
    create: createAnswer,
    update: updateAnswer,
    remove: deleteAnswer,
  },
};
