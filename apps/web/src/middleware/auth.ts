import { createMiddleware } from "@tanstack/react-start";
import { authClient } from "@/lib/auth-client";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: request.headers,
        throw: true,
      },
    });
    console.log("VITE_SERVER_URL", import.meta.env.VITE_SERVER_URL);
    return next({
      context: { session },
    });
  },
);
