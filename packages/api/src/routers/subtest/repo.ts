import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { question, questionAnswerOption } from "@habitutor/db/schema/practice-pack";
import {
	contentItem,
	contentPracticeQuestions,
	noteMaterial,
	subtest,
	userProgress,
	videoMaterial,
} from "@habitutor/db/schema/subtest";
import { and, eq, ilike, sql } from "drizzle-orm";

type RecentContentView = {
	viewedAt: Date;
	contentId: number;
	contentTitle: string;
	contentType: "material" | "tips_and_trick";
	subtestId: number;
	subtestName: string;
	subtestShortName: string;
	hasVideo: boolean;
	hasNote: boolean;
	hasPracticeQuestions: boolean;
};

export const subtestRepo = {
	listSubtests: async ({ db = defaultDb, limit, offset }: { db?: DrizzleDatabase; limit: number; offset: number }) => {
		return db
			.select({
				id: subtest.id,
				name: subtest.name,
				shortName: subtest.shortName,
				description: subtest.description,
				order: subtest.order,
				totalContent: sql<number>`COUNT(${contentItem.id})`,
			})
			.from(subtest)
			.leftJoin(contentItem, eq(contentItem.subtestId, subtest.id))
			.groupBy(subtest.id, subtest.name, subtest.shortName, subtest.description, subtest.order)
			.orderBy(subtest.order)
			.limit(limit)
			.offset(offset);
	},

	getSubtestOrder: async ({ db = defaultDb, subtestId }: { db?: DrizzleDatabase; subtestId: number }) => {
		const [result] = await db.select({ order: subtest.order }).from(subtest).where(eq(subtest.id, subtestId)).limit(1);
		return result;
	},

	listContentByCategory: async ({
		db = defaultDb,
		subtestId,
		category,
		search,
		limit,
		offset,
		userId,
	}: {
		db?: DrizzleDatabase;
		subtestId: number;
		category?: "material" | "tips_and_trick";
		search?: string;
		limit: number;
		offset: number;
		userId: string;
	}) => {
		return db
			.select({
				id: contentItem.id,
				title: contentItem.title,
				order: contentItem.order,
				hasVideo: sql<boolean>`${videoMaterial.id} IS NOT NULL`,
				hasNote: sql<boolean>`${noteMaterial.id} IS NOT NULL`,
				hasPracticeQuestions: sql<boolean>`${contentPracticeQuestions.contentItemId} IS NOT NULL`,
				videoCompleted: userProgress.videoCompleted,
				noteCompleted: userProgress.noteCompleted,
				practiceQuestionsCompleted: userProgress.practiceQuestionsCompleted,
				lastViewedAt: userProgress.lastViewedAt,
			})
			.from(contentItem)
			.leftJoin(videoMaterial, eq(videoMaterial.contentItemId, contentItem.id))
			.leftJoin(noteMaterial, eq(noteMaterial.contentItemId, contentItem.id))
			.leftJoin(contentPracticeQuestions, eq(contentPracticeQuestions.contentItemId, contentItem.id))
			.leftJoin(userProgress, and(eq(userProgress.contentItemId, contentItem.id), eq(userProgress.userId, userId)))
			.where(
				and(
					eq(contentItem.subtestId, subtestId),
					category ? eq(contentItem.type, category) : undefined,
					search ? ilike(contentItem.title, `%${search}%`) : undefined,
				),
			)
			.orderBy(contentItem.order)
			.limit(limit)
			.offset(offset)
			.groupBy(
				contentItem.id,
				videoMaterial.id,
				noteMaterial.id,
				contentPracticeQuestions.contentItemId,
				userProgress.videoCompleted,
				userProgress.noteCompleted,
				userProgress.practiceQuestionsCompleted,
				userProgress.lastViewedAt,
			);
	},

	getContentWithMaterials: async ({ db = defaultDb, contentId }: { db?: DrizzleDatabase; contentId: number }) => {
		const [row] = await db
			.select({
				id: contentItem.id,
				title: contentItem.title,
				type: contentItem.type,
				order: contentItem.order,
				subtestId: contentItem.subtestId,
				subtestOrder: subtest.order,
				videoId: videoMaterial.id,
				videoUrl: videoMaterial.videoUrl,
				videoContent: videoMaterial.content,
				noteId: noteMaterial.id,
				noteContent: noteMaterial.content,
			})
			.from(contentItem)
			.innerJoin(subtest, eq(subtest.id, contentItem.subtestId))
			.leftJoin(videoMaterial, eq(videoMaterial.contentItemId, contentItem.id))
			.leftJoin(noteMaterial, eq(noteMaterial.contentItemId, contentItem.id))
			.where(eq(contentItem.id, contentId))
			.limit(1);
		return row;
	},

	getPracticeQuestionsForContent: async ({
		db = defaultDb,
		contentId,
	}: {
		db?: DrizzleDatabase;
		contentId: number;
	}) => {
		return db
			.select({
				questionId: contentPracticeQuestions.questionId,
				order: contentPracticeQuestions.order,
				questionContent: question.content,
				questionContentJson: question.contentJson,
				questionDiscussion: question.discussion,
				questionDiscussionJson: question.discussionJson,
				answerId: questionAnswerOption.id,
				answerContent: questionAnswerOption.content,
				answerCode: questionAnswerOption.code,
				answerIsCorrect: questionAnswerOption.isCorrect,
			})
			.from(contentPracticeQuestions)
			.innerJoin(question, eq(question.id, contentPracticeQuestions.questionId))
			.innerJoin(questionAnswerOption, eq(questionAnswerOption.questionId, question.id))
			.where(eq(contentPracticeQuestions.contentItemId, contentId))
			.orderBy(contentPracticeQuestions.order, questionAnswerOption.code);
	},

	getContentById: async ({ db = defaultDb, contentId }: { db?: DrizzleDatabase; contentId: number }) => {
		const [item] = await db
			.select({ id: contentItem.id })
			.from(contentItem)
			.where(eq(contentItem.id, contentId))
			.limit(1);
		return item;
	},

	recordContentView: async ({
		db = defaultDb,
		userId,
		contentItemId,
	}: {
		db?: DrizzleDatabase;
		userId: string;
		contentItemId: number;
	}) => {
		await db.execute(sql`
			WITH deleted AS (
				DELETE FROM recent_content_view 
				WHERE user_id = ${userId} AND content_item_id = ${contentItemId}
			),
			inserted AS (
				INSERT INTO recent_content_view (user_id, content_item_id)
				VALUES (${userId}, ${contentItemId})
			)
			DELETE FROM recent_content_view 
			WHERE id IN (
				SELECT id FROM (
					SELECT id, 
					       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY viewed_at DESC) as rn
					FROM recent_content_view 
					WHERE user_id = ${userId}
				) ranked 
				WHERE rn > 5
			)
		`);
	},

	getRecentContentViews: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
		const views = await db.execute<{
			viewedAt: Date;
			contentId: number;
			contentTitle: string;
			contentType: string;
			subtestId: number;
			subtestName: string;
			subtestShortName: string;
			hasVideo: boolean;
			hasNote: boolean;
			hasPracticeQuestions: boolean;
		}>(sql`
			SELECT
				r.viewed_at AS "viewedAt",
				c.id AS "contentId",
				c.title AS "contentTitle",
				c.type AS "contentType",
				s.id AS "subtestId",
				s.name AS "subtestName",
				s.short_name AS "subtestShortName",
				vm.id IS NOT NULL AS "hasVideo",
				nm.id IS NOT NULL AS "hasNote",
				cpq.content_item_id IS NOT NULL AS "hasPracticeQuestions"
			FROM (
				SELECT DISTINCT ON (content_item_id) content_item_id, viewed_at
				FROM recent_content_view
				WHERE user_id = ${userId}
				ORDER BY content_item_id, viewed_at DESC
			) r
			INNER JOIN content_item c ON c.id = r.content_item_id
			INNER JOIN subtest s ON s.id = c.subtest_id
			LEFT JOIN video_material vm ON vm.content_item_id = c.id
			LEFT JOIN note_material nm ON nm.content_item_id = c.id
			LEFT JOIN content_practice_questions cpq ON cpq.content_item_id = c.id
			ORDER BY r.viewed_at DESC
			LIMIT 5
		`);

		return views.rows as RecentContentView[];
	},

	upsertUserProgress: async ({
		db = defaultDb,
		userId,
		contentItemId,
		videoCompleted,
		noteCompleted,
		practiceQuestionsCompleted,
	}: {
		db?: DrizzleDatabase;
		userId: string;
		contentItemId: number;
		videoCompleted?: boolean;
		noteCompleted?: boolean;
		practiceQuestionsCompleted?: boolean;
	}) => {
		const updateData: {
			videoCompleted?: boolean;
			noteCompleted?: boolean;
			practiceQuestionsCompleted?: boolean;
			lastViewedAt: Date;
			updatedAt: Date;
		} = {
			lastViewedAt: new Date(),
			updatedAt: new Date(),
		};

		if (videoCompleted !== undefined) updateData.videoCompleted = videoCompleted;
		if (noteCompleted !== undefined) updateData.noteCompleted = noteCompleted;
		if (practiceQuestionsCompleted !== undefined) updateData.practiceQuestionsCompleted = practiceQuestionsCompleted;

		return db
			.insert(userProgress)
			.values({
				userId,
				contentItemId,
				...updateData,
			})
			.onConflictDoUpdate({
				target: [userProgress.userId, userProgress.contentItemId],
				set: updateData,
			});
	},

	getProgressStats: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
		const [stats] = await db
			.select({
				materialsCompleted: sql<number>`COUNT(DISTINCT CASE WHEN ${userProgress.videoCompleted} = true OR ${userProgress.noteCompleted} = true OR ${userProgress.practiceQuestionsCompleted} = true THEN ${userProgress.contentItemId} END)`,
			})
			.from(userProgress)
			.where(eq(userProgress.userId, userId));
		return stats;
	},
};
