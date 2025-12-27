import type { auth } from "@habitutor/auth";
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_SERVER_URL,
	plugins: [inferAdditionalFields<typeof auth>(), emailOTPClient()],
});

export type Session = typeof authClient.$Infer.Session;
