import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
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
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { createMeta } from "@/lib/seo-utils";

export const Route = createFileRoute("/_authenticated/tryout/$tryoutId/")({
	head: () => ({
		meta: createMeta({
			title: "Detail Tryout",
			description: "Petunjuk pengerjaan dan daftar subtes tryout",
			noIndex: true,
		}),
	}),
	component: TryoutDetailPage,
});

function TryoutDetailPage() {
	const navigate = useNavigate();
	const { tryoutId } = Route.useParams();

	const subtesQuery = useQuery(
		orpc.tryout.listSubtes.queryOptions({ input: { tryoutId } }),
	);

	const startMutation = useMutation(
		orpc.tryout.start.mutationOptions({
			onSuccess: (data) => {
				toast.success("Tryout dimulai!");
				if (data.sesiSubtesId && data.sesiId) {
					navigate({
						to: "/tryout/test",
						search: {
							sesiSubtesId: data.sesiSubtesId,
							sesiId: data.sesiId,
							tryoutSessionId: undefined,
						},
					});
				}
			},
			onError: (err) => {
				toast.error("Gagal memulai tryout", {
					description: () => <p>{err.message}</p>,
				});
			},
		}),
	);

	const subtests = subtesQuery.data ?? [];

	return (
		<div className="flex w-full flex-col gap-6 pt-10">
			<Button
				variant="secondary"
				className="w-fit bg-[#3b5998] text-white hover:bg-[#3b5998]/90"
				onClick={() => navigate({ to: "/tryout" })}
			>
				<ArrowLeftIcon weight="bold" /> Kembali
			</Button>

			{/* Banner */}
			<div className="relative flex w-full flex-col justify-between overflow-hidden rounded-xl bg-[#fde047] p-8 sm:flex-row sm:items-center">
				<h1 className="mb-4 text-2xl font-bold text-gray-900 sm:mb-0 sm:text-3xl">
					Mulai Tryout Sekarang, Gratis!
				</h1>
				<div className="relative z-10">
					<div className="absolute -bottom-10 -left-10 -z-10 h-32 w-64 bg-[#f59e0b]" />
					<Button
						size="lg"
						className="bg-[#0284c7] font-semibold text-white hover:bg-[#0369a1]"
						onClick={() => startMutation.mutate({ tryoutId })}
						disabled={startMutation.isPending}
					>
						{startMutation.isPending ? "Memulai..." : "Mulai Sekarang"}{" "}
						<ArrowRightIcon weight="bold" />
					</Button>
				</div>
			</div>

			{/* Guideline */}
			<div className="flex flex-col gap-6 rounded-xl border bg-white p-6 shadow-sm md:p-8">
				<h2 className="text-xl text-primary-300">
					Petunjuk Pengerjaan Try Out
				</h2>

				<div className="space-y-4">
					<div>
						<p className="font-semibold text-yellow-600">
							Aturan Pengerjaan:
						</p>
						<ul className="ml-5 list-disc space-y-1">
							<li>Setiap subtes hanya 1x</li>
							<li>
								Waktu habis / klik Selesai , tidak bisa diulang
							</li>
							<li>
								Pembahasan terbuka setelah semua subtes selesai
							</li>
						</ul>
						<p className="mt-2 text-sm">
							⚠️ <span className="italic">Catatan:</span> timer{" "}
							<strong>tetap berjalan</strong>.
						</p>
					</div>

					<div>
						<p className="flex items-center gap-1 font-semibold text-primary-300">
							💡 Tips
						</p>
						<ul className="mt-1 ml-5 list-disc space-y-1">
							<li>Pastikan internet & baterai aman</li>
							<li>
								Tandai soal ragu untuk dikerjakan nanti
							</li>
							<li>
								Atur waktu, jangan terlalu lama di satu soal
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-2 border-t pt-6 text-sm">
					<p className="mb-3 font-semibold">
						Ingin akses pembahasan lebih lengkap?
					</p>
					<Button
						variant="outline"
						className="hover:bg-primary-50 w-fit border-primary-300 text-primary-300"
						asChild
					>
						<Link to="/premium">
							TryOut Premium{" "}
							<ArrowUpRightIcon weight="bold" />
						</Link>
					</Button>
				</div>
			</div>

			{/* List Subtes */}
			<div className="flex flex-col gap-4">
				<h2 className="text-xl font-bold text-gray-900">
					List Jenis Subtes
				</h2>
				<div className="overflow-hidden rounded-md border bg-white shadow-sm">
					<Table>
						<TableHeader className="bg-[#e0f2fe]">
							<TableRow>
								<TableHead className="w-16 font-semibold text-gray-700">
									No
								</TableHead>
								<TableHead className="font-semibold text-gray-700">
									Nama Subtes
								</TableHead>
								<TableHead className="font-semibold text-gray-700">
									Jumlah Soal
								</TableHead>
								<TableHead className="font-semibold text-gray-700">
									Durasi
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{subtesQuery.isPending
								? Array.from({ length: 5 }).map((_, i) => (
										<TableRow key={i}>
											<TableCell>
												<Skeleton className="h-4 w-8" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-40" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-12" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-16" />
											</TableCell>
										</TableRow>
									))
								: subtests.map((item, index) => (
										<TableRow key={item.id}>
											<TableCell className="font-medium text-gray-600">
												{index + 1}
											</TableCell>
											<TableCell className="text-gray-600">
												{item.namaSubtes}
											</TableCell>
											<TableCell className="text-gray-600">
												{item.jumlahSoal}
											</TableCell>
											<TableCell className="text-gray-600">
												{item.durasiMenit} Menit
											</TableCell>
										</TableRow>
									))}
							{!subtesQuery.isPending && subtests.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={4}
										className="py-8 text-center text-muted-foreground"
									>
										Belum ada subtes untuk tryout ini
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Bottom CTA */}
			<div className="mt-2">
				<p className="mb-4 text-lg font-medium">
					Siap? Yuk mulai tryoutnya! Semangat 💪🔥
				</p>
				<Button
					size="lg"
					className="w-full text-base font-semibold md:w-auto"
					onClick={() => startMutation.mutate({ tryoutId })}
					disabled={startMutation.isPending}
				>
					{startMutation.isPending ? "Memulai..." : "Mulai Tryout Sekarang"}{" "}
					<ArrowRightIcon weight="bold" />
				</Button>
			</div>
		</div>
	);
}
