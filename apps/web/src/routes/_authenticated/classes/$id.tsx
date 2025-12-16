import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/classes/$id")({
	params: {
		parse: (rawParams) => {
			const id = Number(rawParams.id);
			return { id };
		},
	},
	component: RouteComponent,
});

// Content Card Component - Clickable card that links to detail page
interface ContentCardProps {
	content: {
		id: number;
		title: string;
		type: string;
		subtestId: number;
	};
}

function ContentCard({ content }: ContentCardProps) {
	return (
		<Link
			to="/classes/content/$contentId"
			params={{ contentId: content.id }}
			search={{ subtestId: String(content.subtestId) }}
			className="block"
		>
			<Card className="cursor-pointer p-6 transition-colors hover:bg-muted/50">
				<h3 className="font-medium text-lg">{content.title}</h3>
			</Card>
		</Link>
	);
}

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
					<div className="space-y-4">
						{subtest.isPending && <Skeleton className="h-40 w-full" />}

						{subtest.isError && (
							<p className="text-red-500">Error: {subtest.error.message}</p>
						)}

						{subtest.data &&
							subtest.data.contents.filter((c) => c.type === "materi")
								.length === 0 && (
								<p className="text-muted-foreground">
									Belum ada materi yang dipublikasikan
								</p>
							)}

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{subtest.data?.contents
								.filter((c) => c.type === "materi")
								.map((c) => (
									<ContentCard
										key={c.id}
										content={{
											id: c.id,
											title: c.title,
											type: c.type,
											subtestId: id,
										}}
									/>
								))}
						</div>
					</div>
				</TabsContent>
				<TabsContent value="tips">
					<div className="space-y-4">
						{subtest.isPending && <Skeleton className="h-40 w-full" />}

						{subtest.isError && (
							<p className="text-red-500">Error: {subtest.error.message}</p>
						)}

						{subtest.data &&
							subtest.data.contents.filter((c) => c.type === "tips_and_trick")
								.length === 0 && (
								<p className="text-muted-foreground">
									Belum ada tips & trik yang dipublikasikan
								</p>
							)}

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{subtest.data?.contents
								.filter((c) => c.type === "tips_and_trick")
								.map((c) => (
									<ContentCard
										key={c.id}
										content={{
											id: c.id,
											title: c.title,
											type: c.type,
											subtestId: id,
										}}
									/>
								))}
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</>
	);
}
