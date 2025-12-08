import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/kelas/")({
	component: RouteComponent,
});

function RouteComponent() {
	const subtests = useQuery(orpc.subtest.list.queryOptions());

	return (
		<Container className="pt-20">
			<h1 className="mb-6 font-bold text-2xl">mau belajar subtest apa hari ini?</h1>

			<div className="space-y-4">
				{subtests.isPending && (
					<p className="animate-pulse">Subtest Loading...</p>
				)}

				{subtests.isError && (
					<p className="text-red-500">Error: {subtests.error.message}</p>
				)}

				{subtests.data && subtests.data.length === 0 && (
					<p className="text-muted-foreground">No subtests yet</p>
				)}

				<div className="grid grid-cols-3 gap-2">
					{subtests.data?.map((subtest) => (
						<SubtestCard
							key={subtest.id}
							name={subtest.name}
							subtestId={subtest.id}
						/>
					))}
				</div>
			</div>
		</Container>
	);
}

const SubtestCard = (props: { name: string; subtestId: number }) => {
	return (
		<Card className="p-4">
			<div className="flex flex-col justify-between gap-4">
				<h3 className="font-medium text-lg">{props.name}</h3>
        <Link to="/kelas/$id" params={{ id: props.subtestId }}>
          <Button variant="outline">Cobain</Button>
        </Link>
			</div>
		</Card>
	);
};
