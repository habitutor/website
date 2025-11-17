import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import type { RouterClient } from "@orpc/server";
import { type } from "arktype";
import { protectedProcedure, publicProcedure } from "../index";
import { practiceRouter } from "./practice";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
	greet: publicProcedure
		.input(type("string"))
		.output(type("string"))
		.handler(({ input }) => {
			return `hello ${input}`;
		}),
	users: publicProcedure.handler(async ({ context }) => {
		return await db(context.env).select().from(user);
	}),
	practice: practiceRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
