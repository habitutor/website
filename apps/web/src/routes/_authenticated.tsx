import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
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
	return (
		<Container className="pt-20">
			<Outlet />
		</Container>
	);
}
