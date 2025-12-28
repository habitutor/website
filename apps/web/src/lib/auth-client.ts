import type { auth } from "@habitutor/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL =
  import.meta.env.VITE_SERVER_URL || // Vite Client replacement
  process.env.VITE_SERVER_URL || // Server Runtime fallback
  "http://localhost:3001"; // Local dev fallback (Safety net)

// 2. Debug log (Remove this after it works)
if (typeof window === "undefined") {
  console.log("Auth Client Server BaseURL:", baseURL);
}

export const authClient = createAuthClient({
  baseURL,
  plugins: [inferAdditionalFields<typeof auth>()],
});

export type Session = typeof authClient.$Infer.Session;
