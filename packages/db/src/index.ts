import { drizzle } from "drizzle-orm/node-postgres";
import * as flashcard from "./schema/flashcard";
import * as practice from "./schema/practice-pack";
import * as transaction from "./schema/transaction";

export const db = drizzle({
	connection: {
		connectionString: process.env.DATABASE_URL || "",
		ssl: {
			rejectUnauthorized: false,
		},
	},
	casing: "snake_case",
	schema: {
		...practice,
		...flashcard,
		...transaction,
	},
});
