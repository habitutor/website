import type { RouterClient } from "@orpc/server";
import { type } from "arktype";
import { pub } from "../index";
import { adminPracticePackRouter } from "./admin/practice-pack";
import { flashcardRouter } from "./flashcard";
import { practicePackRouter } from "./practice-pack";

export const appRouter = {
	healthCheck: pub
		.route({
			path: "/healthcheck",
			method: "GET",
			tags: ["Uncategorized"],
		})
		.output(type("string"))
		.handler(() => {
			return "OK";
		}),
	practicePack: practicePackRouter,
	flashcard: flashcardRouter,
	admin: {
		practicePack: adminPracticePackRouter,
	},
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
