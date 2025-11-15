import { createMiddleware } from "@tanstack/react-start";
import { authClient } from "@/lib/auth-client";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    console.log("VITE_SERVER_URL", import.meta.env.VITE_SERVER_URL);
    const session = await authClient.getSession({
      fetchOptions: {
        headers: request.headers,
        throw: true,
      },
    });
    return next({
      context: { session },
    });
  },
);
