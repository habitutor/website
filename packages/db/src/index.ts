import { drizzle } from "drizzle-orm/node-postgres";
import * as practice from "./schema/practice";

export const db = drizzle({
	connection: process.env.DATABASE_URL || "",
	casing: "snake_case",
	schema: {
		...practice,
	},
});

export * from "./schema/auth";
export * from "./schema/practice";
