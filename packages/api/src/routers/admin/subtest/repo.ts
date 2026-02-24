import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import {
	contentItem,
	contentPracticeQuestions,
	noteMaterial,
	subtest,
	videoMaterial,
} from "@habitutor/db/schema/subtest";
import { and, eq } from "drizzle-orm";

export const adminSubtestRepo = {
	createSubtest: async ({
		db = defaultDb,
		name,
		shortName,
		description,
		order,
	}: {
		db?: DrizzleDatabase;
		name: string;
		shortName: string;
		description: string | null;
		order: number;
	}) => {
		const [created] = await db
			.insert(subtest)
			.values({
				name,
				shortName,
				description,
				order,
			})
			.returning();
		return created;
	},

	updateSubtest: async ({
		db = defaultDb,
		id,
		data,
	}: {
		db?: DrizzleDatabase;
		id: number;
		data: {
			name?: string;
			shortName?: string;
			description?: string | null;
			order?: number;
			updatedAt: Date;
		};
	}) => {
		const [updated] = await db.update(subtest).set(data).where(eq(subtest.id, id)).returning();
		return updated;
	},

	deleteSubtest: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
		const [deleted] = await db.delete(subtest).where(eq(subtest.id, id)).returning();
		return deleted;
	},

	updateSubtestOrder: async ({ db = defaultDb, id, order }: { db?: DrizzleDatabase; id: number; order: number }) => {
		return db.update(subtest).set({ order, updatedAt: new Date() }).where(eq(subtest.id, id));
	},

	createContentItem: async ({
		db = defaultDb,
		subtestId,
		type,
		title,
		order,
	}: {
		db?: DrizzleDatabase;
		subtestId: number;
		type: "material" | "tips_and_trick";
		title: string;
		order: number;
	}) => {
		const [created] = await db
			.insert(contentItem)
			.values({
				subtestId,
				type,
				title,
				order,
			})
			.returning();
		return created;
	},

	updateContentItem: async ({
		db = defaultDb,
		id,
		data,
	}: {
		db?: DrizzleDatabase;
		id: number;
		data: { title?: string; order?: number; updatedAt: Date };
	}) => {
		const [updated] = await db.update(contentItem).set(data).where(eq(contentItem.id, id)).returning();
		return updated;
	},

	deleteContentItem: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
		const [deleted] = await db.delete(contentItem).where(eq(contentItem.id, id)).returning();
		return deleted;
	},

	updateContentOrder: async ({
		db = defaultDb,
		id,
		order,
		subtestId,
		type,
	}: {
		db?: DrizzleDatabase;
		id: number;
		order: number;
		subtestId: number;
		type: "material" | "tips_and_trick";
	}) => {
		return db
			.update(contentItem)
			.set({ order, updatedAt: new Date() })
			.where(and(eq(contentItem.id, id), eq(contentItem.subtestId, subtestId), eq(contentItem.type, type)));
	},

	getContentItemById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
		const [item] = await db.select({ id: contentItem.id }).from(contentItem).where(eq(contentItem.id, id)).limit(1);
		return item;
	},

	getContentItemWithDetails: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
		const [item] = await db
			.select({ id: contentItem.id, type: contentItem.type })
			.from(contentItem)
			.where(eq(contentItem.id, id))
			.limit(1);
		return item;
	},

	upsertVideoMaterial: async ({
		db = defaultDb,
		contentItemId,
		videoUrl,
		content,
	}: {
		db?: DrizzleDatabase;
		contentItemId: number;
		videoUrl: string;
		content: object;
	}) => {
		const [video] = await db
			.insert(videoMaterial)
			.values({
				contentItemId,
				videoUrl,
				content,
			})
			.onConflictDoUpdate({
				target: videoMaterial.contentItemId,
				set: {
					videoUrl,
					content,
					updatedAt: new Date(),
				},
			})
			.returning();
		return video;
	},

	deleteVideoMaterial: async ({ db = defaultDb, contentItemId }: { db?: DrizzleDatabase; contentItemId: number }) => {
		const [deleted] = await db.delete(videoMaterial).where(eq(videoMaterial.contentItemId, contentItemId)).returning();
		return deleted;
	},

	upsertNoteMaterial: async ({
		db = defaultDb,
		contentItemId,
		content,
	}: {
		db?: DrizzleDatabase;
		contentItemId: number;
		content: object;
	}) => {
		const [note] = await db
			.insert(noteMaterial)
			.values({
				contentItemId,
				content,
			})
			.onConflictDoUpdate({
				target: noteMaterial.contentItemId,
				set: {
					content,
					updatedAt: new Date(),
				},
			})
			.returning();
		return note;
	},

	deleteNoteMaterial: async ({ db = defaultDb, contentItemId }: { db?: DrizzleDatabase; contentItemId: number }) => {
		const [deleted] = await db.delete(noteMaterial).where(eq(noteMaterial.contentItemId, contentItemId)).returning();
		return deleted;
	},

	deletePracticeQuestions: async ({
		db = defaultDb,
		contentItemId,
	}: {
		db?: DrizzleDatabase;
		contentItemId: number;
	}) => {
		return db.delete(contentPracticeQuestions).where(eq(contentPracticeQuestions.contentItemId, contentItemId));
	},

	insertPracticeQuestions: async ({
		db = defaultDb,
		contentItemId,
		questionIds,
	}: {
		db?: DrizzleDatabase;
		contentItemId: number;
		questionIds: number[];
	}) => {
		return db.insert(contentPracticeQuestions).values(
			questionIds.map((questionId, index) => ({
				contentItemId,
				questionId,
				order: index + 1,
			})),
		);
	},
};
