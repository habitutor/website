import { MagnifyingGlassIcon, TicketIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { AdminContainer, AdminHeader, STICKY_FIRST_COLUMN } from "@/components/admin/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounceValue } from "@/hooks/timing/use-debounce-value";
import { cn } from "@/lib/utils";
import { client } from "@/utils/orpc";
import { CursorPagination } from "../users/-components/pagination";

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
};

interface ReferralsAdminPageProps {
  cursor: string | null;
  searchParam: string;
  hasPrevious: boolean;
  pageNumber: number;
  onSearchChange: (value: string) => void;
  onNext: (nextCursor: string) => void;
  onPrevious: () => void;
}

export function ReferralsAdminPage({
  cursor,
  searchParam,
  hasPrevious,
  pageNumber,
  onSearchChange,
  onNext,
  onPrevious,
}: ReferralsAdminPageProps) {
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
    queryKey: ["admin", "referrals", cursor, searchParam],
    queryFn: async () =>
      client.admin.referrals.listReferralTransactions({
        limit,
        cursor: cursor ?? undefined,
        search: searchParam,
      }) as Promise<ReferralListResponse>,
  });

  const rows = data?.data || [];
  const hasMore = data?.hasMore || false;
  const nextCursor = data?.nextCursor || null;

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

      <CursorPagination
        className="mt-5"
        label="transaksi"
        page={pageNumber}
        shown={rows.length}
        hasPrevious={hasPrevious}
        hasNext={hasMore}
        onPrevious={onPrevious}
        onNext={() => nextCursor && onNext(nextCursor)}
        isLoading={isPending}
      />
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

  return (
    <div className="sr-card-hover overflow-clip rounded-sr-lg border border-sr-line bg-white shadow-sr-1">
      <Table className={cn("min-w-[960px]", STICKY_FIRST_COLUMN)}>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Pembeli</TableHead>
            <TableHead>Kode Referral</TableHead>
            <TableHead>Pemilik Kode</TableHead>
            <TableHead>Nominal Transaksi</TableHead>
            <TableHead>Cashback</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dibayar Pada</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <ReferralsTableSkeleton />
          ) : (
            rows.map((row) => (
              <TableRow key={row.usageId}>
                <TableCell className="font-mono text-xs">{row.transactionId}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{row.usedByName}</span>
                    <span className="text-xs text-sr-muted">{row.usedByEmail}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{row.referralCode}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{row.ownerName}</span>
                    <span className="text-xs text-sr-muted">{row.ownerEmail}</span>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(row.transactionGrossAmount)}</TableCell>
                <TableCell>{formatCurrency(row.cashbackAmount)}</TableCell>
                <TableCell className="capitalize">{row.transactionStatus}</TableCell>
                <TableCell>{row.paidAt ? format(new Date(row.paidAt), "dd MMM yyyy HH:mm") : "-"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
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
