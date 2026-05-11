import { config } from "dotenv";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres/session";
import { Pool } from "pg";
import * as auth from "./schema/auth";
import * as dashboard from "./schema/dashboard";
import * as flashcard from "./schema/flashcard";
import * as practice from "./schema/practice-pack";
import * as question from "./schema/question";
import * as referral from "./schema/referral";
import * as transaction from "./schema/transaction";
import * as tryout from "./schema/tryout";
import * as universitas from "./schema/universitas";

const schema = {
  ...auth,
  ...practice,
  ...question,
  ...flashcard,
  ...dashboard,
  ...referral,
  ...transaction,
  ...tryout,
  ...universitas,
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
  const pool = new Pool({ connectionString: process.env.DATABASE_URL || "" });

  return drizzle({
    client: pool,
    casing: "snake_case",
    schema,
  });
}

type DbClient = ReturnType<typeof createDb>;

export const db = createDb();

export type Schema = typeof schema;
export type DrizzleDatabase =
  | DbClient
  | PgTransaction<NodePgQueryResultHKT, Schema, ExtractTablesWithRelations<Schema>>;
