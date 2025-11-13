import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import type { RouterClient } from "@orpc/server";
import * as z from "zod";
import { protectedProcedure, publicProcedure } from "../index";

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
		.input(z.string())
		.output(z.string())
		.handler(({ input }) => {
			return `hello ${input}`;
		}),
	users: publicProcedure.handler(async ({ context }) => {
		return await db(context.env).select().from(user);
	}),
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
