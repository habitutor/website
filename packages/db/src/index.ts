import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as practice from "./schema/practice";

export function db(env: CloudflareBindings) {
  const sql = neon(env.DATABASE_URL);

  return drizzle({
    client: sql,
    casing: "snake_case",
    schema: {
      ...practice,
    },
  });
}

export * from "./schema/auth";
export * from "./schema/practice";
