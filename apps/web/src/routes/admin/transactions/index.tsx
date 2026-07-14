import { ArrowsDownUp, Flask, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orpc } from "@/utils/orpc";

type SortBy = "date" | "amount" | "status" | "paymentType" | "user" | "package";

export const Route = createFileRoute("/admin/transactions/")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [simulation, setSimulation] = useState({
    userId: "",
    productSlug: "perintis2027",
    status: "success" as "success" | "pending" | "failed",
  });

  const queryInput = {
    page,
    limit: 25,
    search: search || undefined,
    status: status || undefined,
    paymentType: paymentType || undefined,
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
        toast.success(`Created ${resultStatus} simulation`, { description: orderId });
        await queryClient.invalidateQueries({ queryKey: orpc.admin.transactions.list.queryKey({ input: {} }) });
      },
      onError: (error) => toast.error("Simulation failed", { description: error.message }),
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

  return (
    <AdminContainer>
      <AdminHeader title="Transactions" description="Search, filter, and audit all Midtrans payments" />

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="relative md:col-span-2">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Order ID, transaction ID, user..."
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">pending</option>
          <option value="success">success</option>
          <option value="failed">failed</option>
          {optionsQuery.data?.statuses.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={paymentType}
          onChange={(event) => {
            setPaymentType(event.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All payment types</option>
          {optionsQuery.data?.paymentTypes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Input
          type="date"
          aria-label="Start date"
          value={from}
          onChange={(event) => {
            setFrom(event.target.value);
            setPage(1);
          }}
        />
        <Input
          type="date"
          aria-label="End date"
          value={to}
          onChange={(event) => {
            setTo(event.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Date" column="date" onSort={changeSort} />
              <TableHead>Order / Transaction ID</TableHead>
              <SortableHead label="Amount" column="amount" onSort={changeSort} />
              <SortableHead label="Status" column="status" onSort={changeSort} />
              <SortableHead label="Payment type" column="paymentType" onSort={changeSort} />
              <SortableHead label="User" column="user" onSort={changeSort} />
              <SortableHead label="Package" column="package" onSort={changeSort} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionsQuery.data?.data.map((transaction) => (
              <TableRow key={transaction.orderId}>
                <TableCell className="whitespace-nowrap">
                  {transaction.orderedAt ? new Date(transaction.orderedAt).toLocaleString("id-ID") : "-"}
                </TableCell>
                <TableCell>
                  <div className="max-w-52 font-mono text-xs break-all">{transaction.orderId}</div>
                  <div className="max-w-52 text-xs break-all text-muted-foreground">
                    {transaction.transactionId ?? "-"}
                  </div>
                </TableCell>
                <TableCell>Rp {Number(transaction.amount ?? 0).toLocaleString("id-ID")}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">{transaction.gatewayStatus ?? transaction.status}</Badge>
                    {transaction.isSimulation && <Badge variant="secondary">simulation</Badge>}
                  </div>
                </TableCell>
                <TableCell>{transaction.paymentType ?? "-"}</TableCell>
                <TableCell>
                  <div>{transaction.userName ?? "Deleted user"}</div>
                  <div className="text-xs text-muted-foreground">{transaction.userEmail ?? transaction.userId}</div>
                </TableCell>
                <TableCell>{transaction.productName ?? transaction.productSlug ?? "-"}</TableCell>
              </TableRow>
            ))}
            {!transactionsQuery.isPending && transactionsQuery.data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="my-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{transactionsQuery.data?.total ?? 0} transactions</p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= (transactionsQuery.data?.pageCount ?? 1)}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Card className="space-y-4 border-dashed p-5">
        <div className="flex items-center gap-2">
          <Flask className="size-5" />
          <div>
            <h2 className="font-semibold">Admin payment simulation</h2>
            <p className="text-sm text-muted-foreground">
              Non-production only. Creates a clearly marked local transaction and never contacts Midtrans.
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
              className="h-9 rounded-md border bg-background px-3 text-sm"
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
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <Button
              disabled={!simulation.userId.trim() || simulationMutation.isPending}
              onClick={() => simulationMutation.mutate(simulation)}
            >
              Run simulation
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Disabled. Set ENABLE_ADMIN_PAYMENT_SIMULATION=true in a non-production server environment.
          </p>
        )}
      </Card>
    </AdminContainer>
  );
}

function SortableHead({ label, column, onSort }: { label: string; column: SortBy; onSort: (column: SortBy) => void }) {
  return (
    <TableHead>
      <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort(column)}>
        {label}
        <ArrowsDownUp className="size-3" />
      </button>
    </TableHead>
  );
}
