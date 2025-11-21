import {
	db,
	practicePack,
	practicePackAttempt,
	practicePackQuestions,
	practicePackUserAnswer,
	question,
	questionAnswerOption,
} from "@habitutor/db";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { and, eq } from "drizzle-orm";
import { protectedProcedure } from "../index";
import type { Question } from "../types/practice-pack";

const list = protectedProcedure.handler(async ({ context }) => {
  const attempts = await db(context.env)
    .select({
      id: practicePack.id,
      attemptId: practicePackAttempt.id,
      title: practicePack.title,
      status: practicePackAttempt.status ?? "not_started",
      startedAt: practicePackAttempt.startedAt,
      completedAt: practicePackAttempt.completedAt,
    })
    .from(practicePack)
    .leftJoin(
      practicePackAttempt,
      and(
        eq(practicePack.id, practicePackAttempt.practicePackId),
        eq(practicePackAttempt.userId, context.session.user.id),
      ),
    );

  if (!attempts)
    throw new ORPCError("NOT_FOUND", {
      message: "Gagal menemukan latihan soal",
    });

  return attempts;
});

const find = protectedProcedure
  .input(type({ practicePackId: "number" }))
  .handler(async ({ input, context }) => {
    const database = db(context.env);

    // YES 50 INNER JOIN LAGI
    const rows = await database
      .select({
        attemptId: practicePackAttempt.id,
        title: practicePack.title,
        status: practicePackAttempt.status,
        startedAt: practicePackAttempt.startedAt,
        completedAt: practicePackAttempt.completedAt,
        questionId: practicePackQuestions.questionId,
        questionOrder: practicePackQuestions.order,
        questionContent: question.content,
        answerId: questionAnswerOption.id,
        answerContent: questionAnswerOption.content,
        userSelectedAnswerId: practicePackUserAnswer.selectedAnswerId,
      })
      .from(practicePack)
      .innerJoin(
        practicePackAttempt,
        eq(practicePackAttempt.practicePackId, practicePack.id),
      )
      .innerJoin(
        practicePackQuestions,
        eq(practicePackQuestions.practicePackId, practicePack.id),
      )
      .innerJoin(question, eq(question.id, practicePackQuestions.questionId))
      .innerJoin(
        questionAnswerOption,
        eq(questionAnswerOption.questionId, question.id),
      )
      .leftJoin(
        practicePackUserAnswer,
        and(
          eq(practicePackUserAnswer.questionId, question.id),
          eq(practicePackUserAnswer.attemptId, practicePackAttempt.id),
        ),
      )
      .where(
        and(
          eq(practicePack.id, input.practicePackId),
          eq(practicePackAttempt.userId, context.session.user.id),
        ),
      );

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

    const questionMap = new Map<number, Question>();

    for (const row of rows) {
      if (!questionMap.has(row.questionId))
        questionMap.set(row.questionId, {
          id: row.questionId,
          // set order fallback to 1 or 999 as a default
          order: row.questionOrder ?? 1,
          content: row.questionContent,
          selectedAnswerId: row.userSelectedAnswerId,
          answers: [],
        });

      questionMap.get(row.questionId)?.answers.push({
        id: row.answerId,
        content: row.answerContent,
      });
    }

    // Format and sort the questions based on order
    pack.questions = Array.from(questionMap.values()).sort(
      (a, b) => a.order - b.order,
    );

    return pack;
  });

const startAttempt = protectedProcedure
  .input(type({ practicePackId: "number" }))
  .output(type({ message: "string", attemptId: "number" }))
  .handler(async ({ input, context }) => {
    const [attempt] = await db(context.env)
      .insert(practicePackAttempt)
      .values({
        practicePackId: input.practicePackId,
        userId: context.session.user.id,
      })
      .onConflictDoNothing()
      .returning();

    if (!attempt)
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal menemukan sesi pengerjaan latihan soal",
      });

    return {
      message: "Memulai latihan soal",
      attemptId: attempt.id,
    };
  });

const saveAnswer = protectedProcedure
  .input(
    type({
      attemptId: "number",
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
    const database = db(context.env);

    const [currentAttempt] = await database
      .select({
        userId: practicePackAttempt.userId,
        status: practicePackAttempt.status,
      })
      .from(practicePackAttempt)
      .where(eq(practicePackAttempt.id, input.attemptId))
      .limit(1);

    if (!currentAttempt)
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal menemukan sesi pengerjaan latihan soal",
      });

    if (currentAttempt.userId !== context.session.user.id)
      throw new ORPCError("UNAUTHORIZED", {
        message: "Sesi pengerjaan latihan soal ini bukan milikmu",
      });

    if (currentAttempt.status !== "ongoing")
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message:
          "Tidak bisa menyimpan jawaban pada latihan soal yang tidak sedang berlangsung",
      });

    await database
      .insert(practicePackUserAnswer)
      .values({
        ...input,
      })
      .onConflictDoUpdate({
        target: [
          practicePackUserAnswer.attemptId,
          practicePackUserAnswer.questionId,
        ],
        set: { selectedAnswerId: input.selectedAnswerId },
      });

    return { message: "Berhasil menyimpan jawaban!" };
  });

const submitAttempt = protectedProcedure
  .input(
    type({
      attemptId: "number",
    }),
  )
  .output(type({ message: "string" }))
  .handler(async ({ context, input }) => {
    const [attempt] = await db(context.env)
      .update(practicePackAttempt)
      .set({
        completedAt: new Date(),
        status: "finished",
      })
      .where(
        and(
          eq(practicePackAttempt.id, input.attemptId),
          eq(practicePackAttempt.userId, context.session.user.id),
        ),
      )
      .returning();

    if (!attempt)
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal memulai sesi latihan soal",
      });

    return {
      message: "Berhasil mengumpul latihan soal",
    };
  });

export const practicePackRouter = {
  list,
  find,
  startAttempt,
  submitAttempt,
  saveAnswer,
};
