import { SQL } from "bun";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/bun-sql";
import { clearSubtest, seedSubtest } from "./subtest.seed";
import { clearQuestion, seedQuestion } from "./question.seed";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({
  path: resolve(__dirname, "../../../../apps/server/.env"),
  quiet: true,
});

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot run seed script in production");
  }

  console.log("Starting seed...");

  const client = new SQL(process.env.DATABASE_URL);
  const db = drizzle({ client, casing: "snake_case" });

  await clearSubtest(db);
  await seedSubtest(db);

  await clearQuestion(db);
  await seedQuestion(db);

  console.log("Seed completed");

  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
