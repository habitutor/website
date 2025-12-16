import { CaretRightIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BodyOutputs } from "@/utils/orpc";
import { buttonVariants } from "./ui/button";

export function SubtestHeader() {
	const location = useLocation();
	const isAdminLocation = location.pathname.startsWith("/admin");
	const title = isAdminLocation ? "Subtest-Subtest UTBK" : "Kelas-Kelas UTBK";
	const description = isAdminLocation ? "Pilih subtest-subtest UTBK yang ingin kamu pelajari" :  "Pilih kelas-kelas UTBK yang ingin kamu pelajari";

	return (
		<div className="flex min-h-40 flex-col items-center justify-center bg-amber-300">
			<h1 className="font-bold text-2xl">{title}</h1>
			<p className="text-gray-500 text-sm">{description}</p>
		</div>
	);
}

type SubtestListItem = NonNullable<BodyOutputs["subtest"]["listSubtests"]>[number];

export function SubtestCard({ subtest }: { subtest: SubtestListItem }) {
	const location = useLocation();
	const isAdminLocation = location.pathname.startsWith("/admin");

	return (
		<Card className="p-4 transition-colors">
			<div className="flex h-full justify-between">
				<div className="flex-1">
					<h3 className="font-medium">{subtest?.name}</h3>
				</div>
				<Link
					to={isAdminLocation ? "/admin/classes/$shortName" : "/classes/$shortName"}
					params={{ shortName: subtest?.shortName?.toLowerCase() }}
					className={cn(buttonVariants({ variant: "outline", size: "icon" }), "mt-auto mb-0 hover:bg-muted/50")}
				>
					{isAdminLocation ? <PencilSimpleIcon size={18} /> : <CaretRightIcon size={18} />}
				</Link>
			</div>
		</Card>
	);
}

export function ClassHeader( { subtest }: { subtest: SubtestListItem } ) {
  return (
		<div className="flex min-h-40 flex-col items-center justify-center bg-amber-300">
			<h1 className="font-bold text-2xl">{subtest?.name}</h1>
			<p className="text-gray-500 text-sm">{subtest?.description}</p>
		</div>
	);
}

type ContentListItem = NonNullable<BodyOutputs["subtest"]["listContentByCategory"]>[number];

function ContentCard({ item }: { item: ContentListItem }) {
	const location = useLocation();
	const isAdminLocation = location.pathname.startsWith("/admin");

	return (
		<Link
			to={isAdminLocation ? "/admin/classes/$shortName/$contentId" : "/classes/$shortName/$contentId"}
			params={{ 
				shortName: location.pathname.split("/")[isAdminLocation ? 3 : 2],
				contentId: item.id.toString(),
			}}
		>
			<Card className="p-3 transition-colors hover:bg-muted/50">
				<div className="flex items-start justify-between gap-2">
					<div>
						<p className="font-medium">{item.title}</p>
						<div className="mt-1 flex flex-wrap gap-2 text-muted-foreground text-xs">
							{item.hasVideo && <span className="rounded bg-muted px-2 py-0.5">Video</span>}
							{item.hasNote && <span className="rounded bg-muted px-2 py-0.5">Catatan</span>}
							{item.hasQuiz && <span className="rounded bg-muted px-2 py-0.5">Quiz</span>}
						</div>
					</div>

					<div className="text-right text-muted-foreground text-xs">
						{item.lastViewedAt ? "Sudah dibuka" : "Belum dibuka"}
					</div>
				</div>
			</Card>
		</Link>
	);
}

export function ContentList({
	title,
	items,
	isLoading,
	error,
}: {
	title: string;
	items?: ContentListItem[];
	isLoading?: boolean;
	error?: string;
}) {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-lg">{title}</h2>
				{isLoading && <p className="text-muted-foreground text-xs">Memuat...</p>}
			</div>

			{error && <p className="text-red-500 text-sm">{error}</p>}

			{!isLoading && !error && (!items || items.length === 0) && (
				<p className="text-muted-foreground text-sm">Belum ada konten.</p>
			)}

			<div className="space-y-2">
				{items?.map((item) => (
					<ContentCard key={item.id} item={item} />
				))}
			</div>
		</div>
	);
}
