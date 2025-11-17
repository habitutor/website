import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const lesson = pgTable("lesson", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	content: text(),
});
