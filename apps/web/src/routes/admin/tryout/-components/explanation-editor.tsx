import {
  CaretDownIcon,
  CheckCircleIcon,
  FloppyDiskIcon,
  PencilIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { orpc, queryClient } from "@/utils/orpc";
import { ImageUploadPreview, fileToBase64 } from "./soal-dialogs";

type PilihanItem = { id: string; label: string; isi: string; isBenar: boolean; gambarUrl?: string | null };

type ExplanationSoal = {
  id: string;
  pertanyaan: string;
  tipe: string;
  gambarUrl?: string | null;
  pembahasan?: string | null;
  pembahasanGambar?: string | null;
  pilihanJawaban?: PilihanItem[];
};

type ExplanationSubtest = { id: string; namaSubtes: string };

const hasPembahasan = (soal: ExplanationSoal) => Boolean(soal.pembahasan?.trim() || soal.pembahasanGambar);

interface ExplanationEditorProps {
  questionId: string;
  subtestId: string;
  currentExplanation?: string | null;
  currentGambarUrl?: string | null;
}

export function ExplanationEditor({
  questionId,
  subtestId,
  currentExplanation = "",
  currentGambarUrl = null,
}: ExplanationEditorProps) {
  const hasExisting = Boolean(currentExplanation?.trim() || currentGambarUrl);
  const [isEditing, setIsEditing] = useState(!hasExisting);
  const [explanation, setExplanation] = useState(currentExplanation || "");
  const [gambarUrl, setGambarUrl] = useState<string | null>(currentGambarUrl);

  const updateSoalMutation = useMutation(
    orpc.admin.tryout.update.soal.mutationOptions({
      onSuccess: () => {
        toast.success("Pembahasan berhasil disimpan");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.list.soal.queryKey({ input: { subtesId: subtestId } }),
        });
        setIsEditing(false);
      },
      onError: (err) => {
        toast.error("Gagal menyimpan pembahasan", { description: err.message });
      },
    }),
  );

  const handleSave = () => {
    updateSoalMutation.mutate({
      soalId: questionId,
      pembahasan: explanation,
      pembahasanGambar: gambarUrl,
    });
  };

  const handleCancel = () => {
    setExplanation(currentExplanation || "");
    setGambarUrl(currentGambarUrl);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={`pembahasan-${questionId}`}>Tulis pembahasan</Label>
          <Textarea
            id={`pembahasan-${questionId}`}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Jelaskan langkah dan alasan jawaban yang benar..."
            rows={8}
            className="bg-white leading-relaxed"
          />
          <p className="text-xs text-sr-muted">Gunakan baris baru untuk memisahkan langkah penyelesaian.</p>
        </div>
        <ImageUploadPreview
          url={gambarUrl}
          onUpload={async (f) => setGambarUrl(await fileToBase64(f))}
          onRemove={() => setGambarUrl(null)}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={updateSoalMutation.isPending}>
            <FloppyDiskIcon className="mr-1.5" />
            {updateSoalMutation.isPending ? "Menyimpan..." : "Simpan Pembahasan"}
          </Button>
          {hasExisting && (
            <Button size="sm" variant="outline" onClick={handleCancel} disabled={updateSoalMutation.isPending}>
              <XIcon className="mr-1.5" />
              Batal
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-sr-muted uppercase">Pembahasan</span>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <PencilIcon className="mr-1.5" />
          Edit
        </Button>
      </div>
      <div className="rounded-lg border bg-white p-4 text-sm leading-relaxed">
        {explanation && <p className="whitespace-pre-wrap">{explanation}</p>}
        {gambarUrl && (
          <Image
            src={gambarUrl}
            alt="Gambar pembahasan"
            width={400}
            height={300}
            className={cn("rounded border bg-white object-contain", explanation && "mt-4")}
          />
        )}
      </div>
    </div>
  );
}

function SoalContext({ soal }: { soal: ExplanationSoal }) {
  const pilihan = [...(soal.pilihanJawaban ?? [])].sort((a, b) => a.label.localeCompare(b.label));
  const kunci = pilihan.filter((p) => p.isBenar).map((p) => p.label);

  return (
    <div className="space-y-3">
      <span className="text-xs font-bold tracking-wider text-sr-muted uppercase">Soal</span>
      <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border bg-white p-4 text-sm">
        {soal.pertanyaan
          .split(/\n+/)
          .filter((line) => line.trim() !== "")
          .map((line, i) => (
            <p key={i.toString()} className="leading-relaxed wrap-break-word">
              {line}
            </p>
          ))}
        {soal.gambarUrl && (
          <Image
            src={soal.gambarUrl}
            alt="Gambar soal"
            width={320}
            height={200}
            className="rounded border object-contain"
          />
        )}
      </div>
      <div className="space-y-1.5">
        {pilihan.map((opt) => (
          <div
            key={opt.id}
            className={cn(
              "flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-sm",
              opt.isBenar ? "border-emerald-300 bg-emerald-50" : "border-sr-line bg-white",
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                opt.isBenar ? "bg-emerald-600 text-white" : "bg-muted",
              )}
            >
              {opt.label}
            </span>
            <span className="pt-0.5 wrap-break-word">{opt.isi || (opt.gambarUrl ? "(gambar)" : "-")}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-sr-muted">
        Kunci jawaban:{" "}
        <strong className="text-emerald-700">{kunci.length > 0 ? kunci.join(", ") : "belum diatur"}</strong>
      </p>
    </div>
  );
}

function ExplanationRow({ soal, nomor, subtestId }: { soal: ExplanationSoal; nomor: number; subtestId: string }) {
  const [expanded, setExpanded] = useState(false);
  const done = hasPembahasan(soal);

  return (
    <div className={cn("overflow-hidden rounded-lg border", expanded ? "border-primary/40" : "border-sr-line")}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 bg-white px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {nomor}
        </span>
        <span className="line-clamp-1 min-w-0 flex-1 text-sm">{soal.pertanyaan || "(soal bergambar)"}</span>
        {soal.tipe === "multiple" && (
          <span className="hidden shrink-0 rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 sm:inline">
            Jawaban ganda
          </span>
        )}
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            done ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900",
          )}
        >
          {done ? <CheckCircleIcon weight="fill" /> : <WarningCircleIcon weight="fill" />}
          <span className="hidden sm:inline">{done ? "Sudah ada" : "Belum ada"}</span>
        </span>
        <CaretDownIcon className={cn("size-4 shrink-0 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="grid gap-5 border-t bg-muted/20 p-4 lg:grid-cols-2">
          <SoalContext soal={soal} />
          <ExplanationEditor
            subtestId={subtestId}
            questionId={soal.id}
            currentExplanation={soal.pembahasan}
            currentGambarUrl={soal.pembahasanGambar}
          />
        </div>
      )}
    </div>
  );
}

export function SubtestExplanationCard({ subtest }: { subtest: ExplanationSubtest }) {
  const [open, setOpen] = useState(false);
  const [onlyMissing, setOnlyMissing] = useState(false);

  const { data, isPending } = useQuery(orpc.admin.tryout.list.soal.queryOptions({ input: { subtesId: subtest.id } }));
  const soalList = (data ?? []) as ExplanationSoal[];
  const total = soalList.length;
  const done = soalList.filter(hasPembahasan).length;
  const missing = total - done;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const rows = soalList
    .map((soal, idx) => ({ soal, nomor: idx + 1 }))
    .filter(({ soal }) => !onlyMissing || !hasPembahasan(soal));

  return (
    <Card className="sr-lift overflow-hidden rounded-sr-xl border-sr-line shadow-sr-1">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <CardTitle className="text-base">{subtest.namaSubtes}</CardTitle>
          {isPending ? (
            <Skeleton className="h-4 w-48" />
          ) : (
            <>
              <CardDescription>
                {total} soal · {done} sudah ada pembahasan
              </CardDescription>
              {total > 0 && (
                <div
                  className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Kelengkapan pembahasan ${subtest.namaSubtes}`}
                >
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isPending &&
            (total === 0 ? (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-sr-muted">
                Belum ada soal
              </span>
            ) : missing === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                <CheckCircleIcon weight="fill" /> Lengkap
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                <WarningCircleIcon weight="fill" /> {missing} belum
              </span>
            ))}
          <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)} disabled={total === 0}>
            {open ? "Sembunyikan" : "Kelola Pembahasan"}
          </Button>
        </div>
      </CardHeader>

      {open && total > 0 && (
        <CardContent className="space-y-3 border-t pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant={onlyMissing ? "outline" : "default"} onClick={() => setOnlyMissing(false)}>
              Semua ({total})
            </Button>
            <Button size="sm" variant={onlyMissing ? "default" : "outline"} onClick={() => setOnlyMissing(true)}>
              Belum ada pembahasan ({missing})
            </Button>
          </div>

          {rows.length === 0 ? (
            <p className="rounded-lg border border-dashed py-6 text-center text-sm text-sr-muted">
              Semua soal di subtest ini sudah punya pembahasan.
            </p>
          ) : (
            <div className="space-y-2">
              {rows.map(({ soal, nomor }) => (
                <ExplanationRow key={soal.id} soal={soal} nomor={nomor} subtestId={subtest.id} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
