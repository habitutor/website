import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export function db(env: CloudflareBindings) {
  const sql = neon(env.DATABASE_URL);

  return drizzle({
    client: sql,
    casing: "snake_case",
  });
}
