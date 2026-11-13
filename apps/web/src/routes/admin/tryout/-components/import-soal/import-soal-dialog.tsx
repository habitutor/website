import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircleIcon, ClipboardTextIcon, EyeIcon, InfoIcon, TrashIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { orpc, queryClient } from "@/utils/orpc";
import { clipboardToText } from "./clipboard-to-text";
import { CONTOH_FORMAT, FormatGuide } from "./format-guide";
import { normalizeForCompare, parseSoalText, toImportPayload } from "./parse-soal-text";
import { SoalPreviewCard } from "./soal-preview-card";
import { LockedTryoutNotice, useTryoutHasSesi } from "../locked-tryout-notice";

const DEFAULT_POIN = 20;
const EXISTING_DUPLICATE_WARNING = "Pertanyaan sama persis dengan soal yang sudah ada di subtes ini";

function draftKey(subtesId: string) {
  return `habitutor:import-soal:${subtesId}`;
}

function readDraft(key: string) {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeDraft(key: string, value: string) {
  try {
    if (value.trim()) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    // Penyimpanan browser tidak tersedia (mode privat, dsb.) — draf hanya hilang saat dialog ditutup.
  }
}

function apiErrorMessage(error: Error) {
  const { data, status } = error as Error & { data?: { message?: unknown }; status?: number };
  if (typeof data?.message === "string") return data.message;
  // 404 tanpa pesan dari modul tryout = endpoint impor belum ada di server (server belum di-restart/deploy).
  if (status === 404) return "Fitur impor belum aktif di server. Restart atau deploy ulang server API, lalu coba lagi.";
  return error.message;
}

export function ImportSoalDialog({
  tryoutId,
  subtesId,
  namaSubtes,
  jumlahSoalTarget,
  existingPertanyaan,
}: {
  tryoutId: string;
  subtesId: string;
  namaSubtes: string;
  jumlahSoalTarget: number;
  existingPertanyaan: string[];
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [poin, setPoin] = useState(DEFAULT_POIN);
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [rightTab, setRightTab] = useState<"panduan" | "pratinjau">("panduan");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const key = draftKey(subtesId);

  useEffect(() => {
    if (!open) return;
    const draft = readDraft(key);
    setText(draft);
    setRightTab(draft.trim() ? "pratinjau" : "panduan");
  }, [open, key]);

  const updateText = (next: string) => {
    if (!text.trim() && next.trim()) setRightTab("pratinjau");
    setText(next);
  };

  const insertTemplate = (template: string) => {
    setText((prev) => (prev.trim() ? `${prev.trimEnd()}\n\n${template}` : template));
    toast.success("Template ditambahkan ke kotak teks. Ganti isinya dengan soal Anda.");
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
      el.scrollTop = el.scrollHeight;
    });
  };

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => writeDraft(key, text), 400);
    return () => clearTimeout(timer);
  }, [open, key, text]);

  const { hasSesi } = useTryoutHasSesi(tryoutId, open);

  const deferredText = useDeferredValue(text);
  const isParsing = deferredText !== text;
  const result = useMemo(() => parseSoalText(deferredText), [deferredText]);

  const existingSet = useMemo(() => new Set(existingPertanyaan.map(normalizeForCompare)), [existingPertanyaan]);
  const extraWarnings = useMemo(
    () =>
      new Map(
        result.soal.map((s) => [
          s.index,
          existingSet.has(normalizeForCompare(s.pertanyaan)) ? [EXISTING_DUPLICATE_WARNING] : [],
        ]),
      ),
    [result, existingSet],
  );

  const total = result.soal.length;
  const invalidCount = result.soal.filter((s) => s.errors.length > 0).length;
  const warnedCount = result.soal.filter(
    (s) => s.errors.length === 0 && s.warnings.length + (extraWarnings.get(s.index)?.length ?? 0) > 0,
  ).length;
  const visibleSoal = onlyProblems
    ? result.soal.filter(
        (s) => s.errors.length > 0 || s.warnings.length + (extraWarnings.get(s.index)?.length ?? 0) > 0,
      )
    : result.soal;
  const totalAfter = existingPertanyaan.length + total;
  const nextNumber = result.soal.reduce((max, s) => Math.max(max, s.nomor), 0) + 1;
  const multipleCount = result.soal.filter((s) => s.tipe === "multiple").length;
  const jumlahAkanBerubah = total > 0 && totalAfter !== jumlahSoalTarget;
  const poinValid = Number.isInteger(poin) && poin >= 1 && poin <= 1000;

  const importMutation = useMutation(
    orpc.admin.tryout.create.soalBulk.mutationOptions({
      onSuccess: (data) => {
        toast.success(`${data.count} soal berhasil diimpor ke ${namaSubtes}`, {
          description:
            data.jumlahSoal !== data.jumlahSoalSebelumnya
              ? `Jumlah soal subtes disesuaikan otomatis: ${data.jumlahSoalSebelumnya} → ${data.jumlahSoal} soal.`
              : undefined,
        });
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.list.soal.queryKey({ input: { subtesId } }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.list.subtes.queryKey({ input: { tryoutId } }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.detail.subtes.queryKey({ input: { subtesId } }),
        });
        writeDraft(key, "");
        setText("");
        setConfirmOpen(false);
        setOpen(false);
      },
      onError: (err) => {
        setConfirmOpen(false);
        toast.error("Gagal mengimpor soal. Tidak ada soal yang tersimpan.", { description: apiErrorMessage(err) });
      },
    }),
  );

  const blockReason = hasSesi
    ? "Tryout ini sudah pernah dikerjakan siswa. Impor massal dinonaktifkan agar soal dan skor antarsiswa tetap sama."
    : (result.errors[0] ??
      (invalidCount > 0
        ? `${invalidCount} soal perlu diperbaiki dulu.`
        : !poinValid
          ? "Poin harus bilangan bulat 1–1000."
          : null));
  const canSave = total > 0 && !blockReason && !isParsing && !importMutation.isPending;

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!e.clipboardData.getData("text/html")) return;
    e.preventDefault();
    const pasted = clipboardToText(e.clipboardData);
    // insertText menjaga riwayat undo (Ctrl+Z) dan memicu onChange seperti paste biasa.
    if (document.execCommand?.("insertText", false, pasted)) return;
    const el = e.currentTarget;
    const start = el.selectionStart;
    setText(text.slice(0, start) + pasted + text.slice(el.selectionEnd));
    requestAnimationFrame(() => el.setSelectionRange(start + pasted.length, start + pasted.length));
  };

  const jumpToLine = (line: number) => {
    const el = textareaRef.current;
    if (!el) return;
    const lines = text.split("\n");
    const start = lines.slice(0, line).reduce((sum, l) => sum + l.length + 1, 0);
    const end = start + (lines[line]?.length ?? 0);
    el.focus();
    el.setSelectionRange(start, end);
    const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight) || 18;
    el.scrollTop = Math.max(0, line * lineHeight - el.clientHeight / 3);
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const clearText = () => {
    setText("");
    writeDraft(key, "");
    setRightTab("panduan");
    setClearOpen(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !importMutation.isPending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <ClipboardTextIcon className="mr-1" /> Impor dari Teks
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[92vh] max-h-[92vh] flex-col gap-3 p-4 sm:max-w-6xl sm:p-6">
        <DialogHeader>
          <DialogTitle>Impor Soal dari Teks · {namaSubtes}</DialogTitle>
          <DialogDescription>
            Salin soal dari Word, Google Docs, atau AI, tempel di kiri, periksa pratinjau di kanan, lalu simpan. Belum
            tahu formatnya? Buka tab Panduan & Template untuk menyalin template soal pilihan ganda maupun multiple
            answer. Soal yang diimpor ditambahkan di akhir daftar; soal yang sudah ada tidak berubah atau tertimpa.
          </DialogDescription>
        </DialogHeader>

        {hasSesi && <LockedTryoutNotice tryoutId={tryoutId} onDone={() => setOpen(false)} />}

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto lg:grid lg:grid-cols-2 lg:overflow-hidden">
          <section className="flex shrink-0 flex-col gap-2 lg:min-h-0 lg:shrink">
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor={`import-text-${subtesId}`} className="mr-auto">
                Tempel soal di sini
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!!text.trim()}
                onClick={() => updateText(CONTOH_FORMAT)}
              >
                Isi contoh
              </Button>
              <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" disabled={!text}>
                    <TrashIcon className="mr-1" /> Kosongkan
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader className="items-center text-center sm:items-center sm:text-center">
                    <div className="mb-1 flex size-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      <TrashIcon size={28} weight="duotone" />
                    </div>
                    <AlertDialogTitle>Kosongkan kotak teks?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Semua teks yang sudah ditempel akan dihapus dari kotak teks, termasuk draf yang tersimpan
                      otomatis.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-2xl font-black text-sr-ink">{text.split("\n").length}</p>
                      <p className="text-xs text-sr-muted">baris teks</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-2xl font-black text-sr-ink">{total}</p>
                      <p className="text-xs text-sr-muted">soal terbaca</p>
                    </div>
                  </div>
                  <p className="flex items-start gap-1.5 rounded-md bg-emerald-50 p-2 text-xs text-emerald-800">
                    <CheckCircleIcon weight="fill" className="mt-0.5 shrink-0" />
                    Soal yang sudah tersimpan di subtes tidak ikut terhapus.
                  </p>
                  <AlertDialogFooter className="sm:justify-center">
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={clearText}>
                      Ya, kosongkan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <textarea
              id={`import-text-${subtesId}`}
              ref={textareaRef}
              value={text}
              onChange={(e) => updateText(e.target.value)}
              onPaste={handlePaste}
              spellCheck={false}
              placeholder={
                "1. Pertanyaan ...\nA. Pilihan A\nB. Pilihan B\nC. Pilihan C\nD. Pilihan D\nE. Pilihan E\nKunci: B\nPembahasan: ..."
              }
              className="h-72 min-h-52 w-full shrink-0 resize-none rounded-md border bg-background p-3 font-mono text-xs leading-4.5 outline-none focus-visible:ring-2 focus-visible:ring-ring lg:h-auto lg:min-h-0 lg:flex-1 lg:shrink"
            />
            <p className="text-xs text-sr-muted">Draf tersimpan otomatis di browser ini sampai soal disimpan.</p>
          </section>

          <section className="flex min-h-0 flex-col gap-2">
            <div role="tablist" aria-label="Panel kanan" className="flex shrink-0 gap-1 rounded-lg bg-muted p-1">
              {(
                [
                  { id: "panduan", label: "Panduan & Template", icon: <InfoIcon /> },
                  { id: "pratinjau", label: `Pratinjau (${total})`, icon: <EyeIcon /> },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={rightTab === tab.id}
                  onClick={() => setRightTab(tab.id)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold",
                    rightTab === tab.id ? "bg-white text-sr-ink shadow-sm" : "text-sr-muted hover:text-sr-ink",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {rightTab === "panduan" ? (
              <div className="min-h-0 flex-1 lg:overflow-y-auto lg:pr-1">
                <FormatGuide nextNumber={nextNumber} onUse={insertTemplate} />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-muted px-2.5 py-1 font-semibold">Terbaca {total} soal</span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-800">
                    Siap {total - invalidCount}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 font-semibold",
                      invalidCount > 0 ? "bg-rose-100 text-rose-800" : "bg-muted text-sr-muted",
                    )}
                  >
                    Perlu diperbaiki {invalidCount}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 font-semibold",
                      warnedCount > 0 ? "bg-amber-100 text-amber-900" : "bg-muted text-sr-muted",
                    )}
                  >
                    Peringatan {warnedCount}
                  </span>
                  <label className="ml-auto flex cursor-pointer items-center gap-1.5">
                    <input type="checkbox" checked={onlyProblems} onChange={(e) => setOnlyProblems(e.target.checked)} />
                    Hanya yang bermasalah
                  </label>
                </div>

                {(result.errors.length > 0 || result.notices.length > 0) && (
                  <ul className="space-y-1 rounded-md border bg-muted/30 p-2 text-xs">
                    {result.errors.map((e) => (
                      <li key={e} className="font-semibold text-rose-700">
                        {e}
                      </li>
                    ))}
                    {result.notices.map((n) => (
                      <li key={n} className="text-sr-muted">
                        {n}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="min-h-0 flex-1 space-y-3 lg:overflow-y-auto lg:pr-1">
                  {total === 0 ? (
                    <div className="flex h-full min-h-40 flex-col items-center justify-center rounded-md border border-dashed p-6 text-center text-sm text-sr-muted">
                      <ClipboardTextIcon size={28} className="mb-2" />
                      Pratinjau soal muncul di sini setelah teks ditempel.
                      <br />
                      Tampilannya sama dengan yang akan dilihat siswa.
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setRightTab("panduan")}
                      >
                        Lihat panduan & template
                      </Button>
                    </div>
                  ) : visibleSoal.length === 0 ? (
                    <p className="p-6 text-center text-sm text-sr-muted">Tidak ada soal bermasalah.</p>
                  ) : (
                    visibleSoal.map((s) => (
                      <SoalPreviewCard
                        key={`${s.index}-${s.line}`}
                        soal={s}
                        extraWarnings={extraWarnings.get(s.index) ?? []}
                        onJump={jumpToLine}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </section>
        </div>

        <footer className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor={`import-poin-${subtesId}`} className="shrink-0 text-sm">
              Poin per soal
            </Label>
            <Input
              id={`import-poin-${subtesId}`}
              type="number"
              min={1}
              max={1000}
              value={Number.isNaN(poin) ? "" : poin}
              onChange={(e) => setPoin(e.target.valueAsNumber)}
              className="h-9 w-24"
            />
            <span className="hidden text-xs text-sr-muted xl:inline">berlaku untuk semua soal yang diimpor</span>
          </div>
          <p className="text-xs text-sr-muted sm:mr-auto">
            Soal di subtes: {existingPertanyaan.length} + {total} baru = <strong>{totalAfter}</strong>
            {jumlahAkanBerubah && (
              <>
                {" "}
                · Jumlah soal subtes otomatis disesuaikan dari {jumlahSoalTarget} menjadi <strong>{totalAfter}</strong>
              </>
            )}
          </p>
          {blockReason && total > 0 && <p className="text-xs font-semibold text-rose-700">{blockReason}</p>}
          <Button type="button" className="w-full sm:w-auto" disabled={!canSave} onClick={() => setConfirmOpen(true)}>
            {isParsing ? "Membaca..." : `Simpan ${total} Soal`}
          </Button>
        </footer>

        <AlertDialog open={confirmOpen} onOpenChange={(next) => !importMutation.isPending && setConfirmOpen(next)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Simpan {total} soal ke {namaSubtes}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Setiap soal bernilai {poin} poin. Semua soal disimpan sekaligus: jika ada yang gagal, tidak ada yang
                tersimpan. Soal yang sudah ada tidak berubah.
                {jumlahAkanBerubah &&
                  ` Jumlah soal subtes otomatis disesuaikan dari ${jumlahSoalTarget} menjadi ${totalAfter}.`}
                {multipleCount > 0 && ` ${multipleCount} soal bertipe multiple answer.`}
                {warnedCount > 0 && ` Masih ada ${warnedCount} soal dengan peringatan, pastikan sudah diperiksa.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={importMutation.isPending}>Periksa lagi</AlertDialogCancel>
              <AlertDialogAction
                disabled={importMutation.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  importMutation.mutate({ subtesId, soal: toImportPayload(result.soal, poin) });
                }}
              >
                {importMutation.isPending ? "Menyimpan..." : "Ya, simpan"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
