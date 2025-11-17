import { drizzle } from "drizzle-orm/node-postgres";

export function db(env: CloudflareBindings) {
  return drizzle({
    connection: env.DATABASE_URL,
    casing: "snake_case",
  });
}

export * from "./schema/auth";
export * from "./schema/lesson";
export * from "./schema/practice";
