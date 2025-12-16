import { db } from "@habitutor/db";
import {
	question,
	questionAnswerOption,
} from "@habitutor/db/schema/practice-pack";
import {
	subtest,
	subtestContent,
	subtestContentQuestions,
	userRecentSubtest,
	userSubtestProgress,
} from "@habitutor/db/schema/subtest";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { and, desc, eq, sql } from "drizzle-orm";
import { authed } from "../index";

const list = authed
	.route({
		path: "/subtests",
		method: "GET",
		tags: ["Subtest"],
	})
	.handler(async () => {
		const subtests = await db
			.select({
				id: subtest.id,
				name: subtest.name,
				shortName: subtest.shortName,
				description: subtest.description,
				order: subtest.order,
			})
			.from(subtest)
			.orderBy(subtest.order);

		return subtests;
	});

const find = authed
	.route({
		path: "/subtests/{id}",
		method: "GET",
		tags: ["Subtest"],
	})
	.input(type({ id: "number" }))
	.handler(async ({ input, context }) => {
		const [subtestData] = await db
			.select({
				id: subtest.id,
				name: subtest.name,
				shortName: subtest.shortName,
				description: subtest.description,
				order: subtest.order,
			})
			.from(subtest)
			.where(eq(subtest.id, input.id))
			.limit(1);

		if (!subtestData)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan kelas",
			});

		await db
			.insert(userRecentSubtest)
			.values({
				userId: context.session.user.id,
				subtestId: input.id,
				accessedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: [userRecentSubtest.userId, userRecentSubtest.subtestId],
				set: { accessedAt: new Date() },
			});

		const contents = await db
			.select({
				id: subtestContent.id,
				type: subtestContent.type,
				title: subtestContent.title,
				order: subtestContent.order,
				videoUrl: subtestContent.videoUrl,
				notes: subtestContent.notes,
				videoWatched: userSubtestProgress.videoWatched,
				notesRead: userSubtestProgress.notesRead,
				quizCompleted: userSubtestProgress.quizCompleted,
				quizScore: userSubtestProgress.quizScore,
			})
			.from(subtestContent)
			.leftJoin(
				userSubtestProgress,
				and(
					eq(subtestContent.id, userSubtestProgress.subtestContentId),
					eq(userSubtestProgress.userId, context.session.user.id),
				),
			)
			.where(eq(subtestContent.subtestId, input.id))
			.orderBy(subtestContent.order);

		return {
			...subtestData,
			contents,
		};
	});

const getContent = authed
	.route({
		path: "/subtests/{subtestId}/content/{contentId}",
		method: "GET",
		tags: ["Subtest"],
	})
	.input(
		type({
			subtestId: "number",
			contentId: "number",
		}),
	)
	.handler(async ({ input, context }) => {
		const [content] = await db
			.select({
				id: subtestContent.id,
				subtestId: subtestContent.subtestId,
				type: subtestContent.type,
				title: subtestContent.title,
				order: subtestContent.order,
				videoUrl: subtestContent.videoUrl,
				notes: subtestContent.notes,
			})
			.from(subtestContent)
			.where(
				and(
					eq(subtestContent.id, input.contentId),
					eq(subtestContent.subtestId, input.subtestId),
				),
			)
			.limit(1);

		if (!content)
			throw new ORPCError("NOT_FOUND", {
				message: "Gagal menemukan konten kelas",
			});

		const questions = await db
			.select({
				id: question.id,
				content: question.content,
				discussion: question.discussion,
				order: subtestContentQuestions.order,
			})
			.from(subtestContentQuestions)
			.innerJoin(question, eq(question.id, subtestContentQuestions.questionId))
			.where(eq(subtestContentQuestions.subtestContentId, input.contentId))
			.orderBy(subtestContentQuestions.order);

		const questionIds = questions.map((q) => q.id);
		const answerOptions =
			questionIds.length > 0
				? await db
						.select({
							id: questionAnswerOption.id,
							questionId: questionAnswerOption.questionId,
							content: questionAnswerOption.content,
							isCorrect: questionAnswerOption.isCorrect,
						})
						.from(questionAnswerOption)
						.where(
							sql`${questionAnswerOption.questionId} = ANY(${questionIds})`,
						)
				: [];

		const questionsWithAnswers = questions.map((q) => ({
			...q,
			answers: answerOptions
				.filter((a) => a.questionId === q.id)
				.map(({ questionId, ...answer }) => answer),
		}));

		const [progress] = await db
			.select({
				videoWatched: userSubtestProgress.videoWatched,
				notesRead: userSubtestProgress.notesRead,
				quizCompleted: userSubtestProgress.quizCompleted,
				quizScore: userSubtestProgress.quizScore,
			})
			.from(userSubtestProgress)
			.where(
				and(
					eq(userSubtestProgress.subtestContentId, input.contentId),
					eq(userSubtestProgress.userId, context.session.user.id),
				),
			)
			.limit(1);

		return {
			...content,
			questions: questionsWithAnswers,
			progress: progress || {
				videoWatched: false,
				notesRead: false,
				quizCompleted: false,
				quizScore: null,
			},
		};
	});

const updateProgress = authed
	.route({
		path: "/subtests/content/{contentId}/progress",
		method: "POST",
		tags: ["Subtest"],
	})
	.input(
		type({
			contentId: "number",
			videoWatched: "boolean | null",
			notesRead: "boolean | null",
			quizCompleted: "boolean | null",
			quizScore: "number | null",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ input, context }) => {
		const updateData: {
			videoWatched?: boolean;
			notesRead?: boolean;
			quizCompleted?: boolean;
			quizScore?: number | null;
			lastAccessedAt: Date;
		} = {
			lastAccessedAt: new Date(),
		};

		if (input.videoWatched !== null) {
			updateData.videoWatched = input.videoWatched;
		}
		if (input.notesRead !== null) {
			updateData.notesRead = input.notesRead;
		}
		if (input.quizCompleted !== null) {
			updateData.quizCompleted = input.quizCompleted;
		}
		if (input.quizScore !== null) {
			updateData.quizScore = input.quizScore;
		}

		await db
			.insert(userSubtestProgress)
			.values({
				userId: context.session.user.id,
				subtestContentId: input.contentId,
				...updateData,
			})
			.onConflictDoUpdate({
				target: [
					userSubtestProgress.userId,
					userSubtestProgress.subtestContentId,
				],
				set: updateData,
			});

		return { message: "Berhasil memperbarui progress!" };
	});

const getRecent = authed
	.route({
		path: "/subtests/recent",
		method: "GET",
		tags: ["Subtest"],
	})
	.handler(async ({ context }) => {
		const recentSubtests = await db
			.select({
				id: subtest.id,
				name: subtest.name,
				shortName: subtest.shortName,
				description: subtest.description,
				order: subtest.order,
				accessedAt: userRecentSubtest.accessedAt,
			})
			.from(userRecentSubtest)
			.innerJoin(subtest, eq(subtest.id, userRecentSubtest.subtestId))
			.where(eq(userRecentSubtest.userId, context.session.user.id))
			.orderBy(desc(userRecentSubtest.accessedAt))
			.limit(5);

		return recentSubtests;
	});

export const subtestRouter = {
	list,
	find,
	getContent,
	updateProgress,
	getRecent,
};
