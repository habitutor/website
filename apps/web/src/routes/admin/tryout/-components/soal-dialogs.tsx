import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PlusIcon, ImageIcon, TrashIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc, queryClient, client } from "@/utils/orpc";
import { Image } from "@unpic/react";

// --- Helpers ---
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function ImageUploadPreview({
  url,
  onUpload,
  onRemove,
}: {
  url: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  return (
    <div className="mt-2">
      {url ? (
        <div className="group relative inline-block rounded-md border bg-white p-1">
          <Image src={url} alt="Uploaded preview" width={120} height={120} className="rounded object-contain" />
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 hidden h-6 w-6 p-0 group-hover:flex"
            onClick={onRemove}
            type="button"
          >
            <TrashIcon />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            id={`img-upload-${Math.random().toString(36).slice(2)}`}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUpload(e.target.files[0]);
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              input?.click();
            }}
          >
            <ImageIcon className="mr-2" /> Tambah Gambar
          </Button>
        </div>
      )}
    </div>
  );
}

// --- Add Soal Dialog ---
export function AddSoalDialog({ subtesId }: { subtesId: string }) {
  const [open, setOpen] = useState(false);
  const [pertanyaan, setPertanyaan] = useState("");
  const [gambarUrl, setGambarUrl] = useState<string | null>(null);
  const [poin, setPoin] = useState(20);
  const [options, setOptions] = useState([
    { label: "A", isi: "", isBenar: false, gambarUrl: null as string | null },
    { label: "B", isi: "", isBenar: false, gambarUrl: null as string | null },
    { label: "C", isi: "", isBenar: false, gambarUrl: null as string | null },
    { label: "D", isi: "", isBenar: false, gambarUrl: null as string | null },
    { label: "E", isi: "", isBenar: false, gambarUrl: null as string | null },
  ]);

  const createSoalMutation = useMutation(
    orpc.admin.tryout.create.soal.mutationOptions({
      onSuccess: async (data: unknown) => {
        const soalId = (data as { id: string }).id;
        const validOptions = options.filter((opt) => opt.isi.trim() || opt.gambarUrl);

        try {
          for (const opt of validOptions) {
            await client.admin.tryout.create.pilihan({
              soalId,
              label: opt.label,
              isi: opt.isi,
              isBenar: opt.isBenar,
              gambarUrl: opt.gambarUrl,
            });
          }
          toast.success("Soal dan pilihan jawaban berhasil ditambahkan");
          queryClient.invalidateQueries({
            queryKey: orpc.admin.tryout.list.soal.queryKey({ input: { subtesId } }),
          });

          setPertanyaan("");
          setGambarUrl(null);
          setPoin(20);
          setOptions([
            { label: "A", isi: "", isBenar: false, gambarUrl: null },
            { label: "B", isi: "", isBenar: false, gambarUrl: null },
            { label: "C", isi: "", isBenar: false, gambarUrl: null },
            { label: "D", isi: "", isBenar: false, gambarUrl: null },
            { label: "E", isi: "", isBenar: false, gambarUrl: null },
          ]);
          setOpen(false);
        } catch (err: unknown) {
          toast.error("Soal dibuat tapi gagal menambah pilihan", {
            description: err instanceof Error ? err.message : String(err),
          });
        }
      },
      onError: (err) => {
        toast.error("Gagal membuat soal", { description: err.message });
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pertanyaan.trim() && !gambarUrl) {
      toast.error("Pertanyaan atau gambar harus diisi");
      return;
    }

    const hasCorrectAnswer = options.some((opt) => opt.isBenar && (opt.isi.trim() || opt.gambarUrl));
    if (!hasCorrectAnswer) {
      toast.error("Pilih minimal satu jawaban yang benar dan isi jawabannya");
      return;
    }

    createSoalMutation.mutate({
      subtesId,
      pertanyaan,
      tipe: "pilgan",
      poin,
      gambarUrl,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="mr-1" /> Tambah Soal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Soal Baru</DialogTitle>
          <DialogDescription>Isi pertanyaan dan pilihan jawaban. Tandai jawaban yang benar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Pertanyaan</Label>
            <Textarea
              placeholder="Tuliskan pertanyaan..."
              value={pertanyaan}
              onChange={(e) => setPertanyaan(e.target.value)}
              rows={3}
            />
            <ImageUploadPreview
              url={gambarUrl}
              onUpload={async (f) => setGambarUrl(await fileToBase64(f))}
              onRemove={() => setGambarUrl(null)}
            />
          </div>

          <div className="space-y-2">
            <Label>Poin</Label>
            <Input
              type="number"
              min={1}
              value={poin}
              onChange={(e) => setPoin(Number(e.target.value))}
              className="w-32"
            />
          </div>

          <div className="space-y-3">
            <Label>Pilihan Jawaban</Label>
            {options.map((opt, idx) => (
              <div key={opt.label} className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100 font-bold text-gray-700">
                  {opt.label}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder={`Isi pilihan ${opt.label}...`}
                    value={opt.isi}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[idx].isi = e.target.value;
                      setOptions(newOpts);
                    }}
                  />
                  <ImageUploadPreview
                    url={opt.gambarUrl}
                    onUpload={async (f) => {
                      const base64 = await fileToBase64(f);
                      const newOpts = [...options];
                      newOpts[idx].gambarUrl = base64;
                      setOptions(newOpts);
                    }}
                    onRemove={() => {
                      const newOpts = [...options];
                      newOpts[idx].gambarUrl = null;
                      setOptions(newOpts);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant={opt.isBenar ? "default" : "outline"}
                  size="sm"
                  className={opt.isBenar ? "mt-1 bg-green-600 hover:bg-green-700" : "mt-1"}
                  onClick={() => {
                    const newOpts = options.map((o, i) => ({
                      ...o,
                      isBenar: i === idx,
                    }));
                    setOptions(newOpts);
                  }}
                >
                  {opt.isBenar ? "✓ Benar" : "Benar?"}
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={createSoalMutation.isPending}>
            {createSoalMutation.isPending ? "Menyimpan..." : "Simpan Soal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Detail Soal Dialog ---
export function DetailSoalDialog({
  soalId,
  open,
  onOpenChange,
}: {
  soalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isPending } = useQuery({
    ...orpc.admin.tryout.detail.soal.queryOptions({ input: { soalId } }),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Soal</DialogTitle>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="rounded-lg bg-muted/30 p-4">
              <div className="mb-2 flex items-start justify-between">
                <span className="rounded bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
                  Poin: {data.poin}
                </span>
                <span className="text-xs text-muted-foreground uppercase">{data.tipe}</span>
              </div>
              <p className="font-medium whitespace-pre-wrap">{data.pertanyaan}</p>
              {data.gambarUrl && (
                <div className="mt-4">
                  <Image
                    src={data.gambarUrl}
                    alt="Gambar Soal"
                    width={400}
                    height={300}
                    className="rounded border bg-white object-contain"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Pilihan Jawaban:</Label>
              {data.pilihanJawaban?.map(
                (pil: { id: string; label: string; isi: string; isBenar: boolean; gambarUrl: string | null }) => (
                  <div
                    key={pil.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                      pil.isBenar ? "border-green-200 bg-green-50" : "bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-bold ${
                        pil.isBenar ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {pil.label}
                    </div>
                    <div className="flex-1">
                      {pil.isi && <p className={pil.isBenar ? "font-medium" : ""}>{pil.isi}</p>}
                      {pil.gambarUrl && (
                        <div className="mt-2">
                          <Image
                            src={pil.gambarUrl}
                            alt={`Gambar opsi ${pil.label}`}
                            width={200}
                            height={150}
                            className="rounded border bg-white object-contain"
                          />
                        </div>
                      )}
                    </div>
                    {pil.isBenar && (
                      <span className="mt-1 flex shrink-0 text-sm font-bold text-green-600">✓ Jawaban Benar</span>
                    )}
                  </div>
                ),
              )}
            </div>

            {data.pembahasan || data.pembahasanGambar ? (
              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <Label className="mb-2 block text-base font-semibold text-blue-900">Pembahasan:</Label>
                {data.pembahasan && <div className="text-sm whitespace-pre-wrap">{data.pembahasan}</div>}
                {data.pembahasanGambar && (
                  <div className="mt-3">
                    <Image
                      src={data.pembahasanGambar}
                      alt="Gambar Pembahasan"
                      width={400}
                      height={300}
                      className="rounded border border-blue-200 bg-white object-contain"
                    />
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="py-4 text-center text-muted-foreground">Data soal tidak ditemukan.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- Edit Soal Dialog ---
export function EditSoalDialog({
  subtesId,
  soalId,
  open,
  onOpenChange,
}: {
  subtesId: string;
  soalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pertanyaan, setPertanyaan] = useState("");
  const [gambarUrl, setGambarUrl] = useState<string | null>(null);
  const [poin, setPoin] = useState(20);
  const [options, setOptions] = useState<
    Array<{ id?: string; label: string; isi: string; isBenar: boolean; gambarUrl: string | null }>
  >([]);

  const { data, isPending } = useQuery({
    ...orpc.admin.tryout.detail.soal.queryOptions({ input: { soalId } }),
    enabled: open,
  });

  useEffect(() => {
    if (data) {
      setPertanyaan(data.pertanyaan);
      setGambarUrl(data.gambarUrl || null);
      setPoin(data.poin);

      const existingOptions = data.pilihanJawaban || [];
      const labels = ["A", "B", "C", "D", "E"];

      const mappedOptions = labels.map((label) => {
        const ext = existingOptions.find(
          (o: { label: string; id: string; isi: string; isBenar: boolean; gambarUrl: string | null }) =>
            o.label === label,
        );
        if (ext) {
          return {
            id: ext.id,
            label: ext.label,
            isi: ext.isi || "",
            isBenar: ext.isBenar,
            gambarUrl: ext.gambarUrl || null,
          };
        }
        return { label, isi: "", isBenar: false, gambarUrl: null };
      });

      setOptions(mappedOptions);
    }
  }, [data]);

  const updateSoalMutation = useMutation(
    orpc.admin.tryout.update.soal.mutationOptions({
      onSuccess: async () => {
        try {
          for (const opt of options) {
            if (opt.isi.trim() || opt.gambarUrl || opt.id) {
              if (opt.id) {
                await client.admin.tryout.update.pilihan({
                  pilihanId: opt.id,
                  label: opt.label,
                  isi: opt.isi,
                  isBenar: opt.isBenar,
                  gambarUrl: opt.gambarUrl,
                });
              } else {
                await client.admin.tryout.create.pilihan({
                  soalId,
                  label: opt.label,
                  isi: opt.isi,
                  isBenar: opt.isBenar,
                  gambarUrl: opt.gambarUrl,
                });
              }
            }
          }
          toast.success("Soal berhasil diperbarui");
          queryClient.invalidateQueries({
            queryKey: orpc.admin.tryout.list.soal.queryKey({ input: { subtesId } }),
          });
          queryClient.invalidateQueries({
            queryKey: orpc.admin.tryout.detail.soal.queryKey({ input: { soalId } }),
          });
          onOpenChange(false);
        } catch (err: unknown) {
          toast.error("Soal diperbarui tapi gagal mengupdate pilihan", {
            description: err instanceof Error ? err.message : String(err),
          });
        }
      },
      onError: (err) => {
        toast.error("Gagal memperbarui soal", { description: err.message });
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pertanyaan.trim() && !gambarUrl) {
      toast.error("Pertanyaan atau gambar harus diisi");
      return;
    }

    const hasCorrectAnswer = options.some((opt) => opt.isBenar && (opt.isi.trim() || opt.gambarUrl));
    if (!hasCorrectAnswer) {
      toast.error("Pilih minimal satu jawaban yang benar dan isi jawabannya");
      return;
    }

    updateSoalMutation.mutate({
      soalId,
      pertanyaan,
      poin,
      gambarUrl,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Soal</DialogTitle>
          <DialogDescription>Perbarui pertanyaan dan pilihan jawaban.</DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Pertanyaan</Label>
              <Textarea
                placeholder="Tuliskan pertanyaan..."
                value={pertanyaan}
                onChange={(e) => setPertanyaan(e.target.value)}
                rows={3}
              />
              <ImageUploadPreview
                url={gambarUrl}
                onUpload={async (f) => setGambarUrl(await fileToBase64(f))}
                onRemove={() => setGambarUrl(null)}
              />
            </div>

            <div className="space-y-2">
              <Label>Poin</Label>
              <Input
                type="number"
                min={1}
                value={poin}
                onChange={(e) => setPoin(Number(e.target.value))}
                className="w-32"
              />
            </div>

            <div className="space-y-3">
              <Label>Pilihan Jawaban</Label>
              {options.map((opt, idx) => (
                <div key={opt.label} className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100 font-bold text-gray-700">
                    {opt.label}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder={`Isi pilihan ${opt.label}...`}
                      value={opt.isi}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx].isi = e.target.value;
                        setOptions(newOpts);
                      }}
                    />
                    <ImageUploadPreview
                      url={opt.gambarUrl}
                      onUpload={async (f) => {
                        const base64 = await fileToBase64(f);
                        const newOpts = [...options];
                        newOpts[idx].gambarUrl = base64;
                        setOptions(newOpts);
                      }}
                      onRemove={() => {
                        const newOpts = [...options];
                        newOpts[idx].gambarUrl = null;
                        setOptions(newOpts);
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant={opt.isBenar ? "default" : "outline"}
                    size="sm"
                    className={opt.isBenar ? "mt-1 bg-green-600 hover:bg-green-700" : "mt-1"}
                    onClick={() => {
                      const newOpts = options.map((o, i) => ({
                        ...o,
                        isBenar: i === idx,
                      }));
                      setOptions(newOpts);
                    }}
                  >
                    {opt.isBenar ? "✓ Benar" : "Benar?"}
                  </Button>
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full" disabled={updateSoalMutation.isPending}>
              {updateSoalMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
