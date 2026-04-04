import { createContext } from "@habitutor/api/context";
import { appRouter } from "@habitutor/api/routers/index";
import { isAdminRole, logger } from "@habitutor/shared";
import { getAuth } from "@habitutor/auth";
import { experimental_ArkTypeToJsonSchemaConverter as ArkTypeToJsonSchemaConverter } from "@orpc/arktype";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";

const app = new Hono();

app.use(honoLogger());
app.use(
  "/*",
  cors({
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:3000",
      "http://localhost:3000",
      "https://habitutor.id",
      "https://api.habitutor.id",
    ],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => getAuth().handler(c.req.raw));

app.use("/api-reference/*", async (c, next) => {
  const context = await createContext({ context: c });

  if (!context.session?.user) {
    return c.json({ error: "Unauthorized - Authentication required" }, 401);
  }

  if (!isAdminRole(context.session.user.role)) {
    return c.json({ error: "Forbidden - Admin access required" }, 403);
  }

  await next();
});

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ArkTypeToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      logger.error(error instanceof Error ? error : String(error));
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      logger.error(error instanceof Error ? error : String(error));
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => {
  return c.text("OK");
});

export function normalizeForwardedRequest(req: Request) {
  const url = new URL(req.url);
  if (req.headers.get("x-forwarded-proto") === "https") {
    url.protocol = "https:";
  }
  return new Request(url, req);
}

export default {
  port: process.env.PORT || 3001,
  fetch: (req: Request) => {
    return app.fetch(normalizeForwardedRequest(req));
  },
};
