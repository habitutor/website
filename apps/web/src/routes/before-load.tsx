import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/before-load")({
	component: RouteComponent,
	beforeLoad: async () => {
		return { message: "hello from beforeLoad" };
	},
});

function RouteComponent() {
	const { message } = Route.useRouteContext();

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-2 pt-20">
			<h1 className="font-bold text-lg">Server Before Load</h1>
			<div className="flex flex-col gap-2 rounded-md border bg-background p-4">
				<h2 className="font-bold">Message</h2>
				{message}
			</div>
		</div>
	);
}
