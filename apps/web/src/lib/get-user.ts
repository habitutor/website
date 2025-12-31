import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { authClient } from "./auth-client";

export const getUser = createServerFn().handler(async () => {
  const headers = getRequestHeaders();
  const headersToForward = {
    cookie: headers.get("cookie") || "",
    "user-agent": headers.get("user-agent"),
  };

  const response = await authClient.getSession({
    fetchOptions: {
      headers: headersToForward,
    },
  });

  return response.data;
});

export async function isAuthenticated() {
  const user = await authClient.getSession();

  if (user) return true;

  return false;
}
