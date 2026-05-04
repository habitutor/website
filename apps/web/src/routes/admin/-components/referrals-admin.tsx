import { MagnifyingGlassIcon, TicketIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { AdminTable, AdminTablePagination, AdminTableToolbar } from "@/components/admin/admin-table";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounceValue } from "@/hooks/timing/use-debounce-value";
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

      <AdminTableToolbar>
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code, buyer, owner, or order id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </AdminTableToolbar>

      <AdminTable
        isEmpty={rows.length === 0}
        isPending={isPending}
        emptyState={{
          icon: TicketIcon,
          title: "No referral transactions found",
          description: "Try adjusting your search query",
        }}
        skeletonCellWidths={["w-52", "w-36", "w-24", "w-36", "w-24", "w-20", "w-16", "w-28"]}
      >
        <ReferralsTable rows={rows} />
      </AdminTable>

      <AdminTablePagination
        hasPrevious={hasPrevious}
        hasNext={hasMore}
        onPrevious={() => prevCursor && onPrevious(prevCursor)}
        onNext={() => nextCursor && onNext(nextCursor)}
        isPending={isPending}
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

function ReferralsTable({ rows }: { rows: ReferralTransactionRow[] }) {
  return (
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
        {rows.map((row) => (
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
        ))}
      </TableBody>
    </Table>
  );
}
