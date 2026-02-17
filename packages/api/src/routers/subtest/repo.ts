import { db } from "@habitutor/db";
import { sql } from "drizzle-orm";

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

export const subtestRepository = {
	getSubtestHistoryForUser: async (userId: string) => {
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

	recordContentView: async (userId: string, contentItemId: number) => {
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
};
