import { env } from "cloudflare:workers";
import { auth } from "@habitutor/auth";
import { createMiddleware } from "@tanstack/react-start";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth(env).api.getSession({
      headers: request.headers,
    });
    return next({
      context: { session },
    });
  },
);
