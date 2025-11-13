import { drizzle } from "drizzle-orm/node-postgres";

export function db(env: CloudflareBindings) {
  return drizzle({
    connection: env.HYPERDRIVE.connectionString,
    casing: "snake_case",
  });
}
