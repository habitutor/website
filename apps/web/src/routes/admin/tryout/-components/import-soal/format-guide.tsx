import { CheckIcon, CopyIcon, PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const CONTOH_FORMAT = `1. Nilai dari 2³ + 4 adalah ...
A. 10
B. 12
C. 14
D. 16
E. 18
Kunci: B
Pembahasan: 2³ = 8, lalu 8 + 4 = 12.

[Bacaan untuk soal 2-3]
Hutan mangrove berperan penting dalam melindungi garis pantai dari abrasi.
Akar-akarnya menahan sedimen dan meredam gelombang.
[/Bacaan]

2. Gagasan utama bacaan tersebut adalah ...
A. Mangrove melindungi pantai
B. Gelombang laut semakin tinggi
C. Sedimen merusak pantai
D. Abrasi tidak dapat dicegah
E. Akar mangrove mudah rusak
Kunci: A
Pembahasan: Kalimat pertama menyatakan peran mangrove melindungi pantai.

3. Pernyataan yang sesuai dengan bacaan adalah ... (pilih semua yang benar)
Tipe: Multiple Answer
A. Akar mangrove menahan sedimen
B. Mangrove mempercepat abrasi
C. Mangrove meredam gelombang
Kunci: A, C
Pembahasan: Kalimat kedua menyebut kedua fungsi tersebut.`;

type Template = {
  id: string;
  title: string;
  description: string;
  /** {n} = nomor soal pertama, {n1} = nomor berikutnya */
  body: string;
  notes: string[];
};

export const TEMPLATES: Template[] = [
  {
    id: "pilgan",
    title: "Pilihan Ganda (satu jawaban benar)",
    description: "Format paling umum. Siswa memilih satu jawaban.",
    body: `{n}. Tulis pertanyaan di sini ...
A. Pilihan A
B. Pilihan B
C. Pilihan C
D. Pilihan D
E. Pilihan E
Kunci: B
Pembahasan: Tulis pembahasan di sini.`,
    notes: [
      "Isi Kunci dengan satu huruf saja (A–E).",
      "Pilihan boleh 2–5 dan harus berurutan mulai dari A.",
      "Pembahasan boleh lebih dari satu baris.",
    ],
  },
  {
    id: "multiple",
    title: "Multiple Answer (bisa lebih dari satu benar)",
    description: "Siswa memilih semua jawaban yang benar.",
    body: `{n}. Tulis pertanyaan di sini ... (pilih semua jawaban yang benar)
Tipe: Multiple Answer
A. Pilihan A
B. Pilihan B
C. Pilihan C
D. Pilihan D
E. Pilihan E
Kunci: A, C
Pembahasan: Tulis pembahasan di sini.`,
    notes: [
      "Pisahkan kunci dengan koma: Kunci: A, C, E",
      "Baris Tipe: Multiple Answer wajib jika kuncinya hanya satu, dan aman ditulis selalu.",
      "Siswa dinilai benar hanya jika memilih semua kunci tanpa pilihan yang salah.",
    ],
  },
  {
    id: "bacaan",
    title: "Soal dengan Teks Bacaan",
    description: "Satu teks bacaan dipakai untuk beberapa soal.",
    body: `[Bacaan untuk soal {n}-{n1}]
Tulis teks bacaan di sini.
Boleh lebih dari satu paragraf.
[/Bacaan]

{n}. Pertanyaan pertama tentang bacaan ...
A. Pilihan A
B. Pilihan B
C. Pilihan C
D. Pilihan D
E. Pilihan E
Kunci: A
Pembahasan: Tulis pembahasan di sini.

{n1}. Pertanyaan kedua tentang bacaan ...
A. Pilihan A
B. Pilihan B
C. Pilihan C
D. Pilihan D
E. Pilihan E
Kunci: D
Pembahasan: Tulis pembahasan di sini.`,
    notes: [
      "Nomor di [Bacaan untuk soal 3-5] harus sama dengan nomor soalnya.",
      "Teks bacaan otomatis disalin ke setiap soal, karena urutan soal diacak untuk siswa.",
    ],
  },
  {
    id: "kunci-akhir",
    title: "Kunci Jawaban di Akhir Dokumen",
    description: "Untuk dokumen yang kuncinya dikumpulkan di bagian bawah.",
    body: `{n}. Pertanyaan pertama ...
A. Pilihan A
B. Pilihan B
C. Pilihan C
D. Pilihan D
E. Pilihan E

{n1}. Pertanyaan kedua ...
A. Pilihan A
B. Pilihan B
C. Pilihan C
D. Pilihan D
E. Pilihan E

Kunci Jawaban
{n}. C
{n1}. A, E`,
    notes: [
      "Tulis Kunci Jawaban di baris sendiri, lalu nomor dan hurufnya.",
      "Boleh satu baris: Kunci Jawaban: 1. C 2. A, E",
      "Soal yang kuncinya lebih dari satu otomatis jadi Multiple Answer.",
    ],
  },
];

export function fillTemplate(body: string, startNumber: number) {
  return body.replaceAll("{n1}", String(startNumber + 1)).replaceAll("{n}", String(startNumber));
}

const RULES = [
  "Setiap soal diawali nomor: 1. atau 1)",
  "Pilihan jawaban di baris sendiri: A. / B) / (C)",
  "Kunci ditulis Kunci: B atau Jawaban: B",
  "Gambar tidak ikut tertempel. Tambahkan lewat tombol Edit soal setelah impor.",
  'Tulis pangkat/indeks dengan benar (x², H₂O). Teks seperti "x2" atau rumus LaTeX ($x^2$) tidak diubah otomatis, periksa di pratinjau.',
  "Baris judul atau petunjuk di luar soal otomatis diabaikan.",
];

function TemplateCard({
  template,
  nextNumber,
  onUse,
}: {
  template: Template;
  nextNumber: number;
  onUse: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fillTemplate(template.body, 1));
      setCopied(true);
      toast.success("Template disalin. Tempel di Word/Google Docs atau di kotak teks.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin otomatis. Blok teks template lalu tekan Ctrl+C.");
    }
  };

  return (
    <article className="overflow-hidden rounded-lg border border-sr-line bg-white">
      <header className="flex flex-wrap items-start gap-2 border-b bg-muted/30 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-sr-ink">{template.title}</h4>
          <p className="text-xs text-sr-muted">{template.description}</p>
        </div>
        <div className="flex gap-1.5">
          <Button type="button" size="sm" variant="outline" className="h-8 px-3" onClick={copy}>
            {copied ? <CheckIcon className="mr-1" /> : <CopyIcon className="mr-1" />}
            {copied ? "Tersalin" : "Salin"}
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 px-3"
            onClick={() => onUse(fillTemplate(template.body, nextNumber))}
          >
            <PlusIcon className="mr-1" /> Masukkan ke kotak
          </Button>
        </div>
      </header>
      <pre className="max-h-60 overflow-auto bg-white px-3 py-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-sr-ink select-all">
        {fillTemplate(template.body, 1)}
      </pre>
      <ul className="space-y-1 border-t bg-muted/20 px-3 py-2 text-xs text-sr-muted">
        {template.notes.map((note) => (
          <li key={note} className="flex gap-1.5">
            <span aria-hidden>•</span>
            {note}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function FormatGuide({ nextNumber, onUse }: { nextNumber: number; onUse: (text: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
        <p className="font-semibold">Struktur soal yang bisa dibaca sistem</p>
        <p className="mt-0.5 text-xs">
          Klik <strong>Salin</strong> untuk menyalin template ke Word/Google Docs, atau{" "}
          <strong>Masukkan ke kotak</strong> untuk langsung menambahkannya ke kotak teks di sebelah kiri (nomor soal
          menyesuaikan otomatis).
        </p>
        <ul className="mt-2 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
          {RULES.map((rule) => (
            <li key={rule} className="flex gap-1.5">
              <CheckIcon weight="bold" className="mt-0.5 shrink-0 text-sky-700" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
      {TEMPLATES.map((template) => (
        <TemplateCard key={template.id} template={template} nextNumber={nextNumber} onUse={onUse} />
      ))}
    </div>
  );
}
