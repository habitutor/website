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
import { and, eq, inArray } from "drizzle-orm";
import { protectedProcedure, publicProcedure } from "../index";

const list = publicProcedure.handler(async ({ context }) => {
  return await db(context.env).select().from(practicePack);
});

const getById = publicProcedure
  .input(type({ id: "number" }))
  .handler(async ({ input, context }) => {
    const [pack] = await db(context.env)
      .select()
      .from(practicePack)
      .where(eq(practicePack.id, input.id))
      .limit(1);

    if (!pack)
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal menemukan latihan soal",
      });

    return pack;
  });

const getQuestions = publicProcedure
  .input(type({ practicePackId: "number" }))
  .handler(async ({ input, context }) => {
    const database = db(context.env);

    const packQuestions = await database
      .select({
        practicePackId: practicePackQuestions.practicePackId,
        questionId: practicePackQuestions.questionId,
        order: practicePackQuestions.order,
        content: question.content,
        type: question.type,
      })
      .from(practicePackQuestions)
      .innerJoin(question, eq(practicePackQuestions.questionId, question.id))
      .where(eq(practicePackQuestions.practicePackId, input.practicePackId));

    if (packQuestions.length === 0) {
      throw new ORPCError("NOT_FOUND");
    }

    const questionIds = packQuestions.map((q) => q.questionId);

    const answers = await database
      .select()
      .from(questionAnswerOption)
      .where(inArray(questionAnswerOption.questionId, questionIds));

    return packQuestions.map((pq) => ({
      ...pq,
      answers,
    }));
  });

const create = protectedProcedure
  .input(type({ title: "string" }))
  .handler(async ({ input, context }) => {
    const [pack] = await db(context.env)
      .insert(practicePack)
      .values({ title: input.title })
      .returning();
    return pack;
  });

const startAttempt = protectedProcedure
  .input(type({ id: "number" }))
  .output(type({ message: "string" }))
  .handler(async ({ input, context }) => {
    const [attempt] = await db(context.env)
      .insert(practicePackAttempt)
      .values({
        practicePackId: input.id,
        userId: context.session.user.id,
      })
      .returning();

    if (!attempt)
      throw new ORPCError("NOT_FOUND", {
        message: "Gagal menemukan sesi pengerjaan latihan soal",
      });

    return {
      message: `Memulai latihan soal ${input.id}`,
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
          "Tidak bisa menyimpan jawaban pada tes yang tidak sedang berlangsung",
      });

    await database.insert(practicePackUserAnswer).values({
      ...input,
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
        message: "Gagal menemukan sesi latihan soal",
      });

    return {
      message: "Berhasil mengumpul latihan soal",
    };
  });

export const practicePackRouter = {
  list,
  getById,
  getQuestions,
  create,
  startAttempt,
  saveAnswer,
  submitAttempt,
};
