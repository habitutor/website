import { MagnifyingGlassIcon, TicketIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { AdminPagination } from "@/components/admin/pagination";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounceValue } from "@/hooks/timing/use-debounce-value";
import { cn } from "@/lib/utils";
import { client } from "@/utils/orpc";

type ReferralTransactionRow = {
  usageId: string;
  usedAt: Date;
  transactionId: string;
  transactionStatus: "pending" | "success" | "failed";
  transactionGrossAmount: string | null;
  cashbackAmount: string | null;
  paidAt: Date | null;
  referralCode: string;
  usedByUserId: string;
  usedByName: string;
  usedByEmail: string;
  ownerUserId: string;
  ownerName: string;
  ownerEmail: string;
};

type ReferralListResponse = {
  data: ReferralTransactionRow[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
};

interface ReferralsAdminPageProps {
  page: number;
  searchParam: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export function ReferralsAdminPage({ page, searchParam, onSearchChange, onPageChange }: ReferralsAdminPageProps) {
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const debouncedSearch = useDebounceValue(searchQuery, 500);
  const isFirstRender = useRef(true);
  const limit = 10;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const { data, isPending } = useQuery<ReferralListResponse>({
    queryKey: ["admin", "referrals", page, searchParam],
    queryFn: async () =>
      client.admin.referrals.listReferralTransactions({
        limit,
        page,
        search: searchParam,
      }) as Promise<ReferralListResponse>,
  });

  const rows = data?.data || [];
  const total = data?.total ?? 0;

  return (
    <AdminContainer>
      <AdminHeader
        title="Referral Transactions"
        description="Track pengguna referral, pemilik kode, dan nominal transaksi Midtrans"
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-sr-muted" />
          <Input
            placeholder="Cari kode, pembeli, pemilik, atau order ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ReferralsTable rows={rows} isPending={isPending} />

      {total > 0 && (
        <AdminPagination
          className="mt-5"
          label="Transaksi referral"
          page={page}
          total={total}
          pageSize={limit}
          isLoading={isPending}
          onPageChange={onPageChange}
        />
      )}
    </AdminContainer>
  );
}

function formatCurrency(amount: string | null) {
  const value = Number(amount ?? "0");
  if (!Number.isFinite(value)) return "Rp0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function referralStatus(raw: string | null | undefined) {
  const value = (raw ?? "").toLowerCase();
  if (["success", "settlement", "capture", "paid"].includes(value))
    return { label: "Berhasil", cls: "bg-sr-live/10 text-sr-live" };
  if (["pending", "authorize"].includes(value)) return { label: "Menunggu", cls: "bg-sr-sun-100 text-sr-amber-700" };
  return { label: raw ? raw : "Gagal", cls: "bg-destructive/10 text-destructive" };
}

function ReferralStatusBadge({ status }: { status: string | null | undefined }) {
  const info = referralStatus(status);
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", info.cls)}>{info.label}</span>;
}

function ReferralsTable({ rows, isPending }: { rows: ReferralTransactionRow[]; isPending: boolean }) {
  if (!isPending && rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sr-lg border-2 border-dashed border-sr-blue-200 bg-white/60 p-12 text-center">
        <TicketIcon className="text-sr-blue-400 mb-4 size-12" />
        <h3 className="mb-2 text-lg font-black text-sr-ink">Belum ada transaksi referral</h3>
        <p className="text-sm text-sr-muted">Coba ubah kata kunci pencarian.</p>
      </div>
    );
  }

  const showCards = !isPending;

  return (
    <div className="overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1">
      <div className={showCards ? "hidden overflow-x-auto md:block" : "overflow-x-auto"}>
        <Table className="min-w-[960px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Pembeli</TableHead>
              <TableHead>Kode & Pemilik</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Cashback</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibayar</TableHead>
              <TableHead>Order ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <ReferralsTableSkeleton />
            ) : (
              rows.map((row) => (
                <TableRow key={row.usageId} className="group">
                  <TableCell className="px-4">
                    <p className="font-bold text-sr-ink">{row.usedByName}</p>
                    <p className="text-xs text-sr-muted">{row.usedByEmail}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-mono text-xs font-bold text-sr-blue-700">{row.referralCode}</p>
                    <p className="text-xs text-sr-muted">{row.ownerName}</p>
                  </TableCell>
                  <TableCell className="font-black whitespace-nowrap text-sr-ink">
                    {formatCurrency(row.transactionGrossAmount)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sr-ink">{formatCurrency(row.cashbackAmount)}</TableCell>
                  <TableCell>
                    <ReferralStatusBadge status={row.transactionStatus} />
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-sr-muted">
                    {row.paidAt ? format(new Date(row.paidAt), "dd MMM yyyy HH:mm") : "-"}
                  </TableCell>
                  <TableCell>
                    <p
                      className="max-w-40 truncate font-mono text-[11px] text-sr-muted"
                      title={row.transactionId ?? undefined}
                    >
                      {row.transactionId}
                    </p>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {showCards && (
        <ul className="divide-y divide-sr-line md:hidden">
          {rows.map((row) => (
            <li
              key={row.usageId}
              className="space-y-3 px-4 py-4 transition-colors duration-200 active:bg-sr-blue-50/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-sr-ink">{row.usedByName}</p>
                  <p className="truncate text-xs text-sr-muted">{row.usedByEmail}</p>
                </div>
                <ReferralStatusBadge status={row.transactionStatus} />
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-sr-md bg-sr-ivory/70 p-3 text-xs">
                <div>
                  <p className="text-sr-muted">Nominal</p>
                  <p className="font-black text-sr-ink">{formatCurrency(row.transactionGrossAmount)}</p>
                </div>
                <div>
                  <p className="text-sr-muted">Cashback</p>
                  <p className="font-black text-sr-ink">{formatCurrency(row.cashbackAmount)}</p>
                </div>
                <div>
                  <p className="text-sr-muted">Kode referral</p>
                  <p className="font-mono font-bold text-sr-blue-700">{row.referralCode}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sr-muted">Pemilik kode</p>
                  <p className="truncate font-semibold text-sr-ink">{row.ownerName}</p>
                </div>
              </div>
              <p className="text-[11px] text-sr-muted">
                {row.paidAt ? `Dibayar ${format(new Date(row.paidAt), "dd MMM yyyy HH:mm")}` : "Belum dibayar"}
              </p>
              <p className="truncate font-mono text-[11px] text-sr-muted" title={row.transactionId ?? undefined}>
                {row.transactionId}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReferralsTableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        // biome-ignore lint: skeleton items don't need stable keys
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-52" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-36" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-36" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-28" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
