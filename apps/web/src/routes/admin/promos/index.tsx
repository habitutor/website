import { Plus, Tag } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader, STICKY_FIRST_COLUMN } from "@/components/admin/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/promos/")({
  component: PromosPage,
});

type PackageSelection = Record<string, { selected: boolean; quota: string }>;

function PromosPage() {
  const queryClient = useQueryClient();
  const promosQuery = useQuery(orpc.admin.promos.list.queryOptions());
  const productsQuery = useQuery(orpc.admin.promos.products.queryOptions());
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed_price",
    discountValue: "",
    expiresAt: "",
    perUserLimit: "1",
    isActive: true,
  });
  const [selection, setSelection] = useState<PackageSelection>({});
  const selectedPackages = Object.entries(selection)
    .filter(([, entry]) => entry.selected)
    .map(([productId, entry]) => ({ productId, usageLimit: entry.quota ? Number(entry.quota) : null }));

  const createMutation = useMutation(
    orpc.admin.promos.create.mutationOptions({
      onSuccess: async (promo) => {
        toast.success(`Promo ${promo?.code ?? ""} berhasil dibuat`);
        setForm((current) => ({ ...current, code: "", discountValue: "", expiresAt: "" }));
        setSelection({});
        await queryClient.invalidateQueries({ queryKey: orpc.admin.promos.list.queryKey() });
      },
      onError: (error) => toast.error("Gagal membuat promo", { description: error.message }),
    }),
  );
  const updateMutation = useMutation(
    orpc.admin.promos.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.admin.promos.list.queryKey() });
      },
      onError: (error) => toast.error("Gagal memperbarui promo", { description: error.message }),
    }),
  );

  return (
    <AdminContainer>
      <AdminHeader
        title="Promo Codes"
        description="Satu kode bisa berlaku untuk beberapa paket, masing-masing dengan kuota sendiri (pembelian yang sudah dibayar atau masih berjalan)."
      />
      <Card className="mb-6 sr-lift space-y-4 rounded-sr-xl border-sr-line bg-linear-to-br from-white to-sr-sun-100/60 p-5 shadow-sr-1">
        <div className="flex items-center gap-2">
          <Tag className="size-5" />
          <h2 className="font-semibold">Buat kode promo</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Kode (kosongkan untuk dibuat otomatis)">
            <Input
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
              placeholder="PROMO-2027"
            />
          </Field>
          <Field label="Jenis diskon">
            <select
              value={form.discountType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  discountType: event.target.value as "percentage" | "fixed_price",
                }))
              }
              className="h-10 w-full cursor-pointer rounded-full border border-sr-line bg-white px-3 text-sm text-sr-ink focus:border-sr-blue-300 focus:ring-4 focus:ring-sr-blue-100"
            >
              <option value="percentage">Diskon persentase</option>
              <option value="fixed_price">Harga akhir tetap</option>
            </select>
          </Field>
          <Field label={form.discountType === "percentage" ? "Diskon (%)" : "Harga akhir (Rp)"}>
            <Input
              type="number"
              min={1}
              max={form.discountType === "percentage" ? 100 : undefined}
              value={form.discountValue}
              onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))}
            />
          </Field>
          <Field label="Batas per user">
            <Input
              type="number"
              min={1}
              value={form.perUserLimit}
              onChange={(event) => setForm((current) => ({ ...current, perUserLimit: event.target.value }))}
            />
          </Field>
          <Field label="Berlaku sampai (kosong = tanpa batas)">
            <Input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
            />
          </Field>
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium">Paket dan kuota (kuota kosong = tanpa batas)</legend>
          {productsQuery.isPending && <p className="text-sm text-muted-foreground">Memuat paket...</p>}
          {productsQuery.isError && (
            <p className="text-sm text-destructive">Gagal memuat paket: {productsQuery.error.message}</p>
          )}
          <div className="grid gap-2 md:grid-cols-2">
            {productsQuery.data?.map((product) => {
              const entry = selection[product.id] ?? { selected: false, quota: "" };
              return (
                <div key={product.id} className="flex items-center gap-3 rounded-md border bg-white px-3 py-2">
                  <Checkbox
                    id={`promo-package-${product.id}`}
                    checked={entry.selected}
                    onCheckedChange={(checked) =>
                      setSelection((current) => ({
                        ...current,
                        [product.id]: { ...entry, selected: checked === true },
                      }))
                    }
                  />
                  <Label htmlFor={`promo-package-${product.id}`} className="min-w-0 flex-1 cursor-pointer text-sm">
                    {product.name}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    aria-label={`Kuota untuk ${product.name}`}
                    placeholder="Tanpa batas"
                    disabled={!entry.selected}
                    value={entry.quota}
                    onChange={(event) =>
                      setSelection((current) => ({ ...current, [product.id]: { ...entry, quota: event.target.value } }))
                    }
                    className="h-8 w-28"
                  />
                </div>
              );
            })}
          </div>
        </fieldset>

        <Button
          disabled={selectedPackages.length === 0 || !form.discountValue || createMutation.isPending}
          onClick={() =>
            createMutation.mutate({
              code: form.code || undefined,
              discountType: form.discountType,
              discountValue: Number(form.discountValue),
              expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
              perUserLimit: Number(form.perUserLimit),
              isActive: form.isActive,
              packages: selectedPackages,
            })
          }
        >
          <Plus className="size-4" /> Buat promo
        </Button>
      </Card>

      <div className="sr-card-hover overflow-x-auto rounded-sr-xl border border-sr-line bg-white shadow-sr-1">
        <Table className={cn("min-w-[720px]", STICKY_FIRST_COLUMN)}>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Diskon</TableHead>
              <TableHead>Paket (terpakai / kuota)</TableHead>
              <TableHead>Per user</TableHead>
              <TableHead>Berakhir</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promosQuery.isPending && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Memuat kode promo...
                </TableCell>
              </TableRow>
            )}
            {promosQuery.isError && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-destructive">
                  Gagal memuat kode promo: {promosQuery.error.message}
                </TableCell>
              </TableRow>
            )}
            {promosQuery.isSuccess && promosQuery.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Belum ada kode promo. Buat yang pertama di atas.
                </TableCell>
              </TableRow>
            )}
            {promosQuery.data?.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-mono font-semibold">{promo.code}</TableCell>
                <TableCell>
                  {promo.discountType === "percentage"
                    ? `${Number(promo.discountValue)}% off`
                    : `Rp ${Number(promo.discountValue).toLocaleString("id-ID")}`}
                </TableCell>
                <TableCell>
                  <ul className="space-y-0.5 text-sm">
                    {promo.packages.map((pkg) => (
                      <li key={pkg.productId}>
                        {pkg.productName}:{" "}
                        <span className="font-semibold tabular-nums">
                          {pkg.usageCount}/{pkg.usageLimit ?? "∞"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>{promo.perUserLimit}</TableCell>
                <TableCell>
                  {promo.expiresAt ? new Date(promo.expiresAt).toLocaleString("id-ID") : "Tidak ada batas"}
                </TableCell>
                <TableCell>
                  <Badge variant={promo.isActive ? "default" : "secondary"}>
                    {promo.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: promo.id,
                        code: promo.code,
                        discountType: promo.discountType,
                        discountValue: Number(promo.discountValue),
                        expiresAt: promo.expiresAt?.toISOString() ?? null,
                        perUserLimit: promo.perUserLimit,
                        isActive: !promo.isActive,
                        packages: promo.packages.map(({ productId, usageLimit }) => ({ productId, usageLimit })),
                      })
                    }
                  >
                    {promo.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminContainer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
