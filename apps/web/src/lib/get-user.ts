import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { authClient } from "./auth-client";

export const getUser = createServerFn().handler(async () => {
	const { data } = await authClient.getSession({
		fetchOptions: {
			headers: getRequestHeaders(),
		},
	});

	return data;
});

export async function isAuthenticated() {
	const user = await authClient.getSession();

	if (user) return true;

	return false;
}
