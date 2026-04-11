import type { ElementType } from "react";
import type * as React from "react";
import { CursorPagination } from "@/components/admin/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface EmptyStateConfig {
  icon: ElementType;
  title: string;
  description: string;
}

function AdminTableToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="admin-table-toolbar" className={cn("mb-6 flex flex-col gap-3", className)} {...props} />;
}

function AdminTableContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="admin-table-content"
      className={cn("overflow-clip rounded-md border bg-white", className)}
      {...props}
    />
  );
}

function AdminTablePagination({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  isPending = false,
}: {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isPending?: boolean;
}) {
  return (
    <CursorPagination
      hasPrevious={hasPrevious}
      hasNext={hasNext}
      onPrevious={onPrevious}
      onNext={onNext}
      isPending={isPending}
    />
  );
}

function AdminTable({
  isEmpty,
  isPending,
  emptyState,
  skeletonCellWidths,
  children,
}: {
  isEmpty: boolean;
  isPending: boolean;
  emptyState: EmptyStateConfig;
  skeletonCellWidths: string[];
  children: React.ReactNode;
}) {
  const Icon = emptyState.icon;

  if (!isPending && isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
        <Icon className="mb-4 size-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">{emptyState.title}</h3>
        <p className="text-sm text-muted-foreground">{emptyState.description}</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <AdminTableContent>
        <Table>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              // biome-ignore lint: skeleton items don't need stable keys
              <TableRow key={i}>
                {/* biome-ignore lint: skeleton cells don't need keys */}
                {skeletonCellWidths.map((width) => (
                  <TableCell key={width}>
                    <Skeleton className={cn("h-5", width)} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableContent>
    );
  }

  return <AdminTableContent>{children}</AdminTableContent>;
}

export { AdminTable, AdminTableContent, AdminTablePagination, AdminTableToolbar };
