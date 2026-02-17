import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as flashcard from "./schema/flashcard";
import * as practice from "./schema/practice-pack";
import * as transaction from "./schema/transaction";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL || "",
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, {
	casing: "snake_case",
	schema: {
		...practice,
		...flashcard,
		...transaction,
	},
});
