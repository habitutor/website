import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { $getSession } from "@/lib/get-user";

export const Route = createFileRoute("/_admin")({
	beforeLoad: async ({ context }) => {
		const { session } = await $getSession(context.queryClient);

		return { session };
	},
	loader: ({ location, context }) => {
		if (!context.session)
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		if (context.session.user.role !== "admin")
			throw redirect({
				to: "/dashboard",
				search: {
					redirect: location.href,
				},
			});
	},
	component: AdminLayout,
});

function AdminLayout() {
	return <Outlet />;
}
