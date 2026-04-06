import { SQL } from "bun";
import { config } from "dotenv";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import { type BunSQLQueryResultHKT, drizzle } from "drizzle-orm/bun-sql";
import type { PgTransaction } from "drizzle-orm/pg-core";
import * as auth from "./schema/auth";
import * as dashboard from "./schema/dashboard";
import * as flashcard from "./schema/flashcard";
import * as practice from "./schema/practice-pack";
import * as question from "./schema/question";
import * as referral from "./schema/referral";
import * as transaction from "./schema/transaction";
import * as feedback from "./schema/feedback";

const schema = {
  ...auth,
  ...practice,
  ...question,
  ...flashcard,
  ...dashboard,
  ...referral,
  ...transaction,
  ...feedback,
};

function loadDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    config({ quiet: true });
    config({ path: "apps/server/.env", quiet: true });
    config({ path: "apps/server/.env.local", quiet: true });
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

export const db = createDb();

// Alias for consistency with repo patterns
export const defaultDb = db;

export type Schema = typeof schema;
export type DrizzleDatabase =
  | DbClient
  | PgTransaction<BunSQLQueryResultHKT, Schema, ExtractTablesWithRelations<Schema>>;
