import { createContext } from "@habitutor/api/context";
import { appRouter } from "@habitutor/api/routers/index";
import { auth } from "@habitutor/auth";
import { experimental_ArkTypeToJsonSchemaConverter as ArkTypeToJsonSchemaConverter } from "@orpc/arktype";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: (origin) => {
			const allowedOrigins = [
				process.env.CORS_ORIGIN || "http://localhost:3000",
				"http://localhost:3000",
				"http://localhost:5173",
			];
			// Return the origin if it's allowed, otherwise return undefined to deny
			if (!origin) return allowedOrigins[0]; // Allow requests with no origin (e.g., same-origin)
			return allowedOrigins.includes(origin) ? origin : undefined;
		},
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
		allowHeaders: [
			"Content-Type",
			"Authorization",
			"X-Requested-With",
			"Accept",
			"Origin",
		],
		exposeHeaders: ["Content-Length", "Content-Type"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ArkTypeToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

export const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
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

export default {
	port: process.env.PORT || 3001,
	fetch: app.fetch,
};
