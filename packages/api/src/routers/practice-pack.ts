import {
	db,
	essayAnswer,
	multipleChoiceAnswer,
	practicePack,
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
			.select()
			.from(practicePackQuestions)
			.where(eq(practicePackQuestions.practicePackId, input.practicePackId));

		if (packQuestions.length === 0) {
			return [];
		}

		const questionIds = packQuestions.map((pq) => pq.questionId);

		const questions = await database
			.select()
			.from(question)
			.where(inArray(question.id, questionIds));

		const mcqAnswers = await database
			.select()
			.from(multipleChoiceAnswer)
			.where(inArray(multipleChoiceAnswer.questionId, questionIds));

		// Get essay answers
		const essayAnswers = await database
			.select()
			.from(essayAnswer)
			.where(inArray(essayAnswer.questionId, questionIds));

		// Combine the data
		return questions.map((q) => {
			if (q.type === "mcq") {
				return {
					...q,
					answers: mcqAnswers.filter((a) => a.questionId === q.id),
				};
			}
			return {
				...q,
				answer: essayAnswers.find((a) => a.questionId === q.id),
			};
		});
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

export const practicePackRouter = {
	list,
	getById,
	getQuestions,
  create,
};
