import { SQL } from "bun";
import { config as loadEnv } from "dotenv";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import { type BunSQLQueryResultHKT, drizzle } from "drizzle-orm/bun-sql";
import type { PgTransaction } from "drizzle-orm/pg-core";
import * as auth from "./schema/auth";
import * as dashboard from "./schema/dashboard";
import * as flashcard from "./schema/flashcard";
import * as flashcardRelations from "./schema/flashcard-relations";
import * as practice from "./schema/practice-pack";
import * as practiceRelations from "./schema/practice-pack-relations";
import * as question from "./schema/question";
import * as referral from "./schema/referral";
import * as transaction from "./schema/transaction";

const schema = {
  ...auth,
  ...practice,
  ...question,
  ...flashcard,
  ...practiceRelations,
  ...flashcardRelations,
  ...dashboard,
  ...referral,
  ...transaction,
};

function loadDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    loadEnv({ quiet: true });
    loadEnv({ path: "apps/server/.env", quiet: true });
    loadEnv({ path: "apps/server/.env.local", quiet: true });
  }
}

function createDb() {
  loadDatabaseUrl();
  const client = new SQL(process.env.DATABASE_URL || "");

  return drizzle({
    client,
    casing: "snake_case",
    schema,
  });
}

type DbClient = ReturnType<typeof createDb>;

let dbInstance: DbClient | null = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}

export { and, asc, count, desc, eq, sql } from "drizzle-orm";

export type Schema = typeof schema;
export type DrizzleDatabase =
  | DbClient
  | PgTransaction<BunSQLQueryResultHKT, Schema, ExtractTablesWithRelations<Schema>>;
