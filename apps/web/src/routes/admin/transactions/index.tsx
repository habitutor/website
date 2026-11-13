import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsDownUp,
  CalendarBlank,
  CreditCard,
  Flask,
  MagnifyingGlassIcon,
  Package,
  Receipt,
  XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader, STICKY_FIRST_COLUMN } from "@/components/admin/dashboard-layout";
import { AdminPagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { client, orpc } from "@/utils/orpc";

type SortBy = "date" | "amount" | "status" | "paymentType" | "user" | "package";

const PAGE_SIZE = 25;
const SELECT_CLASS =
  "h-10 w-full rounded-full border border-sr-line bg-white px-3 text-sm text-sr-ink focus:border-sr-blue-300 focus:ring-4 focus:ring-sr-blue-100";

export const Route = createFileRoute("/admin/transactions/")({
  component: TransactionsPage,
});

type StatusTone = "success" | "pending" | "failed";

function getStatusInfo(raw: string | null | undefined): { label: string; tone: StatusTone } {
  const value = (raw ?? "").toLowerCase();
  if (["success", "settlement", "capture", "paid"].includes(value)) return { label: "Berhasil", tone: "success" };
  if (["pending", "authorize"].includes(value)) return { label: "Menunggu", tone: "pending" };
  if (["expire", "expired"].includes(value)) return { label: "Kedaluwarsa", tone: "failed" };
  if (["cancel", "canceled", "cancelled"].includes(value)) return { label: "Dibatalkan", tone: "failed" };
  return { label: raw ? raw : "Gagal", tone: "failed" };
}

const TONE_CLASS: Record<StatusTone, string> = {
  success: "bg-sr-live/10 text-sr-live",
  pending: "bg-sr-sun-100 text-sr-amber-700",
  failed: "bg-destructive/10 text-destructive",
};

function StatusBadge({ status, isSimulation }: { status: string | null | undefined; isSimulation?: boolean | null }) {
  const info = getStatusInfo(status);
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", TONE_CLASS[info.tone])}>
        {info.label}
      </span>
      {isSimulation && (
        <span className="inline-flex rounded-full bg-sr-ink/10 px-2 py-1 text-[11px] font-bold text-sr-ink">
          Simulasi
        </span>
      )}
    </span>
  );
}

const formatRupiah = (amount: string | number | null | undefined) =>
  `Rp ${Number(amount ?? 0).toLocaleString("id-ID")}`;
const formatWhen = (date: Date | string | null | undefined) =>
  date ? format(new Date(date), "d MMM yyyy, HH.mm", { locale: idLocale }) : "-";

function PayerAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sr-blue-50 text-sm font-black text-sr-blue-700 ring-1 ring-sr-blue-100 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

type TransactionItem = Awaited<ReturnType<typeof client.admin.transactions.list>>["data"][number];

function TransactionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [simulation, setSimulation] = useState({
    userId: "",
    productSlug: "paketmandiri2027",
    status: "success" as "success" | "pending" | "failed",
  });

  const queryInput = {
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    paymentType: paymentType || undefined,
    productSlug: productSlug || undefined,
    from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
    to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
    sortBy,
    sortDirection,
  };
  const transactionsQuery = useQuery(orpc.admin.transactions.list.queryOptions({ input: queryInput }));
  const optionsQuery = useQuery(orpc.admin.transactions.filterOptions.queryOptions());
  const productsQuery = useQuery(orpc.admin.promos.products.queryOptions());
  const simulationConfigQuery = useQuery(orpc.admin.transactions.simulationConfig.queryOptions());
  const simulationMutation = useMutation(
    orpc.admin.transactions.simulate.mutationOptions({
      onSuccess: async ({ orderId, status: resultStatus }) => {
        toast.success(`Simulasi ${resultStatus} dibuat`, { description: orderId });
        await queryClient.invalidateQueries({ queryKey: orpc.admin.transactions.list.queryKey({ input: {} }) });
      },
      onError: (error) => toast.error("Simulasi gagal", { description: error.message }),
    }),
  );

  const changeSort = (column: SortBy) => {
    setPage(1);
    if (sortBy === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const filter =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };
  const hasFilter = Boolean(search || status || paymentType || productSlug || from || to);
  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentType("");
    setProductSlug("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const statusOptions = Array.from(new Set(["pending", "success", "failed", ...(optionsQuery.data?.statuses ?? [])]));
  const rows = transactionsQuery.data?.data ?? [];
  const total = transactionsQuery.data?.total ?? 0;
  const isPending = transactionsQuery.isPending;
  const showCards = !isPending && rows.length > 0;

  return (
    <AdminContainer>
      <AdminHeader title="Transactions" description="Cari, filter, dan audit seluruh transaksi pembayaran." />

      <div className="mb-6 sr-card-hover space-y-3 rounded-sr-xl border border-sr-line bg-sr-ivory/60 p-4 shadow-sr-1">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-sr-muted" />
          <Input
            value={search}
            onChange={(event) => filter(setSearch)(event.target.value)}
            placeholder="Cari order ID, transaction ID, atau user…"
            className="h-11 rounded-full border-sr-line bg-white pl-9 focus:border-sr-blue-300 focus:ring-4 focus:ring-sr-blue-100"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <select
            aria-label="Status"
            value={status}
            onChange={(event) => filter(setStatus)(event.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">Semua status</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {getStatusInfo(option).label === option ? option : `${getStatusInfo(option).label} (${option})`}
              </option>
            ))}
          </select>
          <select
            aria-label="Metode bayar"
            value={paymentType}
            onChange={(event) => filter(setPaymentType)(event.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">Semua metode bayar</option>
            {optionsQuery.data?.paymentTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            aria-label="Produk"
            value={productSlug}
            onChange={(event) => filter(setProductSlug)(event.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">Semua produk</option>
            {(optionsQuery.data?.products ?? []).map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              aria-label="Tanggal mulai"
              value={from}
              onChange={(event) => filter(setFrom)(event.target.value)}
              className="w-auto"
            />
            <span className="text-sm text-sr-muted">sampai</span>
            <Input
              type="date"
              aria-label="Tanggal akhir"
              value={to}
              onChange={(event) => filter(setTo)(event.target.value)}
              className="w-auto"
            />
          </div>
          {hasFilter && (
            <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
              <XIcon className="size-4" />
              Reset filter
            </Button>
          )}
        </div>
      </div>

      <div className="sr-card-hover overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1">
        <div className={showCards ? "hidden overflow-x-auto md:block" : "overflow-x-auto"}>
          <Table className={cn("min-w-[860px]", STICKY_FIRST_COLUMN)}>
            <TableHeader>
              <TableRow>
                <SortableHead
                  label="Tanggal"
                  column="date"
                  sortBy={sortBy}
                  direction={sortDirection}
                  onSort={changeSort}
                  className="px-4"
                />
                <TableHead>Order ID</TableHead>
                <SortableHead
                  label="User"
                  column="user"
                  sortBy={sortBy}
                  direction={sortDirection}
                  onSort={changeSort}
                />
                <SortableHead
                  label="Paket"
                  column="package"
                  sortBy={sortBy}
                  direction={sortDirection}
                  onSort={changeSort}
                />
                <SortableHead
                  label="Nominal"
                  column="amount"
                  sortBy={sortBy}
                  direction={sortDirection}
                  onSort={changeSort}
                />
                <SortableHead
                  label="Status"
                  column="status"
                  sortBy={sortBy}
                  direction={sortDirection}
                  onSort={changeSort}
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending &&
                Array.from({ length: 6 }).map((_, index) => (
                  // biome-ignore lint: skeleton items don't need stable keys
                  <TableRow key={index}>
                    {[28, 40, 44, 28, 24, 20].map((width, cell) => (
                      <TableCell key={cell.toString()}>
                        <Skeleton className="h-5" style={{ width: `${width * 4}px` }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {rows.map((transaction) => (
                <TransactionRow key={transaction.orderId} transaction={transaction} />
              ))}
              {!isPending && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-14 text-center">
                    <EmptyTransactions hasFilter={hasFilter} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {showCards && (
          <ul className="divide-y divide-sr-line md:hidden">
            {rows.map((transaction) => (
              <TransactionCard key={transaction.orderId} transaction={transaction} />
            ))}
          </ul>
        )}
      </div>

      {total > 0 && (
        <AdminPagination
          className="mt-5"
          label="Transaksi"
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          isLoading={transactionsQuery.isFetching}
          onPageChange={setPage}
        />
      )}

      <Card className="mt-6 space-y-4 rounded-sr-xl border-dashed p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-sr-md bg-sr-sun-100 text-sr-amber-700">
            <Flask weight="fill" className="size-5" />
          </span>
          <div>
            <h2 className="font-black text-sr-ink">Simulasi pembayaran admin</h2>
            <p className="text-sm text-sr-muted">
              Hanya untuk lingkungan non-production. Membuat transaksi lokal bertanda "Simulasi" dan tidak pernah
              menghubungi Midtrans.
            </p>
          </div>
        </div>
        {simulationConfigQuery.data?.enabled ? (
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              placeholder="User ID"
              value={simulation.userId}
              onChange={(event) => setSimulation((current) => ({ ...current, userId: event.target.value }))}
            />
            <select
              value={simulation.productSlug}
              onChange={(event) => setSimulation((current) => ({ ...current, productSlug: event.target.value }))}
              className={SELECT_CLASS}
            >
              {productsQuery.data?.map((product) => (
                <option key={product.slug} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
            <select
              value={simulation.status}
              onChange={(event) =>
                setSimulation((current) => ({
                  ...current,
                  status: event.target.value as "success" | "pending" | "failed",
                }))
              }
              className={SELECT_CLASS}
            >
              <option value="success">Berhasil</option>
              <option value="pending">Menunggu</option>
              <option value="failed">Gagal</option>
            </select>
            <Button
              disabled={!simulation.userId.trim() || simulationMutation.isPending}
              onClick={() => simulationMutation.mutate(simulation)}
            >
              {simulationMutation.isPending ? "Memproses…" : "Jalankan simulasi"}
            </Button>
          </div>
        ) : (
          <p className="rounded-sr-md bg-sr-ivory p-3 text-sm text-sr-muted">
            Nonaktif. Set ENABLE_ADMIN_PAYMENT_SIMULATION=true di server non-production untuk memakainya.
          </p>
        )}
      </Card>
    </AdminContainer>
  );
}

function EmptyTransactions({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
      <span className="flex size-12 items-center justify-center rounded-full bg-sr-blue-50 text-sr-blue-600">
        <Receipt weight="duotone" className="size-6" />
      </span>
      <p className="font-extrabold text-sr-ink">Belum ada transaksi</p>
      <p className="text-sm text-sr-muted">
        {hasFilter ? "Tidak ada transaksi yang cocok. Coba ubah atau reset filter." : "Transaksi akan muncul di sini."}
      </p>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: TransactionItem }) {
  const userName = transaction.userName ?? "User terhapus";
  return (
    <TableRow className="group">
      <TableCell className="px-4 text-sm whitespace-nowrap text-sr-muted">
        {formatWhen(transaction.orderedAt)}
      </TableCell>
      <TableCell>
        <p className="max-w-48 truncate font-mono text-xs text-sr-ink" title={transaction.orderId}>
          {transaction.orderId}
        </p>
        <p className="max-w-48 truncate text-[11px] text-sr-muted" title={transaction.transactionId ?? undefined}>
          {transaction.transactionId ?? "-"}
        </p>
      </TableCell>
      <TableCell>
        <div className="flex min-w-0 items-center gap-2.5">
          <PayerAvatar name={userName} />
          <div className="min-w-0">
            <p className="truncate font-bold text-sr-ink">{userName}</p>
            <p className="truncate text-xs text-sr-muted">{transaction.userEmail ?? transaction.userId}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="text-sm font-semibold text-sr-ink">{transaction.productName ?? transaction.productSlug ?? "-"}</p>
        <p className="text-xs text-sr-muted capitalize">{transaction.paymentType?.replaceAll("_", " ") ?? "-"}</p>
      </TableCell>
      <TableCell className="font-black whitespace-nowrap text-sr-ink">{formatRupiah(transaction.amount)}</TableCell>
      <TableCell>
        <StatusBadge status={transaction.gatewayStatus ?? transaction.status} isSimulation={transaction.isSimulation} />
      </TableCell>
    </TableRow>
  );
}

function TransactionCard({ transaction }: { transaction: TransactionItem }) {
  const userName = transaction.userName ?? "User terhapus";
  return (
    <li className="group space-y-3 px-4 py-4 transition-colors duration-200 active:bg-sr-blue-50/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <PayerAvatar name={userName} />
          <div className="min-w-0">
            <p className="truncate font-bold text-sr-ink">{userName}</p>
            <p className="truncate text-xs text-sr-muted">{transaction.userEmail ?? transaction.userId}</p>
          </div>
        </div>
        <p className="shrink-0 font-black text-sr-ink">{formatRupiah(transaction.amount)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={transaction.gatewayStatus ?? transaction.status} isSimulation={transaction.isSimulation} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sr-muted">
        <span className="inline-flex items-center gap-1">
          <Package className="size-3.5" /> {transaction.productName ?? transaction.productSlug ?? "-"}
        </span>
        <span className="inline-flex items-center gap-1 capitalize">
          <CreditCard className="size-3.5" /> {transaction.paymentType?.replaceAll("_", " ") ?? "-"}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarBlank className="size-3.5" /> {formatWhen(transaction.orderedAt)}
        </span>
      </div>
      <p className="truncate font-mono text-[11px] text-sr-muted" title={transaction.orderId}>
        {transaction.orderId}
      </p>
    </li>
  );
}

function SortableHead({
  label,
  column,
  sortBy,
  direction,
  onSort,
  className,
}: {
  label: string;
  column: SortBy;
  sortBy: SortBy;
  direction: "asc" | "desc";
  onSort: (column: SortBy) => void;
  className?: string;
}) {
  const active = sortBy === column;
  const Icon = !active ? ArrowsDownUp : direction === "asc" ? ArrowUpIcon : ArrowDownIcon;
  return (
    <TableHead className={className} aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 uppercase transition-colors hover:text-sr-blue-600",
          active && "text-sr-blue-600",
        )}
        onClick={() => onSort(column)}
      >
        {label}
        <Icon className="size-3" weight={active ? "bold" : "regular"} />
      </button>
    </TableHead>
  );
}
