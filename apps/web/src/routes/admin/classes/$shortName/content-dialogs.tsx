import { useForm } from "@tanstack/react-form";
import { useMutation, type QueryClient } from "@tanstack/react-query";
import { type } from "arktype";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BodyOutputs } from "@/utils/orpc";
import { orpc } from "@/utils/orpc";

type ContentType = "material" | "tips_and_trick";
export type ContentListItem = NonNullable<BodyOutputs["subtest"]["content"]["list"]>[number];

type UseContentDialogsOptions = {
  matchedClassId: number | null;
  contentItems: ContentListItem[] | undefined;
  activeFilter: "all" | ContentType;
  queryClient: QueryClient;
};

export function useContentDialogs({
  matchedClassId,
  contentItems,
  activeFilter,
  queryClient,
}: UseContentDialogsOptions) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogType, setCreateDialogType] = useState<ContentType>("material");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentListItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ContentListItem | null>(null);

  const createMutation = useMutation(
    orpc.admin.subtest.content.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries();
        setCreateDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Gagal membuat konten");
      },
    }),
  );

  const updateMutation = useMutation(
    orpc.admin.subtest.content.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries();
        setEditDialogOpen(false);
        setEditingItem(null);
      },
      onError: (error) => {
        toast.error(error.message || "Gagal memperbarui konten");
      },
    }),
  );

  const deleteMutation = useMutation(
    orpc.admin.subtest.content.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries();
        setDeleteDialogOpen(false);
        setDeletingItem(null);
      },
      onError: (error) => {
        toast.error(error.message || "Gagal menghapus konten");
      },
    }),
  );

  const reorderMutation = useMutation(
    orpc.admin.subtest.content.reorder.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries();
      },
      onError: (error) => {
        toast.error(error.message || "Gagal mengubah urutan konten");
      },
    }),
  );

  const createForm = useForm({
    defaultValues: {
      title: "",
      withNote: true,
    },
    onSubmit: async ({ value }) => {
      if (!matchedClassId) return;
      const maxOrder =
        contentItems && contentItems.length > 0 ? Math.max(...contentItems.map((item) => item.order ?? 0)) : 0;

      if (!value.withNote) {
        toast.error("Konten baru harus memiliki minimal satu komponen. Aktifkan catatan materi.");
        return;
      }

      createMutation.mutate({
        subtestId: matchedClassId,
        type: createDialogType,
        title: value.title,
        order: maxOrder + 1,
        note: value.withNote ? { content: {} } : undefined,
      });
    },
    validators: {
      onSubmit: type({
        title: "string >= 1",
      }),
    },
  });

  const editForm = useForm({
    defaultValues: {
      title: "",
    },
    onSubmit: async ({ value }) => {
      if (!editingItem) return;
      updateMutation.mutate({
        id: editingItem.id,
        title: value.title,
      });
    },
    validators: {
      onSubmit: type({
        title: "string >= 1",
      }),
    },
  });

  const openCreateDialog = (type: ContentType) => {
    setCreateDialogType(type);
    setCreateDialogOpen(true);
    createForm.reset();
  };

  const openEditDialog = (item: ContentListItem) => {
    setEditingItem(item);
    editForm.setFieldValue("title", item.title);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (item: ContentListItem) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleReorder = (newItems: ContentListItem[]) => {
    if (!matchedClassId || newItems.length === 0) return;

    if (activeFilter === "all") {
      return;
    }

    const items = newItems.map((item, index) => ({
      id: item.id,
      order: index + 1,
    }));

    reorderMutation.mutate({
      subtestId: matchedClassId,
      type: activeFilter,
      items,
    });
  };

  return {
    createDialogOpen,
    setCreateDialogOpen,
    createDialogType,
    editDialogOpen,
    setEditDialogOpen,
    editingItem,
    setEditingItem,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingItem,
    createMutation,
    updateMutation,
    deleteMutation,
    createForm,
    editForm,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    handleReorder,
  };
}

type ContentDialogsProps = {
  controller: ReturnType<typeof useContentDialogs>;
};

export function ContentDialogs({ controller }: ContentDialogsProps) {
  return (
    <>
      <Dialog open={controller.createDialogOpen} onOpenChange={controller.setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Konten</DialogTitle>
            <DialogDescription>
              Buat konten baru untuk {controller.createDialogType === "material" ? "Materi" : "Tips & Trick"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              controller.createForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <controller.createForm.Field name="title">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Judul</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Masukkan judul konten"
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-sm text-red-500">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </controller.createForm.Field>
            <controller.createForm.Field name="withNote">
              {(field) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
                  />
                  <Label htmlFor={field.name} className="text-sm font-normal">
                    Buat catatan materi awal (minimal satu komponen per konten)
                  </Label>
                </div>
              )}
            </controller.createForm.Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => controller.setCreateDialogOpen(false)}>
                Batal
              </Button>
              <controller.createForm.Subscribe>
                {(state) => (
                  <Button type="submit" disabled={!state.canSubmit || controller.createMutation.isPending}>
                    {controller.createMutation.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                )}
              </controller.createForm.Subscribe>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={controller.editDialogOpen} onOpenChange={controller.setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Konten</DialogTitle>
            <DialogDescription>Ubah judul konten</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              controller.editForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <controller.editForm.Field name="title">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Judul</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Masukkan judul konten"
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-sm text-red-500">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </controller.editForm.Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  controller.setEditDialogOpen(false);
                  controller.setEditingItem(null);
                }}
              >
                Batal
              </Button>
              <controller.editForm.Subscribe>
                {(state) => (
                  <Button type="submit" disabled={!state.canSubmit || controller.updateMutation.isPending}>
                    {controller.updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                )}
              </controller.editForm.Subscribe>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={controller.deleteDialogOpen} onOpenChange={controller.setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Konten?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus konten "{controller.deletingItem?.title}"? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => controller.setDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (controller.deletingItem) {
                  controller.deleteMutation.mutate({ id: controller.deletingItem.id });
                }
              }}
              disabled={controller.deleteMutation.isPending}
            >
              {controller.deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
