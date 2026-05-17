import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PlusIcon, TrashIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { orpc, queryClient, client } from "@/utils/orpc";
import { BulkExplanationManager } from "./-components/explanation-editor";

export const Route = createFileRoute("/admin/tryout/$id")({
	component: TryoutDetailPage,
});

type TryoutType = { judul: string; deskripsi: string | null; status: string };
type SubtestType = { id: string; namaSubtes: string; jumlahSoal: number; durasiMenit: number; urutan: number };
type SoalType = { id: string; pertanyaan: string; tipe: string; poin: number; pilihanJawaban?: unknown[] };

function TryoutDetailPage() {
	const { id } = Route.useParams();

	const { data: tryout, isPending: isTryoutPending } = useQuery(
		orpc.admin.tryout.detail.tryout.queryOptions({
			input: { tryoutId: id },
		}),
	);

	const { data: subtests = [], isPending: isSubtestsPending } = useQuery(
		orpc.admin.tryout.list.subtes.queryOptions({
			input: { tryoutId: id },
		}),
	);

	const createSubtesMutation = useMutation(
		orpc.admin.tryout.create.subtes.mutationOptions({
			onSuccess: () => {
				toast.success("Subtest berhasil ditambahkan");
				queryClient.invalidateQueries({
					queryKey: orpc.admin.tryout.list.subtes.queryKey({ input: { tryoutId: id } }),
				});
			},
			onError: (err) => {
				toast.error("Gagal menambahkan subtest", {
					description: err.message,
				});
			},
		}),
	);

	// --- Publish / Unpublish ---
	const publishMutation = useMutation(
		orpc.admin.tryout.publish.mutationOptions({
			onSuccess: () => {
				toast.success("Tryout berhasil dipublish!");
				queryClient.invalidateQueries({
					queryKey: orpc.admin.tryout.detail.tryout.queryKey({ input: { tryoutId: id } }),
				});
			},
			onError: (err) => toast.error("Gagal publish", { description: err.message }),
		}),
	);

	const unpublishMutation = useMutation(
		orpc.admin.tryout.unpublish.mutationOptions({
			onSuccess: () => {
				toast.success("Tryout dikembalikan ke draft");
				queryClient.invalidateQueries({
					queryKey: orpc.admin.tryout.detail.tryout.queryKey({ input: { tryoutId: id } }),
				});
			},
			onError: (err) => toast.error("Gagal unpublish", { description: err.message }),
		}),
	);

	const handleAddSubtest = (name: string, jumlahSoal: number, durasiMenit: number) => {
		createSubtesMutation.mutate({
			tryoutId: id,
			namaSubtes: name,
			jumlahSoal,
			durasiMenit,
			urutan: subtests.length + 1,
		});
	};

	const displayTitle = isTryoutPending ? "Loading..." : (tryout as TryoutType)?.judul ?? "Tryout";
	const tryoutStatus = (tryout as TryoutType)?.status ?? "draft";
	const isPublished = tryoutStatus === "published";

	return (
		<AdminContainer>
			<div className="flex items-center justify-between">
				<AdminHeader title={displayTitle} description="Edit dan kelola tryout" />
				{/* Publish/Unpublish Button */}
				{!isTryoutPending && (
					<Button
						variant={isPublished ? "outline" : "default"}
						onClick={() => {
							if (isPublished) {
								unpublishMutation.mutate({ tryoutId: id });
							} else {
								publishMutation.mutate({ tryoutId: id });
							}
						}}
						disabled={publishMutation.isPending || unpublishMutation.isPending}
						className={isPublished ? "border-orange-300 text-orange-600 hover:bg-orange-50" : ""}
					>
						{isPublished ? (
							<>
								<EyeSlashIcon className="mr-2" /> Unpublish
							</>
						) : (
							<>
								<EyeIcon className="mr-2" /> Publish
							</>
						)}
					</Button>
				)}
			</div>

			<Tabs defaultValue="overview" className="w-full space-y-6">
				<TabsList>
					<TabsTrigger value="overview">Ringkasan</TabsTrigger>
					<TabsTrigger value="subtests">Subtest</TabsTrigger>
					<TabsTrigger value="explanations">Pembahasan</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Informasi Tryout</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{isTryoutPending ? (
								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<Skeleton className="mb-1 h-4 w-16" />
										<Skeleton className="h-6 w-48" />
									</div>
									<div>
										<Skeleton className="mb-1 h-4 w-16" />
										<Skeleton className="h-6 w-24" />
									</div>
								</div>
							) : (
								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<label className="text-sm font-medium text-muted-foreground">Judul</label>
										<p className="text-lg font-semibold">{(tryout as TryoutType)?.judul}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Status</label>
										<p className="text-lg font-semibold">
											<span
												className={
													isPublished
														? "rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
														: tryoutStatus === "archived"
															? "rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
															: "rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700"
												}
											>
												{isPublished
													? "Dipublikasikan"
													: tryoutStatus === "archived"
														? "Diarsipkan"
														: "Draft"}
											</span>
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
										<p className="text-lg font-semibold">{(tryout as TryoutType)?.deskripsi || "-"}</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Subtests Tab */}
				<TabsContent value="subtests" className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">Daftar Subtest</h3>
						<Dialog>
							<DialogTrigger asChild>
								<Button size="sm">
									<PlusIcon className="mr-2" />
									Tambah Subtest
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Tambah Subtest Baru</DialogTitle>
									<DialogDescription>Isi detail subtest untuk ditambahkan</DialogDescription>
								</DialogHeader>
								<AddSubtestForm onAdd={handleAddSubtest} isPending={createSubtesMutation.isPending} />
							</DialogContent>
						</Dialog>
					</div>

					{/* Subtest Cards with Soal Management */}
					{isSubtestsPending ? (
						<div className="space-y-4">
							{Array.from({ length: 2 }).map((_, i) => (
								<Card key={i}>
									<CardHeader>
										<Skeleton className="h-6 w-48" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-20 w-full" />
									</CardContent>
								</Card>
							))}
						</div>
					) : subtests.length === 0 ? (
						<Card>
							<CardContent className="py-8 text-center text-muted-foreground">
								Belum ada subtest. Tambahkan yang pertama!
							</CardContent>
						</Card>
					) : (
						<div className="space-y-4">
							{subtests.map((subtest: unknown) => (
								<SubtestCard key={(subtest as SubtestType).id} subtest={subtest} />
							))}
						</div>
					)}
				</TabsContent>

				{/* Explanations Tab */}
				<TabsContent value="explanations" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Kelola Pembahasan Soal</CardTitle>
							<CardDescription>
								Tambahkan pembahasan untuk setiap soal dalam tryout ini (hanya untuk member premium)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{subtests.map((subtest: unknown) => (
									<div key={(subtest as SubtestType).id} className="space-y-3">
										<h4 className="text-sm font-semibold">{(subtest as SubtestType).namaSubtes}</h4>
										<BulkExplanationManager
											subtestId={(subtest as SubtestType).id}
											questions={[]}
										/>
									</div>
								))}
								{subtests.length === 0 && (
									<p className="text-sm text-muted-foreground">
										Tambahkan subtest terlebih dahulu
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</AdminContainer>
	);
}

// --- Subtest Card with Soal Management ---
function SubtestCard({ subtest }: { subtest: unknown }) {
	const [showSoal, setShowSoal] = useState(false);
	const typedSubtest = subtest as SubtestType;

	const { data: soalList = [], isPending: isSoalPending } = useQuery({
		...orpc.admin.tryout.list.soal.queryOptions({ input: { subtesId: typedSubtest.id } }),
		enabled: showSoal,
	});

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-3">
				<div>
					<CardTitle className="text-base">{typedSubtest.namaSubtes}</CardTitle>
					<CardDescription>
						{typedSubtest.jumlahSoal} soal · {typedSubtest.durasiMenit} menit
					</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={() => setShowSoal(!showSoal)}>
						{showSoal ? "Sembunyikan Soal" : "Kelola Soal"}
					</Button>
					<Button variant="ghost" size="sm" className="text-red-600">
						<TrashIcon />
					</Button>
				</div>
			</CardHeader>

			{showSoal && (
				<CardContent className="border-t pt-4">
					<div className="mb-4 flex items-center justify-between">
						<h4 className="text-sm font-semibold">Daftar Soal ({(soalList as SoalType[]).length})</h4>
						<AddSoalDialog subtesId={typedSubtest.id} />
					</div>

					{isSoalPending ? (
						<div className="space-y-2">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-12 w-full" />
							))}
						</div>
					) : (soalList as SoalType[]).length === 0 ? (
						<p className="py-4 text-center text-sm text-muted-foreground">
							Belum ada soal. Tambahkan yang pertama!
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">#</TableHead>
									<TableHead>Pertanyaan</TableHead>
									<TableHead className="w-20">Tipe</TableHead>
									<TableHead className="w-16">Poin</TableHead>
									<TableHead className="w-24 text-right">Pilihan</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{(soalList as SoalType[]).map((soal: SoalType, idx: number) => (
									<TableRow key={soal.id}>
										<TableCell className="font-medium">{idx + 1}</TableCell>
										<TableCell className="max-w-xs truncate">{soal.pertanyaan}</TableCell>
										<TableCell>
											<span className="rounded bg-gray-100 px-2 py-0.5 text-xs">
												{soal.tipe}
											</span>
										</TableCell>
										<TableCell>{soal.poin}</TableCell>
										<TableCell className="text-right">
											{soal.pilihanJawaban?.length ?? 0} opsi
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			)}
		</Card>
	);
}

// --- Add Soal Dialog ---
function AddSoalDialog({ subtesId }: { subtesId: string }) {
	const [open, setOpen] = useState(false);
	const [pertanyaan, setPertanyaan] = useState("");
	const [poin, setPoin] = useState(20);
	const [options, setOptions] = useState([
		{ label: "A", isi: "", isBenar: false },
		{ label: "B", isi: "", isBenar: false },
		{ label: "C", isi: "", isBenar: false },
		{ label: "D", isi: "", isBenar: false },
		{ label: "E", isi: "", isBenar: false },
	]);

	const createSoalMutation = useMutation(
		orpc.admin.tryout.create.soal.mutationOptions({
			onSuccess: async (data: unknown) => {
				// Now create all pilihan jawaban
				const soalId = (data as { id: string }).id;
				const validOptions = options.filter((opt) => opt.isi.trim());

				try {
					for (const opt of validOptions) {
						await client.admin.tryout.create.pilihan({
							soalId,
							label: opt.label,
							isi: opt.isi,
							isBenar: opt.isBenar,
						});
					}
					toast.success("Soal dan pilihan jawaban berhasil ditambahkan");
					queryClient.invalidateQueries({
						queryKey: orpc.admin.tryout.list.soal.queryKey({ input: { subtesId } }),
					});
					// Reset form
					setPertanyaan("");
					setPoin(20);
					setOptions([
						{ label: "A", isi: "", isBenar: false },
						{ label: "B", isi: "", isBenar: false },
						{ label: "C", isi: "", isBenar: false },
						{ label: "D", isi: "", isBenar: false },
						{ label: "E", isi: "", isBenar: false },
					]);
					setOpen(false);
				} catch (err: unknown) {
					toast.error("Soal dibuat tapi gagal menambah pilihan", {
						description: err instanceof Error ? err.message : String(err),
					});
				}
			},
			onError: (err) => {
				toast.error("Gagal membuat soal", { description: err.message });
			},
		}),
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!pertanyaan.trim()) {
			toast.error("Pertanyaan harus diisi");
			return;
		}

		const hasCorrectAnswer = options.some((opt) => opt.isBenar && opt.isi.trim());
		if (!hasCorrectAnswer) {
			toast.error("Pilih minimal satu jawaban yang benar");
			return;
		}

		createSoalMutation.mutate({
			subtesId,
			pertanyaan,
			tipe: "pilgan",
			poin,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<PlusIcon className="mr-1" /> Tambah Soal
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Tambah Soal Baru</DialogTitle>
					<DialogDescription>
						Isi pertanyaan dan pilihan jawaban. Tandai jawaban yang benar.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Pertanyaan */}
					<div className="space-y-2">
						<Label>Pertanyaan</Label>
						<Textarea
							placeholder="Tuliskan pertanyaan..."
							value={pertanyaan}
							onChange={(e) => setPertanyaan(e.target.value)}
							rows={3}
							required
						/>
					</div>

					{/* Poin */}
					<div className="space-y-2">
						<Label>Poin</Label>
						<Input
							type="number"
							min={1}
							value={poin}
							onChange={(e) => setPoin(Number(e.target.value))}
							className="w-32"
						/>
					</div>

					{/* Pilihan Jawaban */}
					<div className="space-y-3">
						<Label>Pilihan Jawaban</Label>
						{options.map((opt, idx) => (
							<div key={opt.label} className="flex items-start gap-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100 font-bold text-gray-700">
									{opt.label}
								</div>
								<Input
									placeholder={`Isi pilihan ${opt.label}...`}
									value={opt.isi}
									onChange={(e) => {
										const newOpts = [...options];
										newOpts[idx].isi = e.target.value;
										setOptions(newOpts);
									}}
									className="flex-1"
								/>
								<Button
									type="button"
									variant={opt.isBenar ? "default" : "outline"}
									size="sm"
									className={opt.isBenar ? "bg-green-600 hover:bg-green-700" : ""}
									onClick={() => {
										const newOpts = options.map((o, i) => ({
											...o,
											isBenar: i === idx,
										}));
										setOptions(newOpts);
									}}
								>
									{opt.isBenar ? "✓ Benar" : "Benar?"}
								</Button>
							</div>
						))}
					</div>

					<Button type="submit" className="w-full" disabled={createSoalMutation.isPending}>
						{createSoalMutation.isPending ? "Menyimpan..." : "Simpan Soal"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}

// --- Add Subtest Form ---
function AddSubtestForm({
	onAdd,
	isPending,
}: { onAdd: (name: string, jumlahSoal: number, durasiMenit: number) => void; isPending: boolean }) {
	const [name, setName] = useState("");
	const [jumlahSoal, setJumlahSoal] = useState(10);
	const [durasiMenit, setDurasiMenit] = useState(15);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (name.trim()) {
			onAdd(name, jumlahSoal, durasiMenit);
			setName("");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label>Nama Subtest</Label>
				<Input
					placeholder="Penalaran Matematika"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label>Jumlah Soal</Label>
					<Input
						type="number"
						min={1}
						value={jumlahSoal}
						onChange={(e) => setJumlahSoal(Number(e.target.value))}
						required
					/>
				</div>
				<div className="space-y-2">
					<Label>Durasi (Menit)</Label>
					<Input
						type="number"
						min={1}
						value={durasiMenit}
						onChange={(e) => setDurasiMenit(Number(e.target.value))}
						required
					/>
				</div>
			</div>
			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? "Menambahkan..." : "Tambah"}
			</Button>
		</form>
	);
}
