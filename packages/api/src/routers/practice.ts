import { db } from "@habitutor/db";
import {
	essayAnswer,
	multipleChoiceAnswer,
	practicePack,
	practicePackQuestions,
	question,
} from "@habitutor/db";
import { type } from "arktype";
import { protectedProcedure, publicProcedure } from "../index";

export const practiceRouter = {
	//Get all practice packs
	getPracticePacks: publicProcedure.handler(async ({ context }) => {
		return await db(context.env).select().from(practicePack);
	}),

	//Get practice pack by id
	getPracticePackById: publicProcedure
		.input(type({ id: "number" }))
		.handler(async ({ input, context }) => {
			const packs = await db(context.env).select().from(practicePack);
			return packs.find((p) => p.id === input.id) || null;
		}),

	//Create practice pack
	createPracticePack: protectedProcedure
		.input(type({ title: "string" }))
		.handler(async ({ input, context }) => {
			const [pack] = await db(context.env)
				.insert(practicePack)
				.values({ title: input.title })
				.returning();
			return pack;
		}),

	//Create MCQ question with answers
	createMCQQuestion: protectedProcedure
		.input(
			type({
				content: "string",
				answers: type({
					content: "string",
					isCorrect: "boolean",
				}).array(),
			}),
		)
		.handler(async ({ input, context }) => {
			const [newQuestion] = await db(context.env)
				.insert(question)
				.values({
					content: input.content,
					type: "mcq",
				})
				.returning();

			if (!newQuestion) {
				throw new Error("Failed to create question");
			}

			const answers = await db(context.env)
				.insert(multipleChoiceAnswer)
				.values(
					input.answers.map((answer) => ({
						questionId: newQuestion.id,
						content: answer.content,
						isCorrect: answer.isCorrect,
					})),
				)
				.returning();

			return {
				...newQuestion,
				answers,
			};
		}),

	//Create essay question
	createEssayQuestion: protectedProcedure
		.input(
			type({
				content: "string",
				correctAnswer: "string",
			}),
		)
		.handler(async ({ input, context }) => {
			const [newQuestion] = await db(context.env)
				.insert(question)
				.values({
					content: input.content,
					type: "essay",
				})
				.returning();

			if (!newQuestion) {
				throw new Error("Failed to create question");
			}

			const [answer] = await db(context.env)
				.insert(essayAnswer)
				.values({
					questionId: newQuestion.id,
					correctAnswer: input.correctAnswer,
				})
				.returning();

			return {
				...newQuestion,
				answer,
			};
		}),

	//Add question to practice pack
	addQuestionToPack: protectedProcedure
		.input(
			type({
				practicePackId: "number",
				questionId: "number",
				"order?": "number",
			}),
		)
		.handler(async ({ input, context }) => {
			const [result] = await db(context.env)
				.insert(practicePackQuestions)
				.values({
					practicePackId: input.practicePackId,
					questionId: input.questionId,
					order: input.order,
				})
				.returning();
			return result;
		}),
};
