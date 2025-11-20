import { authClient } from "./auth-client";

export async function getUser() {
  return (await authClient.getSession()).data;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await authClient.getSession();
  console.log(user);

  if (user) return true;

  return false;
}
