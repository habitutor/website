import { db } from "@habitutor/db";
import { contentItem, contentPracticeQuestions, noteMaterial, subtest, videoMaterial } from "@habitutor/db/schema/subtest";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { and, eq } from "drizzle-orm";
import { authed } from "../..";

/**
 * Create new subtest (class)
 * POST /api/admin/subtests
 */
const createSubtest = authed
	.route({
		path: "/admin/subtests",
		method: "POST",
		tags: ["Admin - Classes"],
	})
	.input(
		type({
			name: "string",
			shortName: "string",
			description: "string?",
			order: "number?",
		}),
	)
	.output(type({ message: "string", id: "number" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check

		const [created] = await db
			.insert(subtest)
			.values({
				name: input.name,
				shortName: input.shortName,
				description: input.description ?? null,
				order: input.order ?? 1,
			})
			.returning();

		if (!created)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal membuat kelas",
			});

		return {
			message: "Kelas berhasil dibuat",
			id: created.id,
		};
	});

/**
 * Update subtest (class)
 * PATCH /api/admin/subtests/{id}
 */
const updateSubtest = authed
	.route({
		path: "/admin/subtests/{id}",
		method: "PATCH",
		tags: ["Admin - Classes"],
	})
	.input(
		type({
			id: "number",
			name: "string?",
			shortName: "string?",
			description: "string?",
			order: "number?",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check

		const updateData: {
			name?: string;
			shortName?: string;
			description?: string | null;
			order?: number;
			updatedAt: Date;
		} = {
			updatedAt: new Date(),
		};

		if (input.name !== undefined) updateData.name = input.name;
		if (input.shortName !== undefined) updateData.shortName = input.shortName;
		if (input.description !== undefined) updateData.description = input.description ?? null;
		if (input.order !== undefined) updateData.order = input.order;

		const [updatedRow] = await db.update(subtest).set(updateData).where(eq(subtest.id, input.id)).returning();

		if (!updatedRow)
			throw new ORPCError("NOT_FOUND", {
				message: "Kelas tidak ditemukan",
			});

		return { message: "Kelas berhasil diperbarui" };
	});

/**
 * Delete subtest (class)
 * DELETE /api/admin/subtests/{id}
 */
const deleteSubtest = authed
	.route({
		path: "/admin/subtests/{id}",
		method: "DELETE",
		tags: ["Admin - Classes"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check

		const [deletedRow] = await db.delete(subtest).where(eq(subtest.id, input.id)).returning();

		if (!deletedRow)
			throw new ORPCError("NOT_FOUND", {
				message: "Kelas tidak ditemukan",
			});

		return { message: "Kelas berhasil dihapus" };
	});

/**
 * Reorder subtests (classes)
 * PATCH /api/admin/subtests/reorder
 */
const reorderSubtests = authed
	.route({
		path: "/admin/subtests/reorder",
		method: "PATCH",
		tags: ["Admin - Classes"],
	})
	.input(
		type({
			items: "unknown",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check

		const items = input.items as { id: number; order: number }[];

		await db.transaction(async (tx) => {
			for (const item of items) {
				await tx.update(subtest).set({ order: item.order, updatedAt: new Date() }).where(eq(subtest.id, item.id));
			}
		});

		return { message: "Urutan kelas berhasil diperbarui" };
	});

/**
 * Create new content item
 * POST /api/admin/content
 */
const createContent = authed
	.route({
		path: "/admin/content",
		method: "POST",
		tags: ["Admin - Content"],
	})
	.input(
		type({
			subtestId: "number",
			type: "'material' | 'tips_and_trick'",
			title: "string",
			order: "number",
		}),
	)
	.output(type({ message: "string", contentId: "number" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check
		// if (!context.session.user.isAdmin) throw ORPCError("FORBIDDEN")

		const [newContent] = await db
			.insert(contentItem)
			.values({
				subtestId: input.subtestId,
				type: input.type,
				title: input.title,
				order: input.order,
			})
			.returning();

		if (!newContent)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal membuat konten",
			});

		return {
			message: "Konten berhasil dibuat",
			contentId: newContent.id,
		};
	});

/**
 * Update content item
 * PATCH /api/admin/content/{id}
 */
const updateContent = authed
	.route({
		path: "/admin/content/{id}",
		method: "PATCH",
		tags: ["Admin - Content"],
	})
	.input(
		type({
			id: "number",
			title: "string?",
			order: "number?",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check

		const updateData: { title?: string; order?: number; updatedAt: Date } = {
			updatedAt: new Date(),
		};

		if (input.title !== undefined) updateData.title = input.title;
		if (input.order !== undefined) updateData.order = input.order;

		const [updated] = await db.update(contentItem).set(updateData).where(eq(contentItem.id, input.id)).returning();

		if (!updated)
			throw new ORPCError("NOT_FOUND", {
				message: "Konten tidak ditemukan",
			});

		return { message: "Konten berhasil diperbarui" };
	});

/**
 * Delete content item
 * DELETE /api/admin/content/{id}
 */
const deleteContent = authed
	.route({
		path: "/admin/content/{id}",
		method: "DELETE",
		tags: ["Admin - Content"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check

		const [deleted] = await db.delete(contentItem).where(eq(contentItem.id, input.id)).returning();

		if (!deleted)
			throw new ORPCError("NOT_FOUND", {
				message: "Konten tidak ditemukan",
			});

		return { message: "Konten berhasil dihapus" };
	});

/**
 * Reorder content items
 * PATCH /api/admin/content/reorder
 */
const reorderContent = authed
	.route({
		path: "/admin/content/reorder",
		method: "PATCH",
		tags: ["Admin - Content"],
	})
	.input(
		type({
			subtestId: "number",
			type: "'material' | 'tips_and_trick'",
			items: "unknown",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check

		const items = input.items as { id: number; order: number }[];

		// Use transaction for atomic updates
		await db.transaction(async (tx) => {
			for (const item of items) {
				await tx
					.update(contentItem)
					.set({ order: item.order, updatedAt: new Date() })
					.where(
						and(
							eq(contentItem.id, item.id),
							eq(contentItem.subtestId, input.subtestId),
							eq(contentItem.type, input.type),
						),
					);
			}
		});

		return { message: "Urutan konten berhasil diperbarui" };
	});

/**
 * Add/Update video material
 * POST /api/admin/content/{id}/video
 */
const upsertVideo = authed
	.route({
		path: "/admin/content/{id}/video",
		method: "POST",
		tags: ["Admin - Content"],
	})
	.input(
		type({
			id: "number",
			title: "string",
			videoUrl: "string",
			content: "object",
		}),
	)
	.output(type({ message: "string", videoId: "number" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check

		// Validate video URL
		if (!input.videoUrl) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Video URL wajib diisi",
			});
		}

		// Check if content exists
		const [content] = await db
			.select({ id: contentItem.id })
			.from(contentItem)
			.where(eq(contentItem.id, input.id))
			.limit(1);

		if (!content)
			throw new ORPCError("NOT_FOUND", {
				message: "Konten tidak ditemukan",
			});

		// Upsert video material
		const [video] = await db
			.insert(videoMaterial)
			.values({
				contentItemId: input.id,
				title: input.title,
				videoUrl: input.videoUrl,
				content: input.content,
			})
			.onConflictDoUpdate({
				target: videoMaterial.contentItemId,
				set: {
					title: input.title,
					videoUrl: input.videoUrl,
					content: input.content,
					updatedAt: new Date(),
				},
			})
			.returning();

		if (!video)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal menyimpan video material",
			});

		return {
			message: "Video material berhasil disimpan",
			videoId: video.id,
		};
	});

/**
 * Delete video material
 * DELETE /api/admin/content/{id}/video
 */
const deleteVideo = authed
	.route({
		path: "/admin/content/{id}/video",
		method: "DELETE",
		tags: ["Admin - Content"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check

		const [deleted] = await db.delete(videoMaterial).where(eq(videoMaterial.contentItemId, input.id)).returning();

		if (!deleted)
			throw new ORPCError("NOT_FOUND", {
				message: "Video material tidak ditemukan",
			});

		return { message: "Video material berhasil dihapus" };
	});

/**
 * Add/Update note material
 * POST /api/admin/content/{id}/note
 */
const upsertNote = authed
	.route({
		path: "/admin/content/{id}/note",
		method: "POST",
		tags: ["Admin - Content"],
	})
	.input(
		type({
			id: "number",
			content: "object", // Tiptap JSON
		}),
	)
	.output(type({ message: "string", noteId: "number" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check

		// Check if content exists
		const [content] = await db
			.select({ id: contentItem.id })
			.from(contentItem)
			.where(eq(contentItem.id, input.id))
			.limit(1);

		if (!content)
			throw new ORPCError("NOT_FOUND", {
				message: "Konten tidak ditemukan",
			});

		// Upsert note material
		const [note] = await db
			.insert(noteMaterial)
			.values({
				contentItemId: input.id,
				content: input.content,
			})
			.onConflictDoUpdate({
				target: noteMaterial.contentItemId,
				set: {
					content: input.content,
					updatedAt: new Date(),
				},
			})
			.returning();

		if (!note)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Gagal menyimpan catatan material",
			});

		return {
			message: "Catatan material berhasil disimpan",
			noteId: note.id,
		};
	});

/**
 * Delete note material
 * DELETE /api/admin/content/{id}/note
 */
const deleteNote = authed
	.route({
		path: "/admin/content/{id}/note",
		method: "DELETE",
		tags: ["Admin - Content"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check

		const [deleted] = await db.delete(noteMaterial).where(eq(noteMaterial.contentItemId, input.id)).returning();

		if (!deleted)
			throw new ORPCError("NOT_FOUND", {
				message: "Catatan material tidak ditemukan",
			});

		return { message: "Catatan material berhasil dihapus" };
	});

/**
 * Link practice questions to content (only for Material type)
 * POST /api/admin/content/{id}/practice-questions
 */
const linkPracticeQuestions = authed
	.route({
		path: "/admin/content/{id}/practice-questions",
		method: "POST",
		tags: ["Admin - Content"],
	})
	.input(
		type({
			id: "number",
			questionIds: "number[]",
		}),
	)
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check

		// Check if content exists and is Material type
		const [content] = await db
			.select({ id: contentItem.id, type: contentItem.type })
			.from(contentItem)
			.where(eq(contentItem.id, input.id))
			.limit(1);

		if (!content)
			throw new ORPCError("NOT_FOUND", {
				message: "Content not found",
			});

		if (content.type === "tips_and_trick") {
			throw new ORPCError("BAD_REQUEST", {
				message: "Tips & Trick cannot have practice questions",
			});
		}

		// Delete existing practice question links
		await db.delete(contentPracticeQuestions).where(eq(contentPracticeQuestions.contentItemId, input.id));

		// Insert new practice question links
		if (input.questionIds.length > 0) {
			await db.insert(contentPracticeQuestions).values(
				input.questionIds.map((questionId, index) => ({
					contentItemId: input.id,
					questionId,
					order: index + 1,
				})),
			);
		}

		return { message: "Practice questions successfully linked to content" };
	});

/**
 * Remove practice questions from content
 * DELETE /api/admin/content/{id}/practice-questions
 */
const unlinkPracticeQuestions = authed
	.route({
		path: "/admin/content/{id}/practice-questions",
		method: "DELETE",
		tags: ["Admin - Content"],
	})
	.input(type({ id: "number" }))
	.output(type({ message: "string" }))
	.handler(async ({ input }) => {
		// TODO: Add admin authorization check

		await db.delete(contentPracticeQuestions).where(eq(contentPracticeQuestions.contentItemId, input.id));

		return { message: "Practice questions successfully removed from content" };
	});

export const adminSubtestRouter = {
	createSubtest,
	updateSubtest,
	deleteSubtest,
	reorderSubtests,
	createContent,
	updateContent,
	deleteContent,
	reorderContent,
	upsertVideo,
	deleteVideo,
	upsertNote,
	deleteNote,
	linkPracticeQuestions,
	unlinkPracticeQuestions,
};
