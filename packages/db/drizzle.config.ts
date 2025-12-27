import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

console.log("DATABASE_URL env var exists:", !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
	console.log("Loading from .env...");
	dotenv.config({
		path: "../../apps/server/.env",
	});
	console.log("DATABASE_URL after .env load:", !!process.env.DATABASE_URL);
}

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set in environment variables.");
}
export default defineConfig({
	schema: "./src/schema",
	out: "./src/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});
