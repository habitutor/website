import type { AuthInstance } from "@habitutor/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getApiBaseUrl } from "./api-base-url";

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  fetchOptions: {
    credentials: "include",
  },
  plugins: [inferAdditionalFields<AuthInstance>()],
});

export type Session = typeof authClient.$Infer.Session;
