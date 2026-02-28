import type { RouterClient } from "@orpc/server";
import { type } from "arktype";
import { pub } from "../index";
import { adminPracticePackRouter } from "./admin/practice-pack";
import { adminQuestionRouter } from "./admin/question";
import { adminStatisticsRouter } from "./admin/statistics";
import { adminSubtestRouter } from "./admin/subtest";
import { adminUserRouter } from "./admin/users";
import { flashcardRouter } from "./flashcard";
import { practicePackRouter } from "./practice-pack";
import { profileRouter } from "./profile";
import { referralRouter } from "./referral";
import { socialRouter } from "./social";
import { subtestRouter } from "./subtest";
import { transactionRouter } from "./transaction";

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
  profile: profileRouter,
  practicePack: practicePackRouter,
  flashcard: flashcardRouter,
  subtest: subtestRouter,
  admin: {
    practicePack: adminPracticePackRouter,
    subtest: adminSubtestRouter,
    users: adminUserRouter,
  },
  transaction: transactionRouter,
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
	referral: referralRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
