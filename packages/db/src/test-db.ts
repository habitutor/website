import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as flashcard from "./schema/flashcard";
import * as practice from "./schema/practice-pack";
import * as subtest from "./schema/subtest";
import * as transaction from "./schema/transaction";

const TEST_DATABASE_URL =
	process.env.TEST_DATABASE_URL || "postgresql://postgres:password@localhost:6970/habitutor_test";

let pool: Pool | null = null;
let testDb: ReturnType<typeof drizzle> | null = null;

export function getTestDb() {
	if (!testDb) {
		pool = new Pool({
			connectionString: TEST_DATABASE_URL,
			max: 5,
		});
		testDb = drizzle(pool, {
			casing: "snake_case",
			schema: {
				...practice,
				...flashcard,
				...transaction,
				...subtest,
			},
		});
	}
	return testDb;
}

export async function closeTestDb() {
	if (pool) {
		await pool.end();
		pool = null;
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
