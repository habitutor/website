import { auth } from "@habitutor/auth";
import { db } from "@habitutor/db";
import { session as sessionTable, user as userTable } from "@habitutor/db/schema/auth";
import { and, eq, gt } from "drizzle-orm";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
  context: HonoContext;
};

function getBearerToken(headers: Headers) {
  const authorization = headers.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

async function getBearerSession(headers: Headers) {
  if (process.env.BETTER_AUTH_ACCEPT_BEARER_TOKEN !== "true") {
    return null;
  }

  const token = getBearerToken(headers);
  if (!token) {
    return null;
  }

  const [row] = await db
    .select()
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(and(eq(sessionTable.token, token), gt(sessionTable.expiresAt, new Date())))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    session: row.session,
    user: row.user,
  };
}

export async function createContext({ context }: CreateContextOptions) {
  const session =
    (await auth.api.getSession({
      headers: context.req.raw.headers,
    })) ?? (await getBearerSession(context.req.raw.headers));

  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
