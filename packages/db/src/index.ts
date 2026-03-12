import { SQL } from "bun";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import { type BunSQLQueryResultHKT, drizzle } from "drizzle-orm/bun-sql";
import type { PgTransaction } from "drizzle-orm/pg-core";
import * as flashcard from "./schema/flashcard";
import * as practice from "./schema/practice-pack";
import * as transaction from "./schema/transaction";

const client = new SQL(process.env.DATABASE_URL || "");

const schema = {
  ...practice,
  ...flashcard,
  ...transaction,
};

export const db = drizzle({
  client: client,
  casing: "snake_case",
  schema,
});

export type Schema = typeof schema;
export type DrizzleDatabase =
  | typeof db
  | PgTransaction<BunSQLQueryResultHKT, Schema, ExtractTablesWithRelations<Schema>>;
