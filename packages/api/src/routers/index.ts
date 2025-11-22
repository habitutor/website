import type { RouterClient } from "@orpc/server";
import { pub } from "../index";
import { practicePackRouter } from "./practice-pack";
import { type } from "arktype";

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
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
