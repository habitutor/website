import type { auth } from "@habitutor/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const getBaseUrl = () => {
	// 1. Browser Environment
	if (typeof window !== "undefined") {
		return import.meta.env.VITE_API_URL || "https://habitutor-server.devino.me";
	}

	// 2. Server Environment
	return process.env.VITE_API_URL || import.meta.env.VITE_API_URL || "https://habitutor-server.devino.me";
};

export const authClient = createAuthClient({
	baseURL: getBaseUrl(),
	plugins: [inferAdditionalFields<typeof auth>()],
});

export type Session = typeof authClient.$Infer.Session;
