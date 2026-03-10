import { SQL } from "bun";
import type { BunSQLDatabase } from "drizzle-orm/bun-sql";
import { drizzle } from "drizzle-orm/bun-sql";
import * as flashcard from "#schema/flashcard";
import * as practice from "#schema/practice-pack";
import * as subtest from "#schema/subtest";
import * as transaction from "#schema/transaction";

const TEST_DATABASE_URL =
	process.env.TEST_DATABASE_URL || "postgresql://postgres:password@localhost:6970/habitutor_test";

let client: SQL | null = null;
let testDb: BunSQLDatabase<typeof schema> | null = null;

const schema = {
	...practice,
	...flashcard,
	...transaction,
	...subtest,
};

export function getTestDb() {
	if (!testDb) {
		client = new SQL(TEST_DATABASE_URL);
		testDb = drizzle({
			client,
			casing: "snake_case",
			schema,
		});
	}
	return testDb;
}

export async function closeTestDb() {
	if (client) {
		await client.close();
		client = null;
		testDb = null;
	}
}

export async function truncateAllTables() {
	const db = getTestDb();
	await db.execute("TRUNCATE TABLE user_flashcard_question_answer CASCADE");
	await db.execute("TRUNCATE TABLE user_flashcard_attempt CASCADE");
	await db.execute("TRUNCATE TABLE user_progress CASCADE");
	await db.execute("TRUNCATE TABLE recent_content_view CASCADE");
	await db.execute("TRUNCATE TABLE content_practice_questions CASCADE");
	await db.execute("TRUNCATE TABLE video_material CASCADE");
	await db.execute("TRUNCATE TABLE note_material CASCADE");
	await db.execute("TRUNCATE TABLE content_item CASCADE");
	await db.execute("TRUNCATE TABLE subtest CASCADE");
	await db.execute("TRUNCATE TABLE practice_pack_questions CASCADE");
	await db.execute("TRUNCATE TABLE question_answer_option CASCADE");
	await db.execute("TRUNCATE TABLE question CASCADE");
	await db.execute("TRUNCATE TABLE practice_pack CASCADE");
	await db.execute(`TRUNCATE TABLE "user" CASCADE`);
}
