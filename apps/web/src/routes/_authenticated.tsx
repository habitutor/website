import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
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

	return (
		<>
			<HeaderDashboard session={context.session} />
			<Container className="flex flex-col gap-6 pt-28">
				<Outlet />
			</Container>
		</>
	);
}
