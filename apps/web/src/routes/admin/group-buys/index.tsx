import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/group-buys/")({
  component: GroupBuysPage,
});

function formatDateTime(value: Date | string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function formatAmount(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

function GroupBuysPage() {
  return (
    <AdminContainer>
      <AdminHeader
        title="Group Buys"
        description="Monitor group-buy progress and process manual refunds for expired groups"
      />
      <RefundRequestsSection />
      <GroupsSection />
    </AdminContainer>
  );
}

function RefundRequestsSection() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"refund_requested" | "refunded">("refund_requested");
  const [page, setPage] = useState(1);

  const refundsQuery = useQuery(orpc.admin.groupBuys.listRefunds.queryOptions({ input: { status, page, limit: 25 } }));
  const markRefundedMutation = useMutation(
    orpc.admin.groupBuys.markRefunded.mutationOptions({
      onSuccess: async () => {
        toast.success("Refund marked as done");
        await queryClient.invalidateQueries({ queryKey: orpc.admin.groupBuys.listRefunds.queryKey({ input: {} }) });
      },
      onError: (error) => toast.error("Failed to mark refund", { description: error.message }),
    }),
  );

  const rows = refundsQuery.data?.data ?? [];
  const total = refundsQuery.data?.total ?? 0;
  const totalPages = Math.max(Math.ceil(total / 25), 1);

  return (
    <Card className="mb-6 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Refund Requests</h2>
          <p className="text-sm text-muted-foreground">
            Transfer manually to the listed account, then mark the request as refunded. Users are told this takes up to
            7 business days.
          </p>
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as "refund_requested" | "refunded");
            setPage(1);
          }}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="refund_requested">Waiting for transfer</option>
          <option value="refunded">Already refunded</option>
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Bank</TableHead>
            <TableHead>Account No.</TableHead>
            <TableHead>Account Holder</TableHead>
            <TableHead>Requested At</TableHead>
            <TableHead>{status === "refunded" ? "Refunded At" : "Action"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                {refundsQuery.isPending ? "Loading..." : "No refund requests"}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.memberId}>
                <TableCell>
                  <div className="font-medium">{row.userName}</div>
                  <div className="text-xs text-muted-foreground">{row.userEmail}</div>
                </TableCell>
                <TableCell>{row.userPhoneNumber ?? "-"}</TableCell>
                <TableCell className="font-mono text-xs">{row.inviteCode}</TableCell>
                <TableCell className="font-semibold">{formatAmount(row.refundAmount)}</TableCell>
                <TableCell>{row.bankName ?? "-"}</TableCell>
                <TableCell className="font-mono">{row.accountNumber ?? "-"}</TableCell>
                <TableCell>{row.accountHolder ?? "-"}</TableCell>
                <TableCell className="text-xs">{formatDateTime(row.refundRequestedAt)}</TableCell>
                <TableCell>
                  {status === "refunded" ? (
                    <span className="text-xs">{formatDateTime(row.refundedAt)}</span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markRefundedMutation.mutate({ memberId: row.memberId })}
                      isPending={markRefundedMutation.isPending}
                    >
                      Mark refunded
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </Card>
  );
}

function GroupsSection() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const groupsQuery = useQuery(
    orpc.admin.groupBuys.listGroups.queryOptions({
      input: {
        status: status ? (status as "active" | "completed" | "expired") : undefined,
        page,
        limit: 25,
      },
    }),
  );

  const rows = groupsQuery.data?.data ?? [];
  const total = groupsQuery.data?.total ?? 0;
  const totalPages = Math.max(Math.ceil(total / 25), 1);

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">All Groups</h2>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">active</option>
          <option value="completed">completed</option>
          <option value="expired">expired</option>
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invite Code</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Seat Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Expires</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                {groupsQuery.isPending ? "Loading..." : "No groups"}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.inviteCode}</TableCell>
                <TableCell>
                  <div className="font-medium">{row.creatorName}</div>
                  <div className="text-xs text-muted-foreground">{row.creatorEmail}</div>
                </TableCell>
                <TableCell className="font-semibold">
                  {row.paidCount}/{row.requiredMembers}
                </TableCell>
                <TableCell>{formatAmount(row.seatPrice)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      row.status === "completed" ? "default" : row.status === "active" ? "secondary" : "destructive"
                    }
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{formatDateTime(row.createdAt)}</TableCell>
                <TableCell className="text-xs">{formatDateTime(row.expiresAt)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </Card>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-3 flex items-center justify-end gap-2">
      <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </div>
  );
}
