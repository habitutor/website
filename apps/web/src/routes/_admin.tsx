import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { HeaderDashboard } from "@/components/header-dashboard";
import { Container } from "@/components/ui/container";
import { getUser } from "@/lib/get-user";

export const Route = createFileRoute("/_admin")({
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
		// Check if user is admin
		if (context.session.user.role !== "admin") {
			throw redirect({
				to: "/dashboard",
			});
		}
	},
});

function AdminLayout() {
	const context = Route.useRouteContext();

	return (
		<>
			<HeaderDashboard session={context.session} />
			<Container className="flex flex-col pt-28">
				<Outlet />
			</Container>
		</>
	);
}
