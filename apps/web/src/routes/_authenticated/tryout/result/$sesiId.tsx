import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, ClockIcon, ListNumbersIcon } from "@phosphor-icons/react";
import { Image } from "@unpic/react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { createMeta } from "@/lib/seo-utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/tryout/result/$sesiId")({
	head: () => ({
		meta: createMeta({
			title: "Hasil Tryout",
			description: "Lihat hasil dan pembahasan tryoutmu",
			noIndex: true,
		}),
	}),
	component: TryoutResultPage,
});

function TryoutResultPage() {
	const { sesiId } = Route.useParams();

	const { data: result, isPending } = useQuery(
		orpc.tryout.results.queryOptions({ input: { sesiId } }),
	);

	if (isPending) {
		return (
			<div className="flex w-full flex-col gap-6 pt-10">
				<Skeleton className="h-40 w-full rounded-xl" />
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<Skeleton className="h-32 w-full rounded-xl" />
					<Skeleton className="h-32 w-full rounded-xl" />
					<Skeleton className="h-32 w-full rounded-xl" />
				</div>
				<Skeleton className="h-64 w-full rounded-xl" />
			</div>
		);
	}

	if (!result) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<h3 className="text-xl font-bold text-gray-800">Hasil tidak ditemukan</h3>
				<Button asChild className="mt-4">
					<Link to="/tryout">Kembali ke Daftar Tryout</Link>
				</Button>
			</div>
		);
	}

	// Calculate overall duration from sum of subtest durations
	const totalDurasi = result.skorPerSubtes.reduce((sum, s) => sum + s.durasiMenit, 0);

	return (
		<div className="flex w-full flex-col gap-6 pt-10">
			{/* Banner */}
			<div className="relative flex w-full flex-row overflow-hidden rounded-xl bg-orange-200">
				<div className="relative h-32 w-32 shrink-0 bg-yellow-400/20 sm:h-40 sm:w-48">
					<Image
						src="/avatar/tutorial-avatar.webp"
						alt="TryOut Mascot"
						layout="constrained"
						width={300}
						height={400}
						className="absolute -bottom-4 -left-4 h-[120%] w-auto object-contain sm:bottom-0 sm:left-0"
					/>
				</div>
				<div className="flex flex-1 flex-col justify-center gap-1 p-4 sm:p-6 lg:p-8">
					<h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
						{result.judulTryout || "Hasil Tryout"}
					</h1>
					<p className="text-sm font-medium sm:text-base">
						Yuk belajar bersama untuk sukses dalam UTBK!
					</p>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<Button variant="outline" size="sm" asChild>
					<Link to="/tryout">
						<ArrowLeftIcon className="mr-2" /> Kembali
					</Link>
				</Button>
				<h2 className="text-xl font-bold text-gray-900">Berikut Hasil Tryoutmu!</h2>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="flex flex-col justify-between gap-4 rounded-xl bg-blue-400 p-6 text-white shadow-sm">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold text-blue-50">Total Durasi</h3>
						<ClockIcon size={24} className="text-blue-200" />
					</div>
					<div className="flex items-baseline gap-1">
						<span className="text-4xl font-bold">{totalDurasi}</span>
						<span className="text-sm font-medium text-blue-100">/ menit</span>
					</div>
				</div>

				<div className="flex flex-col justify-between gap-4 rounded-xl bg-green-500 p-6 text-white shadow-sm">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold text-green-50">Total Score</h3>
						<CheckCircleIcon size={24} className="text-green-200" />
					</div>
					<div className="flex items-baseline gap-1">
						<span className="text-4xl font-bold">{result.totalSkor}</span>
					</div>
				</div>

				<div className="flex flex-col justify-between gap-4 rounded-xl bg-yellow-400 p-6 text-white shadow-sm">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold text-yellow-50">Total Subtes</h3>
						<ListNumbersIcon size={24} className="text-yellow-200" />
					</div>
					<div className="flex items-baseline gap-1">
						<span className="text-4xl font-bold">{result.skorPerSubtes.length}</span>
						<span className="text-sm font-medium text-yellow-50">/ {result.skorPerSubtes.length} subtes</span>
					</div>
				</div>
			</div>

			{/* Detailed Table */}
			<div className="mt-4 flex flex-col gap-4 pb-12">
				<h3 className="text-lg font-bold text-gray-900">Lihat Lebih Detail</h3>
				<div className="overflow-hidden rounded-xl border bg-white shadow-sm">
					<Table>
						<TableHeader className="bg-blue-50">
							<TableRow>
								<TableHead className="w-16 font-semibold text-gray-600">No</TableHead>
								<TableHead className="font-semibold text-gray-600">Nama Subtes</TableHead>
								<TableHead className="font-semibold text-gray-600">Score</TableHead>
								<TableHead className="font-semibold text-gray-600">Durasi</TableHead>
								<TableHead className="w-16"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{result.skorPerSubtes.map((subtes, idx) => (
								<TableRow key={subtes.subtesId}>
									<TableCell className="font-medium text-gray-500">{idx + 1}</TableCell>
									<TableCell className="font-medium text-gray-900">{subtes.namaSubtes}</TableCell>
									<TableCell>
										<span className="font-semibold text-gray-700">{subtes.skor}</span>
									</TableCell>
									<TableCell className="text-gray-600">{subtes.durasiMenit} Menit</TableCell>
									<TableCell>
										<Button 
											size="sm" 
											className="h-8 w-8 rounded-full bg-primary-300 p-0 text-white hover:bg-primary-400"
											asChild
										>
											<Link to="/premium">
												<ArrowRightIcon size={16} weight="bold" />
											</Link>
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}
