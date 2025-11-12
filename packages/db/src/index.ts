import { drizzle } from "drizzle-orm/node-postgres";

export function createDb(env: CloudflareBindings) {
  return drizzle({
    connection: env.DATABASE_URL,
    casing: "snake_case",
  });
}
