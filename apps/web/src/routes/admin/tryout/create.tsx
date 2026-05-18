import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { orpc, queryClient } from "@/utils/orpc";
import { useState } from "react";

export const Route = createFileRoute("/admin/tryout/create")({
  component: CreateTryoutPage,
});

function CreateTryoutPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
  }>({
    title: "",
    description: "",
  });

  const createMutation = useMutation(
    orpc.admin.tryout.create.tryout.mutationOptions({
      onSuccess: () => {
        toast.success("Tryout berhasil dibuat");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.list.tryout.queryKey({ input: {} }),
        });
        navigate({ to: "/admin/tryout" });
      },
      onError: (err) => {
        toast.error("Gagal membuat tryout", {
          description: err.message,
        });
      },
    }),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Judul tryout harus diisi");
      return;
    }

    createMutation.mutate({
      judul: formData.title,
      deskripsi: formData.description || null,
    });
  };

  return (
    <AdminContainer>
      <AdminHeader title="Buat Tryout Baru" description="Tambahkan simulasi ujian baru" />

      <Card>
        <CardHeader>
          <CardTitle>Informasi Tryout</CardTitle>
          <CardDescription>Isi detail tryout yang akan dibuat</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul Tryout</Label>
              <Input
                id="title"
                placeholder="UTBK 2024 - Simulasi 1"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi singkat tryout..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Menyimpan..." : "Buat Tryout"}
              </Button>
              <Button variant="outline" type="button" onClick={() => window.history.back()}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Subtest Section - akan ditambah setelah tryout dibuat */}
      <Card className="pointer-events-none mt-6 opacity-50">
        <CardHeader>
          <CardTitle>Subtest</CardTitle>
          <CardDescription>Tambahkan subtest setelah membuat tryout</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Buat tryout terlebih dahulu untuk menambahkan subtest</p>
        </CardContent>
      </Card>
    </AdminContainer>
  );
}
