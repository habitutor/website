import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/admin/classes")({
	component: RouteComponent,
});

function RouteComponent() {
	const queryClient = useQueryClient();

	const subtests = useQuery(orpc.subtest.listSubtests.queryOptions());

	const [name, setName] = useState("");
	const [shortName, setShortName] = useState("");
	const [description, setDescription] = useState("");

	const [editedOrders, setEditedOrders] = useState<Record<number, number>>({});

	const createMutation = useMutation(
		orpc.admin.subtest.createSubtest.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				setName("");
				setShortName("");
				setDescription("");
				queryClient.invalidateQueries({
					queryKey: orpc.subtest.listSubtests.key(),
				});
			},
			onError: (error) => {
				toast.error("Gagal membuat kelas", {
					description: String(error),
				});
			},
		}),
	);

	const deleteMutation = useMutation(
		orpc.admin.subtest.deleteSubtest.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries({
					queryKey: orpc.subtest.listSubtests.key(),
				});
			},
			onError: (error) => {
				toast.error("Gagal menghapus kelas", {
					description: String(error),
				});
			},
		}),
	);

	const reorderMutation = useMutation(
		orpc.admin.subtest.reorderSubtests.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				setEditedOrders({});
				queryClient.invalidateQueries({
					queryKey: orpc.subtest.listSubtests.key(),
				});
			},
			onError: (error) => {
				toast.error("Gagal menyimpan urutan", {
					description: String(error),
				});
			},
		}),
	);

	const canCreate = useMemo(
		() => name.trim().length > 0 && shortName.trim().length > 0,
		[name, shortName],
	);

	const handleCreate = () => {
		if (!canCreate) return;

		const current = subtests.data ?? [];
		const maxOrder =
			current.length > 0
				? Math.max(...current.map((s: any) => s.order ?? 0))
				: 0;

		createMutation.mutate({
			name: name.trim(),
			shortName: shortName.trim(),
			description: description.trim() || undefined,
			order: maxOrder + 1,
		});
	};

	const handleOrderChange = (id: number, value: string) => {
		const parsed = Number(value);
		if (Number.isNaN(parsed)) return;
		setEditedOrders((prev) => ({ ...prev, [id]: parsed }));
	};

	const handleSaveOrder = () => {
		if (!subtests.data) return;

		const items = (subtests.data as any[]).map((item) => ({
			id: item.id,
			order: editedOrders[item.id] ?? item.order,
		}));

		reorderMutation.mutate({ items });
	};

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h1 className="font-bold text-2xl">Manajemen Kelas (/classes)</h1>
				<p className="text-muted-foreground text-sm">
					Kelas di sini adalah daftar subtest yang tampil di halaman{" "}
					<span className="font-mono text-xs">/classes</span>.
				</p>
			</div>

			<Card className="space-y-4 p-4">
				<h2 className="font-semibold text-lg">Tambah Kelas Baru</h2>

				<div className="grid gap-3 md:grid-cols-3">
					<div className="space-y-1">
						<label className="font-medium text-sm">Nama</label>
						<Input
							placeholder="Contoh: Tes Logika"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>

					<div className="space-y-1">
						<label className="font-medium text-sm">Short Name</label>
						<Input
							placeholder="Contoh: LOG"
							value={shortName}
							onChange={(e) => setShortName(e.target.value)}
						/>
					</div>

					<div className="space-y-1 md:col-span-3">
						<label className="font-medium text-sm">Deskripsi (opsional)</label>
						<Input
							placeholder="Deskripsi singkat kelas"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
				</div>

				<Button
					type="button"
					onClick={handleCreate}
					disabled={!canCreate || createMutation.isPending}
				>
					{createMutation.isPending ? "Menyimpan..." : "Tambah Kelas"}
				</Button>
			</Card>

			<Card className="space-y-4 p-4">
				<div className="flex items-center justify-between gap-2">
					<h2 className="font-semibold text-lg">Daftar Kelas</h2>
					<Button
						type="button"
						variant="secondary"
						onClick={handleSaveOrder}
						disabled={
							Object.keys(editedOrders).length === 0 ||
							reorderMutation.isPending
						}
					>
						{reorderMutation.isPending ? "Menyimpan..." : "Simpan Urutan"}
					</Button>
				</div>

				{subtests.isPending && (
					<p className="animate-pulse text-sm">Memuat daftar kelas...</p>
				)}

				{subtests.isError && (
					<p className="text-red-500 text-sm">
						Error: {(subtests.error as Error).message}
					</p>
				)}

				{subtests.data && (subtests.data as any[]).length === 0 && (
					<p className="text-muted-foreground text-sm">
						Belum ada kelas. Tambahkan kelas baru di atas.
					</p>
				)}

				{subtests.data && (subtests.data as any[]).length > 0 && (
					<div className="space-y-2">
						<div className="grid grid-cols-[70px,1fr,auto] gap-2 rounded-md bg-muted px-3 py-2 font-medium text-xs">
							<span>Urutan</span>
							<span>Nama</span>
							<span className="text-right">Aksi</span>
						</div>

						{(subtests.data as any[]).map((item) => (
							<div
								key={item.id}
								className="grid grid-cols-[70px,1fr,auto] items-center gap-2 rounded-md border px-3 py-2 text-sm"
							>
								<Input
									type="number"
									className="h-8"
									defaultValue={item.order}
									onChange={(e) => handleOrderChange(item.id, e.target.value)}
								/>
								<div className="flex flex-col">
									<span className="font-medium">{item.name}</span>
									<span className="text-muted-foreground text-xs">
										{item.shortName} · ID: {item.id}
									</span>
								</div>
								<div className="flex justify-end gap-2">
									<Button
										type="button"
										size="sm"
										variant="destructive"
										disabled={deleteMutation.isPending}
										onClick={() =>
											deleteMutation.mutate({
												id: item.id,
											})
										}
									>
										Hapus
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>
		</div>
	);
}
