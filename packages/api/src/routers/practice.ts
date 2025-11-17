import {
	and,
	db,
	eq,
	essayAnswer,
	inArray,
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

	//Get questions in a practice pack with their answers
	getQuestionsInPack: publicProcedure
		.input(type({ practicePackId: "number" }))
		.handler(async ({ input, context }) => {
			const database = db(context.env);

			// Get all question IDs in this pack
			const packQuestions = await database
				.select()
				.from(practicePackQuestions)
				.where(eq(practicePackQuestions.practicePackId, input.practicePackId));

			if (packQuestions.length === 0) {
				return [];
			}

			const questionIds = packQuestions.map((pq) => pq.questionId);

			// Get all questions
			const questions = await database
				.select()
				.from(question)
				.where(inArray(question.id, questionIds));

			// Get MCQ answers
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
		}),

	//Get all MCQ questions with their answers
	getAllMCQQuestions: publicProcedure.handler(async ({ context }) => {
		const database = db(context.env);

		// Get all MCQ questions
		const mcqQuestions = await database
			.select()
			.from(question)
			.where(eq(question.type, "mcq"));

		if (mcqQuestions.length === 0) {
			return [];
		}

		const questionIds = mcqQuestions.map((q) => q.id);

		// Get all MCQ answers
		const mcqAnswers = await database
			.select()
			.from(multipleChoiceAnswer)
			.where(inArray(multipleChoiceAnswer.questionId, questionIds));

		// Combine the data
		return mcqQuestions.map((q) => ({
			...q,
			answers: mcqAnswers.filter((a) => a.questionId === q.id),
		}));
	}),

	//Get all Essay questions with their answers
	getAllEssayQuestions: publicProcedure.handler(async ({ context }) => {
		const database = db(context.env);

		// Get all essay questions
		const essayQuestions = await database
			.select()
			.from(question)
			.where(eq(question.type, "essay"));

		if (essayQuestions.length === 0) {
			return [];
		}

		const questionIds = essayQuestions.map((q) => q.id);

		// Get all essay answers
		const essayAnswers = await database
			.select()
			.from(essayAnswer)
			.where(inArray(essayAnswer.questionId, questionIds));

		return essayQuestions.map((q) => ({
			...q,
			answer: essayAnswers.find((a) => a.questionId === q.id),
		}));
	}),

	//Delete practice pack
	deletePracticePack: protectedProcedure
		.input(type({ id: "number" }))
		.handler(async ({ input, context }) => {
			const database = db(context.env);

			const deleted = await database
				.delete(practicePack)
				.where(eq(practicePack.id, input.id))
				.returning();

			if (deleted.length === 0) {
				throw new Error("Practice pack not found");
			}

			return { success: true, id: input.id };
		}),

	//Delete question
	deleteQuestion: protectedProcedure
		.input(type({ id: "number" }))
		.handler(async ({ input, context }) => {
			const database = db(context.env);

			const usedInPacks = await database
				.select()
				.from(practicePackQuestions)
				.where(eq(practicePackQuestions.questionId, input.id));

			if (usedInPacks.length > 0) {
				// Get pack titles
				const packIds = usedInPacks.map((p) => p.practicePackId);
				const packs = await database
					.select()
					.from(practicePack)
					.where(inArray(practicePack.id, packIds));

				const packTitles = packs.map((p) => p.title).join(", ");
				throw new Error(
					`Question is used in ${usedInPacks.length} pack(s): ${packTitles}`,
				);
			}

			const deleted = await database
				.delete(question)
				.where(eq(question.id, input.id))
				.returning();

			if (deleted.length === 0) {
				throw new Error("Question not found");
			}

			return { success: true, id: input.id };
		}),

	//Remove question from pack
	removeQuestionFromPack: protectedProcedure
		.input(
			type({
				practicePackId: "number",
				questionId: "number",
			}),
		)
		.handler(async ({ input, context }) => {
			const database = db(context.env);

			const deleted = await database
				.delete(practicePackQuestions)
				.where(
					and(
						eq(practicePackQuestions.practicePackId, input.practicePackId),
						eq(practicePackQuestions.questionId, input.questionId),
					),
				)
				.returning();

			if (deleted.length === 0) {
				throw new Error("Question not found in this pack");
			}

			return { success: true };
		}),
};
