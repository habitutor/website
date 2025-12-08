import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/kelas/$id")({
	params: {
		parse: (rawParams) => {
			const id = Number(rawParams.id);
			return { id };
		},
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	const subtest = useQuery(
		orpc.subtest.find.queryOptions({
			input: {
				id: id,
			},
		}),
	);

	return (
		<>
			<h1 className="mb-6 font-bold text-2xl">{subtest.data?.name}</h1>

			<Tabs defaultValue="materi">
				<TabsList>
					<TabsTrigger value="materi">Materi</TabsTrigger>
					<TabsTrigger value="tips">Tips & Trik</TabsTrigger>
				</TabsList>
				<TabsContent value="materi">
          <div className="space-y-2">
						{subtest.isPending && <Skeleton className="h-10 w-full" />}

						{subtest.isError && (
							<p className="text-red-500">Error: {subtest.error.message}</p>
						)}

						{subtest.data && subtest.data.contents.filter((c) => c.type === "materi").length === 0 && (
							<p className="text-red-500">contents is yet to published</p>
						)}

						{subtest.data?.contents
							.filter((c) => c.type === "materi")
							.map((c) => (
								<Card key={c.id} className="p-6">
									<h3 className="mb-4 font-medium text-lg">{c.title}</h3>
								</Card>
							))}
					</div>
				</TabsContent>
				<TabsContent value="tips">
					<div className="space-y-2">
						{subtest.isPending && <Skeleton className="h-10 w-full" />}

						{subtest.isError && (
							<p className="text-red-500">Error: {subtest.error.message}</p>
						)}

						{subtest.data && subtest.data.contents.filter((c) => c.type === "tips_and_trick").length === 0 && (
							<p className="text-red-500">contents is yet to published</p>
						)}

						{subtest.data?.contents
							.filter((c) => c.type === "tips_and_trick")
							.map((c) => (
								<Card key={c.id} className="p-6">
									<h3 className="mb-4 font-medium text-lg">{c.title}</h3>
								</Card>
							))}
					</div>
				</TabsContent>
			</Tabs>
		</>
	);
}
