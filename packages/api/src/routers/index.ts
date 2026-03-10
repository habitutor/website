import type { RouterClient } from "@orpc/server";
import { type } from "arktype";
import { pub } from "#index";
import { adminPracticePackRouter } from "#routers/admin/practice-pack";
import { adminQuestionRouter } from "#routers/admin/question";
import { adminStatisticsRouter } from "#routers/admin/statistics";
import { adminSubtestRouter } from "#routers/admin/subtest";
import { adminUserRouter } from "#routers/admin/users";
import { flashcardRouter } from "#routers/flashcard";
import { practicePackRouter } from "#routers/practice-pack";
import { socialRouter } from "#routers/social";
import { subtestRouter } from "#routers/subtest";
import { transactionRouter } from "#routers/transaction";

export const appRouter = {
	healthCheck: pub
		.route({
			path: "/healthcheck",
			method: "GET",
			tags: ["Uncategorized"],
		})
		.output(type({ message: "string" }))
		.handler(() => {
			return { message: "OK" };
		}),
	social: socialRouter,
	practicePack: practicePackRouter,
	flashcard: flashcardRouter,
	subtest: subtestRouter,
	admin: {
		statistics: adminStatisticsRouter,
		practicePack: adminPracticePackRouter,
		question: adminQuestionRouter,
		subtest: adminSubtestRouter,
		users: adminUserRouter,
	},
	transaction: transactionRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
