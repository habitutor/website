import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
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
  const routerState = useRouterState();
  const stablePathnameRef = useRef(location.pathname);

  // Only update pathname when route is fully loaded (not pending) to prevent layout shifting yg too soon
  const isPending = routerState.isLoading || routerState.isTransitioning;

  useEffect(() => {
    if (!isPending) {
      stablePathnameRef.current = location.pathname;
    }
  }, [location.pathname, isPending]);

  const pathname = isPending ? stablePathnameRef.current : location.pathname;

	return (
		<>
			<HeaderDashboard session={context.session} />

      {/^\/classes\/[^/]+\/[^/]+\/(video|notes|latihan-soal)/.test(pathname) ? (
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
