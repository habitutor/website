import { CheckCircleIcon, WarningCircleIcon, WarningIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ParsedSoal } from "./parse-soal-text";

/** Pratinjau memakai aturan render yang sama dengan halaman siswa: teks dipecah per baris menjadi paragraf. */
function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {text
        .split(/\n+/)
        .filter((line) => line.trim() !== "")
        .map((line, i) => (
          <p key={i.toString()} className="leading-relaxed wrap-break-word">
            {line}
          </p>
        ))}
    </div>
  );
}

export function SoalPreviewCard({
  soal,
  extraWarnings,
  onJump,
}: {
  soal: ParsedSoal;
  extraWarnings: string[];
  onJump: (line: number) => void;
}) {
  const warnings = [...soal.warnings, ...extraWarnings];
  const hasError = soal.errors.length > 0;

  return (
    <article
      className={cn(
        "rounded-lg border bg-white p-4 text-sm",
        hasError ? "border-rose-300 ring-1 ring-rose-200" : warnings.length > 0 ? "border-amber-300" : "border-sr-line",
      )}
    >
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">#{soal.index}</span>
        <span className="text-xs text-sr-muted">Nomor di dokumen: {soal.nomor}</span>
        {soal.tipe === "multiple" && (
          <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
            Multiple Answer
          </span>
        )}
        {soal.bacaan && (
          <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">Dengan bacaan</span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold">
          {hasError ? (
            <span className="inline-flex items-center gap-1 text-rose-700">
              <WarningCircleIcon weight="fill" /> Perlu diperbaiki
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <CheckCircleIcon weight="fill" /> Siap
            </span>
          )}
        </span>
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onJump(soal.line)}>
          Lihat di teks
        </Button>
      </header>

      {soal.errors.length > 0 && (
        <ul className="mb-3 space-y-1 rounded-md bg-rose-50 p-2 text-xs text-rose-800">
          {soal.errors.map((e) => (
            <li key={e} className="flex gap-1.5">
              <WarningCircleIcon weight="fill" className="mt-0.5 shrink-0" /> {e}
            </li>
          ))}
        </ul>
      )}

      {warnings.length > 0 && (
        <ul className="mb-3 space-y-1 rounded-md bg-amber-50 p-2 text-xs text-amber-900">
          {warnings.map((w) => (
            <li key={w} className="flex gap-1.5">
              <WarningIcon weight="fill" className="mt-0.5 shrink-0" /> {w}
            </li>
          ))}
        </ul>
      )}

      {soal.pertanyaan ? (
        <Paragraphs text={soal.pertanyaan} className="mb-3 font-medium text-sr-ink" />
      ) : (
        <p className="mb-3 text-sr-muted italic">(pertanyaan kosong)</p>
      )}

      <div className="space-y-1.5">
        {soal.pilihan.map((opt) => {
          const isCorrect = soal.kunci.includes(opt.label);
          return (
            <div
              key={opt.label}
              className={cn(
                "flex items-start gap-2 rounded-md border px-2.5 py-1.5",
                isCorrect ? "border-emerald-300 bg-emerald-50" : "border-sr-line",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  isCorrect ? "bg-emerald-600 text-white" : "bg-muted text-foreground",
                )}
              >
                {opt.label}
              </span>
              <span className={cn("pt-0.5 wrap-break-word", !opt.isi && "text-sr-muted italic")}>
                {opt.isi || "(kosong)"}
              </span>
            </div>
          );
        })}
      </div>

      {soal.pembahasan && (
        <details className="mt-3 rounded-md bg-muted/40 p-2">
          <summary className="cursor-pointer text-xs font-semibold text-sr-muted">Pembahasan</summary>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{soal.pembahasan}</p>
        </details>
      )}
    </article>
  );
}
