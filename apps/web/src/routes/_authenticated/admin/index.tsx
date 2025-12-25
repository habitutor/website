import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<div>Hello "/_authenticated/admin/"!</div>
			<Link to="/admin/classes">Kelas</Link>
		</>
	);
}
