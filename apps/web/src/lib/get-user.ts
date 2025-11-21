import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { authClient } from "./auth-client";

export const getUser = createIsomorphicFn()
  .server(async () => {
    const { data } = await authClient.getSession({
      fetchOptions: {
        headers: getRequestHeaders(),
      },
    });

    return data;
  })
  .client(async () => {
    return (await authClient.getSession()).data;
  });

export async function isAuthenticated(): Promise<boolean> {
  const user = await authClient.getSession();

  if (user) return true;

  return false;
}
