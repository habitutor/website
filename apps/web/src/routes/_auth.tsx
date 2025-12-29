import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getUser } from "@/lib/get-user";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async () => {
		const session = await getUser();

		return { session };
	},
	loader: ({ context }) => {
		if (context.session)
			throw redirect({
				to: "/dashboard",
			});

		console.log("Before Load: ", context.session);
	},
	component: AuthLayout,
});

function AuthLayout() {
	return <Outlet />;
}
