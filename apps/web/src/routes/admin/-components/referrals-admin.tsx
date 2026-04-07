import { MagnifyingGlassIcon, TicketIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounceValue } from "@/hooks/timing/use-debounce-value";
import { client } from "@/utils/orpc";
import { CursorPagination } from "@/components/admin/pagination";

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
  prevCursor: string | null;
  hasMore: boolean;
  hasPrevious: boolean;
};

interface ReferralsAdminPageProps {
  after: string | null;
  before: string | null;
  searchParam: string;
  onSearchChange: (value: string) => void;
  onNext: (nextAfter: string) => void;
  onPrevious: (prevCursor: string) => void;
}

export function ReferralsAdminPage({
  after,
  before,
  searchParam,
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
    queryKey: ["admin", "referrals", after, before, searchParam],
    queryFn: async () =>
      client.admin.referrals.listReferralTransactions({
        limit,
        after: after ?? undefined,
        before: before ?? undefined,
        search: searchParam,
      }) as Promise<ReferralListResponse>,
  });

  const rows = data?.data || [];
  const hasMore = data?.hasMore || false;
  const hasPrevious = data?.hasPrevious || false;
  const nextCursor = data?.nextCursor || null;
  const prevCursor = data?.prevCursor || null;

  return (
    <AdminContainer>
      <AdminHeader
        title="Referral Transactions"
        description="Track pengguna referral, pemilik kode, dan nominal transaksi Midtrans"
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code, buyer, owner, or order id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ReferralsTable rows={rows} isPending={isPending} />

      <CursorPagination
        hasPrevious={hasPrevious}
        hasNext={hasMore}
        onPrevious={() => prevCursor && onPrevious(prevCursor)}
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
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
        <TicketIcon className="mb-4 size-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No referral transactions found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your search query</p>
      </div>
    );
  }

  return (
    <div className="overflow-clip rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Referral Code</TableHead>
            <TableHead>Code Owner</TableHead>
            <TableHead>Transaction Amount</TableHead>
            <TableHead>Cashback</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Paid At</TableHead>
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
                    <span className="text-xs text-muted-foreground">{row.usedByEmail}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{row.referralCode}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{row.ownerName}</span>
                    <span className="text-xs text-muted-foreground">{row.ownerEmail}</span>
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
