import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute(
	"/_authenticated/dashboard/flashcard/result",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { data, isPending } = useQuery(
		orpc.flashcard.result.queryOptions(),
	);

	return (
		<section className="flex flex-col gap-4 border bg-white p-4">
			<Button className="w-fit" asChild>
				<Link to="/dashboard">
					<ArrowLeftIcon /> Kembali
				</Link>
			</Button>

			<div className="relative flex items-end overflow-clip bg-green-700 p-4">
				<div className="-translate-y-1/2 -right-30 pointer-events-none absolute top-1/2 z-0 size-60 rounded-full bg-green-500" />
				<h1 className="relative z-10 my-auto font-normal text-white text-xl">
					Flashcard
				</h1>
			</div>

			<div className="flex gap-2 [&>div]:min-w-46">
				<div className="flex flex-col gap-2 rounded-md border p-4">
					<p>Hasil</p>

					<p>
						{isPending ? (
							<Skeleton className="h-10 w-16" />
						) : (
							<>
								<span className="mr-1 font-bold text-4xl text-primary">
									{(((data?.correctAnswersCount as number) /
										data?.questionsCount) as number) * 100}
								</span>
								/100
							</>
						)}
					</p>
				</div>

				<div className="flex flex-col gap-2 rounded-md border p-4">
					<p>Benar</p>

					<p>
						{isPending ? (
							<Skeleton className="h-10 w-16" />
						) : (
							<>
								<span className="mr-1 font-bold text-4xl text-primary">
									{data?.correctAnswersCount}
								</span>
								/{data?.questionsCount}
							</>
						)}
					</p>
				</div>
			</div>
		</section>
	);
}
