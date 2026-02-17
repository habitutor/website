import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
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

const schema = {
	...practice,
	...flashcard,
	...transaction,
};

export const db = drizzle(pool, {
	casing: "snake_case",
	schema,
});

export type Schema = typeof schema;
export type DrizzleDatabase =
	| typeof db
	| PgTransaction<NodePgQueryResultHKT, Schema, ExtractTablesWithRelations<Schema>>;
