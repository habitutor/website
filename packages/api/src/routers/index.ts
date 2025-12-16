import type { RouterClient } from "@orpc/server";
import { type } from "arktype";
import { pub } from "../index";
import { adminPracticePackRouter } from "./admin/practice-pack";
import { flashcardRouter } from "./flashcard";
import { practicePackRouter } from "./practice-pack";
import { subtestRouter } from "./subtest";
import { adminSubtestRouter } from "./admin/subtest";

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
  subtest: subtestRouter,
  admin: {
    practicePack: adminPracticePackRouter,
    subtest: adminSubtestRouter,
  },
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
