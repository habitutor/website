import { Plus, Tag } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/promos/")({
  component: PromosPage,
});

function PromosPage() {
  const queryClient = useQueryClient();
  const promosQuery = useQuery(orpc.admin.promos.list.queryOptions());
  const productsQuery = useQuery(orpc.admin.promos.products.queryOptions());
  const [form, setForm] = useState({
    code: "",
    productId: "",
    discountType: "percentage" as "percentage" | "fixed_price",
    discountValue: "",
    expiresAt: "",
    totalUsageLimit: "",
    perUserLimit: "1",
    isActive: true,
  });
  const createMutation = useMutation(
    orpc.admin.promos.create.mutationOptions({
      onSuccess: async (promo) => {
        toast.success(`Promo ${promo?.code ?? ""} created`);
        setForm((current) => ({ ...current, code: "", discountValue: "", expiresAt: "", totalUsageLimit: "" }));
        await queryClient.invalidateQueries({ queryKey: orpc.admin.promos.list.queryKey() });
      },
      onError: (error) => toast.error("Failed to create promo", { description: error.message }),
    }),
  );
  const updateMutation = useMutation(
    orpc.admin.promos.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.admin.promos.list.queryKey() });
      },
      onError: (error) => toast.error("Failed to update promo", { description: error.message }),
    }),
  );

  return (
    <AdminContainer>
      <AdminHeader title="Promo Codes" description="Create fixed-price or percentage package promotions" />
      <Card className="mb-6 space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Tag className="size-5" />
          <h2 className="font-semibold">Generate promo code</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Code (blank = generated)">
            <Input
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
              placeholder="PROMO-2027"
            />
          </Field>
          <Field label="Package">
            <select
              value={form.productId}
              onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select package</option>
              {productsQuery.data?.map((product) => (
                <option key={product.slug} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Discount type">
            <select
              value={form.discountType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  discountType: event.target.value as "percentage" | "fixed_price",
                }))
              }
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="percentage">Percentage discount</option>
              <option value="fixed_price">Fixed final price</option>
            </select>
          </Field>
          <Field label={form.discountType === "percentage" ? "Discount (%)" : "Final price (Rp)"}>
            <Input
              type="number"
              min={1}
              max={form.discountType === "percentage" ? 100 : undefined}
              value={form.discountValue}
              onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))}
            />
          </Field>
          <Field label="Expiration date">
            <Input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
            />
          </Field>
          <Field label="Total usage limit">
            <Input
              type="number"
              min={1}
              placeholder="Unlimited"
              value={form.totalUsageLimit}
              onChange={(event) => setForm((current) => ({ ...current, totalUsageLimit: event.target.value }))}
            />
          </Field>
          <Field label="Per-user limit">
            <Input
              type="number"
              min={1}
              value={form.perUserLimit}
              onChange={(event) => setForm((current) => ({ ...current, perUserLimit: event.target.value }))}
            />
          </Field>
        </div>
        <Button
          disabled={!form.productId || !form.discountValue || createMutation.isPending}
          onClick={() => {
            const productId = productsQuery.data?.find(({ slug }) => slug === form.productId)?.slug;
            const product = productsQuery.data?.find(({ slug }) => slug === productId);
            if (!product) return;
            createMutation.mutate({
              code: form.code || undefined,
              productId: product.slug,
              discountType: form.discountType,
              discountValue: Number(form.discountValue),
              expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
              totalUsageLimit: form.totalUsageLimit ? Number(form.totalUsageLimit) : null,
              perUserLimit: Number(form.perUserLimit),
              isActive: form.isActive,
            });
          }}
        >
          <Plus className="size-4" /> Create promo
        </Button>
      </Card>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promosQuery.data?.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-mono font-semibold">{promo.code}</TableCell>
                <TableCell>{promo.productName}</TableCell>
                <TableCell>
                  {promo.discountType === "percentage"
                    ? `${promo.discountValue}% off`
                    : `Rp ${Number(promo.discountValue).toLocaleString("id-ID")}`}
                </TableCell>
                <TableCell>
                  {promo.usageCount}/{promo.totalUsageLimit ?? "∞"} total · {promo.perUserLimit}/user
                </TableCell>
                <TableCell>{promo.expiresAt ? new Date(promo.expiresAt).toLocaleString("id-ID") : "Never"}</TableCell>
                <TableCell>
                  <Badge variant={promo.isActive ? "default" : "secondary"}>
                    {promo.isActive ? "Active" : "Inactive"}
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
                        productId: promo.productId,
                        discountType: promo.discountType,
                        discountValue: Number(promo.discountValue),
                        expiresAt: promo.expiresAt?.toISOString() ?? null,
                        totalUsageLimit: promo.totalUsageLimit,
                        perUserLimit: promo.perUserLimit,
                        isActive: !promo.isActive,
                      })
                    }
                  >
                    {promo.isActive ? "Deactivate" : "Activate"}
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
