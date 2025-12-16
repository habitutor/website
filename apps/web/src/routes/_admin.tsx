import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getUser } from "@/lib/get-user";

export const Route = createFileRoute("/_admin")({
	beforeLoad: async () => {
		const session = await getUser();

		return { session };
	},
	loader: ({ context }) => {
		if (!context.session) {
			throw redirect({ to: "/login" });
		}

		const user = context.session.user as { role?: string };
		if (user.role !== "admin") {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: AdminLayout,
});

function AdminLayout() {
	return <Outlet />;
}
