import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { HeaderDashboard } from "@/components/header-dashboard";
import { Container } from "@/components/ui/container";
import { getUser } from "@/lib/get-user";

export const Route = createFileRoute("/_authenticated")({
	component: AuthedLayout,
	beforeLoad: async () => {
		const session = await getUser();

		return { session };
	},
	loader: ({ context }) => {
		if (!context.session)
			throw redirect({
				to: "/login",
			});
	},
});

function AuthedLayout() {
	const context = Route.useRouteContext();
	const location = useLocation();

	return (
		<>
			<HeaderDashboard session={context.session} />

			{/^\/classes\/[^/]+\/[^/]+\/(video|notes|quiz)/.test(location.pathname) ? (
				<Container className="flex flex-col gap-6 py-0">
					<Outlet />
				</Container>
			) : (
				<Container className="flex flex-col gap-6 pt-28">
					<Outlet />
				</Container>
			)}
		</>
	);
}
