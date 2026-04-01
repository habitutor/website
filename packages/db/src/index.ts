import { SQL } from "bun";
import { config as loadEnv } from "dotenv";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import { type BunSQLQueryResultHKT, drizzle } from "drizzle-orm/bun-sql";
import type { PgTransaction } from "drizzle-orm/pg-core";
import * as dashboard from "./schema/dashboard";
import * as flashcard from "./schema/flashcard";
import * as practice from "./schema/practice-pack";
import * as referral from "./schema/referral";
import * as transaction from "./schema/transaction";

if (!process.env.DATABASE_URL) {
  loadEnv({ quiet: true });
  loadEnv({ path: "apps/server/.env", quiet: true });
  loadEnv({ path: "apps/server/.env.local", quiet: true });
}

const client = new SQL(process.env.DATABASE_URL || "");

const schema = {
  ...practice,
  ...flashcard,
  ...dashboard,
  ...referral,
  ...transaction,
};

export const db = drizzle({
  client: client,
  casing: "snake_case",
  schema,
});

export { and, asc, count, desc, eq, sql } from "drizzle-orm";

export type Schema = typeof schema;
export type DrizzleDatabase =
  | typeof db
  | PgTransaction<BunSQLQueryResultHKT, Schema, ExtractTablesWithRelations<Schema>>;
