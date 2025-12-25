import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getUser } from "@/lib/get-user";

export const Route = createFileRoute("/_authenticated/admin")({
	component: AdminLayout,
	beforeLoad: async () => {
		const session = await getUser();

		return { session };
	},
	loader: ({ context }) => {
		if (!context.session) {
			throw redirect({
				to: "/login",
			});
		}

		const role = (context.session as { user?: { role?: string } } | null)?.user?.role;

		if (role !== "admin") {
			throw redirect({
				to: "/dashboard",
			});
		}
	},
});

function AdminLayout() {
	return <Outlet />;
}
