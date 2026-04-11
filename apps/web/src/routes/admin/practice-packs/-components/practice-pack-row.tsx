import { DotsThree, PencilSimple, Trash } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { orpc } from "@/utils/orpc";

interface PracticePackRowProps {
  pack: {
    id: number;
    title: string;
    description: string | null;
  };
}

export function PracticePackRow({ pack }: PracticePackRowProps) {
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

  return (
    <>
      <TableRow
        className="group cursor-pointer"
        onClick={() => navigate({ to: "/admin/practice-packs/$id", params: { id: String(pack.id) } })}
      >
        <TableCell className="font-medium group-hover:underline">{pack.title}</TableCell>
        <TableCell className="max-w-xs truncate text-muted-foreground">
          {pack.description || "No description provided."}
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <DotsThree className="size-5" weight="bold" />
                <span className="sr-only">Open menu</span>
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
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Practice Pack?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{pack.title}&quot;? This action cannot be undone and will remove all
              associated questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate({ id: pack.id })}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/80"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
