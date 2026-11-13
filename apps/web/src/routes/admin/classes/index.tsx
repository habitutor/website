import { BooksIcon, PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { SubtestCard } from "@/components/classes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { ClassFormDialog } from "./-components/class-form-dialog";

export const Route = createFileRoute("/admin/classes/")({
  component: RouteComponent,
});

function RouteComponent() {
  const subtests = useQuery(orpc.subtest.list.queryOptions({ input: {} }));
  const [addOpen, setAddOpen] = useState(false);
  const items = subtests.data?.data ?? [];
  const nextOrder = Math.max(1, ...items.map((item) => item.order ?? 1)) + 1;

  return (
    <AdminContainer>
      <AdminHeader title="Kelas" description="Kelola kelas belajar beserta kontennya">
        <Button onClick={() => setAddOpen(true)}>
          <PlusIcon weight="bold" className="size-4" />
          Tambah Kelas
        </Button>
      </AdminHeader>
      <ClassFormDialog open={addOpen} onOpenChange={setAddOpen} nextOrder={nextOrder} />

      <div className="space-y-4">
        {subtests.isPending && (
          <div className="grid h-full grid-cols-1 gap-2 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i.toString()} className="h-40 w-full" />
            ))}
          </div>
        )}

        {subtests.isError && <p className="text-destructive">Gagal memuat kelas: {subtests.error.message}</p>}

        {subtests.data && items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-sr-xl border-2 border-dashed border-sr-blue-200 bg-white/60 p-12 text-center">
            <BooksIcon className="text-sr-blue-400 mb-4 size-12" />
            <h3 className="mb-2 text-lg font-black text-sr-ink">Belum ada kelas</h3>
            <p className="mb-4 text-sm text-sr-muted">Mulai dengan menambahkan kelas pertama.</p>
            <Button onClick={() => setAddOpen(true)}>
              <PlusIcon weight="bold" className="size-4" />
              Tambah Kelas
            </Button>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid h-full grid-cols-1 gap-2 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((subtest) => (
              <SubtestCard key={subtest.id} subtest={subtest} />
            ))}
          </div>
        )}
      </div>
    </AdminContainer>
  );
}
