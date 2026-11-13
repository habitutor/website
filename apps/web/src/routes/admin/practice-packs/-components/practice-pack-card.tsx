import { DotsThree, PencilSimple, Trash } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orpc } from "@/utils/orpc";

export type PracticePackCardData = {
  id: number;
  title: string;
  description: string | null;
};

export function PracticePackCard({ pack }: { pack: PracticePackCardData }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteMutation = useMutation(
    orpc.admin.practicePack.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Practice pack berhasil dihapus");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.practicePack.list.queryKey({ input: {} }),
        });
        setDeleteDialogOpen(false);
      },
      onError: (error) => {
        toast.error("Gagal menghapus practice pack", {
          description: error.message,
        });
      },
    }),
  );

  const handleDelete = () => {
    deleteMutation.mutate({ id: pack.id });
  };

  return (
    <>
      <Card className="group relative flex flex-col overflow-hidden rounded-sr-lg border-sr-line bg-linear-to-br from-white via-sr-blue-50/50 to-sr-sun-100/40 py-0 shadow-sr-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-sr-2">
        <Link
          to={"/admin/practice-packs/$id"}
          params={{
            id: String(pack.id),
          }}
          className="flex flex-1 flex-col px-6 py-6"
        >
          <div className="mb-4 flex-1">
            <h3 className="mb-2 text-lg font-black tracking-tight text-sr-ink transition-colors group-hover:text-sr-blue-600">
              {pack.title}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-sr-muted">
              {pack.description || "No description provided."}
            </p>
          </div>
        </Link>

        <div className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                <DotsThree className="size-5" weight="bold" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => navigate({ to: `/admin/practice-packs/${pack.id}` })}>
                <PencilSimple className="mr-2 size-4" />
                Edit Info
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 size-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Practice Pack?</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus "{pack.title}"? Tindakan ini tidak bisa dibatalkan dan semua soal di dalam pack ikut
              terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/80"
            >
              {deleteMutation.isPending ? "Menghapus…" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
