import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { authClient } from "./auth-client";

export const getUser = createServerFn().handler(async () => {
  const headers = getRequestHeaders();
  const headersToForward = {
    cookie: headers.cookie || "",
    "user-agent": headers["user-agent"],
  };

  const response = await authClient.getSession({
    fetchOptions: {
      headers: headersToForward,
    },
  });

  console.log("🔄️ Headers:", headers)
  console.log("🔄️ Cookies:", headers.cookie)
  console.log("🔥 getUser full response:", response);
  console.log("🔥 getUser session data:", response.data);
  console.log("🔥 getUser error:", response.error);

  return response.data;
});

export async function isAuthenticated() {
  const user = await authClient.getSession();

  if (user) return true;

  return false;
}
