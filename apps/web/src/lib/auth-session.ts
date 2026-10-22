import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";

export const AUTH_SESSION_QUERY_KEY = ["auth", "getSession"] as const;

export async function getFreshSession() {
  return authClient.getSession({
    query: {
      disableCookieCache: true,
    },
  });
}

export async function refreshAuthSession(options?: { invalidateRouter?: () => Promise<void> | void }) {
  queryClient.removeQueries({ queryKey: AUTH_SESSION_QUERY_KEY });

  const { data: refreshedSession } = await getFreshSession();
  queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, { data: refreshedSession });
  await queryClient.invalidateQueries({ queryKey: orpc.profile.me.queryKey() });

  await options?.invalidateRouter?.();

  return refreshedSession;
}
