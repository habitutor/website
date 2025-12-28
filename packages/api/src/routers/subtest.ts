import { db } from "@habitutor/db";
import {
	contentItem,
	contentPracticeQuestions,
	noteMaterial,
	recentContentView,
	subtest,
	userProgress,
	videoMaterial,
} from "@habitutor/db/schema/subtest";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { authed } from "../index";

/**
 * Get all subtests with basic info
 * GET /api/subtests
 */
const listSubtests = authed
	.route({
		path: "/subtests",
		method: "GET",
		tags: ["Content"],
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

/**
 * Get content items by subtest and category
 * GET /api/subtests/{subtestId}/content/{category}
 */
const listContentByCategory = authed
	.route({
		path: "/subtests/{subtestId}/content/{category}",
		method: "GET",
		tags: ["Content"],
	})
	.input(
		type({
			subtestId: "number",
			category: "'material' | 'tips_and_trick'",
		}),
	)
	.handler(async ({ input, context }) => {
		const items = await db
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
			.leftJoin(
				userProgress,
				and(eq(userProgress.contentItemId, contentItem.id), eq(userProgress.userId, context.session.user.id)),
			)
			.where(and(eq(contentItem.subtestId, input.subtestId), eq(contentItem.type, input.category)))
			.orderBy(contentItem.order)
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

		return items;
	});

const getContentById = authed
	.route({
		path: "/content/{contentId}",
		method: "GET",
		tags: ["Content"],
	})
	.input(
		type({
			contentId: "number",
		}),
	)
	.handler(async ({ input }) => {
		const [row] = await db
			.select({
				id: contentItem.id,
				title: contentItem.title,
				type: contentItem.type,
				subtestId: contentItem.subtestId,

				videoId: videoMaterial.id,
				videoUrl: videoMaterial.videoUrl,
				videoContent: videoMaterial.content,

				noteId: noteMaterial.id,
				noteContent: noteMaterial.content,
			})
			.from(contentItem)
			.leftJoin(videoMaterial, eq(videoMaterial.contentItemId, contentItem.id))
			.leftJoin(noteMaterial, eq(noteMaterial.contentItemId, contentItem.id))
			.where(eq(contentItem.id, input.contentId))
			.limit(1);

		if (!row) {
			throw new ORPCError("NOT_FOUND", { message: "Konten tidak ditemukan" });
		}

		const practiceQuestions = await db
			.select({
				questionId: contentPracticeQuestions.questionId,
				order: contentPracticeQuestions.order,
			})
			.from(contentPracticeQuestions)
			.where(eq(contentPracticeQuestions.contentItemId, input.contentId))
			.orderBy(contentPracticeQuestions.order);

		return {
			id: row.id,
			title: row.title,
			type: row.type,
			subtestId: row.subtestId,
			video: row.videoId
				? {
						id: row.videoId,
						videoUrl: row.videoUrl,
						content: row.videoContent,
					}
				: null,
			note: row.noteId
				? {
						id: row.noteId,
						content: row.noteContent,
					}
				: null,
			practiceQuestions:
				practiceQuestions.length > 0
					? {
							questions: practiceQuestions,
						}
					: null,
		};
	});

/**
 * Track content view (for recent views)
 * POST /api/content/{id}/view
 */
const trackView = authed
	.route({
		path: "/content/{id}/view",
		method: "POST",
		tags: ["Content"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string" }))
	.handler(async ({ input, context }) => {
		// Verify content exists
		const [item] = await db
			.select({ id: contentItem.id })
			.from(contentItem)
			.where(eq(contentItem.id, input.id))
			.limit(1);

		if (!item)
			throw new ORPCError("NOT_FOUND", {
				message: "Konten tidak ditemukan",
			});

		// Insert new view
		await db.insert(recentContentView).values({
			userId: context.session.user.id,
			contentItemId: input.id,
		});

		// Keep only last 5 views
		const allViews = await db
			.select({ id: recentContentView.id })
			.from(recentContentView)
			.where(eq(recentContentView.userId, context.session.user.id))
			.orderBy(desc(recentContentView.viewedAt));

		if (allViews.length > 5) {
			const toDelete = allViews.slice(5).map((v) => v.id);
			await db.delete(recentContentView).where(inArray(recentContentView.id, toDelete));
		}

		return { message: "Berhasil mencatat aktivitas" };
	});

/**
 * Get recent 5 content views for dashboard
 * GET /api/content/recent
 */
const getRecentViews = authed
	.route({
		path: "/content/recent",
		method: "GET",
		tags: ["Content"],
	})
	.handler(async ({ context }) => {
		const views = await db
			.select({
				viewedAt: recentContentView.viewedAt,
				contentId: contentItem.id,
				contentTitle: contentItem.title,
				contentType: contentItem.type,
				subtestId: subtest.id,
				subtestName: subtest.name,
				subtestShortName: subtest.shortName,
			})
			.from(recentContentView)
			.innerJoin(contentItem, eq(contentItem.id, recentContentView.contentItemId))
			.innerJoin(subtest, eq(subtest.id, contentItem.subtestId))
			.where(eq(recentContentView.userId, context.session.user.id))
			.orderBy(desc(recentContentView.viewedAt))
			.limit(5);

		return views;
	});

/**
 * Update user progress
 * PATCH /api/content/{id}/progress
 */
const updateProgress = authed
	.route({
		path: "/content/{id}/progress",
		method: "PATCH",
		tags: ["Content"],
	})
	.input(
		type({
			id: "number",
			videoCompleted: "boolean?",
			noteCompleted: "boolean?",
			practiceQuestionsCompleted: "boolean?",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ input, context }) => {
		// Verify content exists
		const [item] = await db
			.select({ id: contentItem.id })
			.from(contentItem)
			.where(eq(contentItem.id, input.id))
			.limit(1);

		if (!item)
			throw new ORPCError("NOT_FOUND", {
				message: "Konten tidak ditemukan",
			});

		// Prepare update data
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

		if (input.videoCompleted !== undefined) updateData.videoCompleted = input.videoCompleted;
		if (input.noteCompleted !== undefined) updateData.noteCompleted = input.noteCompleted;
		if (input.practiceQuestionsCompleted !== undefined)
			updateData.practiceQuestionsCompleted = input.practiceQuestionsCompleted;

		// Upsert progress
		await db
			.insert(userProgress)
			.values({
				userId: context.session.user.id,
				contentItemId: input.id,
				...updateData,
			})
			.onConflictDoUpdate({
				target: [userProgress.userId, userProgress.contentItemId],
				set: updateData,
			});

		return { message: "Progress berhasil disimpan" };
	});

export const subtestRouter = {
	listSubtests,
	listContentByCategory,
	getContentById,
	trackView,
	getRecentViews,
	updateProgress,
};
