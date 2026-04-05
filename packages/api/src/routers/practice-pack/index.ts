import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { db } from "@habitutor/db";
import { authed } from "../../index";
import type { Question } from "../../types/practice-pack";
import { formatHistoryQuestions, formatQuestions, practicePackRepo } from "./repo";

const list = authed
  .route({
    path: "/practice-packs",
    method: "GET",
    tags: ["Practice Packs"],
  })
  .handler(async ({ context }) => {
    const attempts = await practicePackRepo.listWithAttempts({ db, userId: context.session.user.id });

    if (!attempts)
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal menemukan latihan soal",
      });

    return attempts;
  });

const find = authed
  .route({
    path: "/practice-packs/{id}",
    method: "GET",
    tags: ["Practice Packs"],
  })
  .input(type({ id: "number" }))
  .handler(async ({ input, context }) => {
    const rows = await practicePackRepo.findWithQuestions({ db, packId: input.id, userId: context.session.user.id });

    if (rows.length === 0 || !rows[0])
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal menemukan latihan soal",
      });

    const pack = {
      attemptId: rows[0].attemptId,
      title: rows[0].title,
      status: rows[0].status,
      startedAt: rows[0].startedAt,
      completedAt: rows[0].completedAt,
      questions: [] as Question[],
    };

    pack.questions = formatQuestions(
      rows.map((row) => ({
        questionId: row.questionId,
        questionOrder: row.questionOrder,
        questionContent: row.questionContent,
        questionContentJson: row.questionContentJson,
        questionDiscussion: row.questionDiscussion,
        questionDiscussionJson: row.questionDiscussionJson,
        answerId: row.answerId,
        answerContent: row.answerContent,
        selectedAnswerId: row.userSelectedAnswerId,
      })),
    );

    return pack;
  });

const startAttempt = authed
  .route({
    path: "/practice-packs/{id}/start",
    method: "POST",
    tags: ["Practice Packs"],
  })
  .input(type({ id: "number" }))
  .output(type({ message: "string", attemptId: "number" }))
  .handler(async ({ input, context }) => {
    const attempt = await practicePackRepo.createAttempt({ db, packId: input.id, userId: context.session.user.id });

    if (!attempt)
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal menemukan sesi pengerjaan latihan soal",
      });

    return {
      message: "Memulai latihan soal",
      attemptId: attempt.id,
    };
  });

const saveAnswer = authed
  .route({
    path: "/practice-packs/{id}/{questionId}/save",
    method: "POST",
    tags: ["Practice Packs"],
  })
  .input(
    type({
      id: "number",
      questionId: "number",
      selectedAnswerId: "number",
    }),
  )
  .output(
    type({
      message: "string",
    }),
  )
  .handler(async ({ input, context }) => {
    const currentAttempt = await practicePackRepo.getAttempt({
      db,
      packId: input.id,
      userId: context.session.user.id,
    });

    if (!currentAttempt)
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal menemukan sesi pengerjaan latihan soal",
      });

    if (currentAttempt.status !== "ongoing")
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "Tidak bisa menyimpan jawaban pada latihan soal yang tidak sedang berlangsung",
      });

    await practicePackRepo.saveAnswer({
      db,
      attemptId: currentAttempt.id,
      questionId: input.questionId,
      selectedAnswerId: input.selectedAnswerId,
    });

    return { message: "Berhasil menyimpan jawaban!" };
  });

const submitAttempt = authed
  .route({
    path: "/practice-packs/{id}/submit",
    method: "POST",
    tags: ["Practice Packs"],
  })
  .input(
    type({
      id: "number",
    }),
  )
  .output(type({ message: "string" }))
  .handler(async ({ context, input }) => {
    const attempt = await practicePackRepo.submitAttempt({ db, packId: input.id, userId: context.session.user.id });

    if (!attempt)
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal menemukan sesi latihan soal",
      });

    return {
      message: "Berhasil mengumpul latihan soal",
    };
  });

const history = authed
  .route({
    path: "/practice-packs/history",
    method: "GET",
    tags: ["Practice Packs"],
  })
  .input(
    type({
      "limit?": "number",
      "offset?": "number",
    }),
  )
  .handler(async ({ context, input }) => {
    const limit = Math.min(input.limit ?? 20, 100);
    const offset = input.offset ?? 0;

    const total = await practicePackRepo.countAttempts({ db, userId: context.session.user.id });

    const attempts = await practicePackRepo.getHistory({
      db,
      userId: context.session.user.id,
      limit,
      offset,
    });

    return {
      packsFinished: attempts.filter((pack) => pack.status === "finished").length,
      data: attempts,
      pagination: {
        limit,
        offset,
        total,
      },
    };
  });

const historyByPack = authed
  .route({
    path: "/practice-packs/{id}/history",
    method: "GET",
    tags: ["Practice Packs"],
  })
  .input(
    type({
      id: "number",
    }),
  )
  .handler(async ({ input, context }) => {
    const rows = await practicePackRepo.findHistoryByPack({ db, packId: input.id, userId: context.session.user.id });

    if (rows.length === 0 || !rows[0])
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal menemukan latihan soal",
      });

    const pack = {
      attemptId: rows[0].attemptId,
      title: rows[0].title,
      startedAt: rows[0].startedAt,
      completedAt: rows[0].completedAt,
      questions: [] as (Question & { userAnswerIsCorrect: boolean })[],
    };

    pack.questions = formatHistoryQuestions(
      rows.map((row) => ({
        questionId: row.questionId,
        questionOrder: row.questionOrder,
        questionContent: row.questionContent,
        questionContentJson: row.questionContentJson,
        questionDiscussion: row.questionDiscussion,
        questionDiscussionJson: row.questionDiscussionJson,
        answerId: row.answerId,
        answerContent: row.answerContent,
        answerIsCorrect: row.answerIsCorrect,
        selectedAnswerId: row.userSelectedAnswerId,
      })),
    );

    return pack;
  });

export const practicePackRouter = {
  list,
  get: find,
  save: saveAnswer,
  historyByPack,
  // Legacy aliases kept for compatibility
  find,
  start: startAttempt,
  answer: saveAnswer,
  submit: submitAttempt,
  history,
  historyDetail: historyByPack,
};
