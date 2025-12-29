import { EmptyIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LastContentViewedCard } from "@/components/classes";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { orpc } from "@/utils/orpc";

export const LastClasses = () => {
	const { data, isPending } = useQuery(orpc.subtest.getRecentViews.queryOptions());

	if (isPending) {
		return (
			<section>
				<h2 className="mb-2 font-medium">Kelas terakhirmu</h2>
				<div className="animate-pulse space-y-2">
					<div className="h-32 rounded-md bg-neutral-200" />
					<div className="h-32 rounded-md bg-neutral-200" />
				</div>
			</section>
		);
	}

	if (!data || data.length === 0) {
		return (
			<section>
				<h2 className="font-medium">Kelas terakhirmu</h2>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<EmptyIcon />
						</EmptyMedia>
						<EmptyTitle>Belum ada riwayat</EmptyTitle>
						<EmptyDescription>
							Kamu belum membuka kelas. Buka kelas untuk memulai perjuangan masuk PTN-mu!
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<div className="flex gap-2">
							<Button variant="outline" asChild>
								<Link to="/classes">Lihat kelas</Link>
							</Button>
						</div>
					</EmptyContent>
				</Empty>
			</section>
		);
	}

	return (
		<section>
			<h2 className="mb-2 font-medium">Kelas terakhirmu</h2>
			<div className="space-y-2">
				{data.map((view, idx) => (
					<LastContentViewedCard
						key={view.contentId}
						item={{
							id: view.contentId,
							title: view.contentTitle,
							hasVideo: Boolean(view.hasVideo),
							hasNote: Boolean(view.hasNote),
							hasPracticeQuestions: Boolean(view.hasPracticeQuestions),
						}}
						index={idx}
						shortName={view.subtestShortName}
					/>
				))}
			</div>
		</section>
	);
};
