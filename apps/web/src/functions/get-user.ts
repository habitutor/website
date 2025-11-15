import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/middleware/auth";

export const getUser = createServerFn()
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.session;
	});
