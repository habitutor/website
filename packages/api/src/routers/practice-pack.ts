import {
  db,
  essayAnswer,
  multipleChoiceAnswer,
  practicePack,
  practicePackAttempt,
  practicePackQuestions,
  question,
} from "@habitutor/db";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { eq, inArray } from "drizzle-orm";
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
        message: `No practice pack found with id: ${input.id}`,
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

    const [mcqAnswers, essayAnswers] = await Promise.all([
      database
        .select()
        .from(multipleChoiceAnswer)
        .where(inArray(multipleChoiceAnswer.questionId, questionIds)),
      database
        .select()
        .from(essayAnswer)
        .where(inArray(essayAnswer.questionId, questionIds)),
    ]);

    const mcqByQuestion = Map.groupBy(mcqAnswers, (a) => a.questionId);
    const essayByQuestion = Map.groupBy(essayAnswers, (a) => a.questionId);

    return packQuestions.map((pq) => ({
      ...pq,
      multipleChoiceAnswers: mcqByQuestion.get(pq.questionId) ?? [],
      essayAnswer: essayByQuestion.get(pq.questionId)?.[0] ?? null,
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

const start = protectedProcedure
  .input(type({ id: "number" }))
  .handler(async ({ input, context }) => {
    const [attempt] = await db(context.env)
      .insert(practicePackAttempt)
      .values({
        practicePackId: input.id,
        userId: context.session.user.id,
      })
      .returning();

    if (!attempt) throw new ORPCError("NOT_FOUND");

    return {
      message: `Memulai latihan soal ${input.id}`,
    };
  });

export const practicePackRouter = {
  list,
  getById,
  getQuestions,
  create,
  start,
};
