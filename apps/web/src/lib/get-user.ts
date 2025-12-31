import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { authClient } from "./auth-client";

export const getUser = createServerFn().handler(async () => {
	const headers = getRequestHeaders();
	const headersToForward = {
		cookie: headers.get("cookie") || "",
		"user-agent": headers.get("user-agent"),
	};
	console.log("Original headers:", Object.fromEntries(headers.entries()));
	console.log("Cookie:", headers.get("cookie"));
	console.log("Forwarding headers:", headersToForward);

	const response = await authClient.getSession({
		fetchOptions: {
			headers: headersToForward,
		},
	});

	console.log("Session response", response);
	return response.data;
});

export async function isAuthenticated() {
	const user = await authClient.getSession();

	if (user) return true;

	return false;
}
