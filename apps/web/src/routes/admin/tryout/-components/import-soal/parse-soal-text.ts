export const OPTION_LABELS = ["A", "B", "C", "D", "E"] as const;
export type OptionLabel = (typeof OPTION_LABELS)[number];

export const IMPORT_MAX_SOAL = 200;
export const IMPORT_MAX_TEXT_LENGTH = 20000;

export type ParsedOption = { label: OptionLabel; isi: string };

export type ParsedSoal = {
  /** Urutan soal dalam hasil impor (1, 2, 3, ...) */
  index: number;
  /** Nomor yang tertulis di dokumen */
  nomor: number;
  /** Baris (0-based) tempat soal dimulai di teks tempelan */
  line: number;
  pertanyaan: string;
  bacaan: string | null;
  pilihan: ParsedOption[];
  kunci: OptionLabel[];
  pembahasan: string;
  tipe: "pilgan" | "multiple";
  errors: string[];
  warnings: string[];
};

export type ParseResult = {
  soal: ParsedSoal[];
  /** Masalah tingkat dokumen yang menghalangi penyimpanan */
  errors: string[];
  /** Info tingkat dokumen yang tidak menghalangi penyimpanan */
  notices: string[];
};

type Draft = {
  nomor: number;
  line: number;
  body: string[];
  bacaan: string | null;
  pilihan: { label: OptionLabel; parts: string[] }[];
  kunci: OptionLabel[];
  tipe: "pilgan" | "multiple" | null;
  pembahasan: string[];
  errors: string[];
  warnings: string[];
};

type State = "preamble" | "body" | "option" | "pembahasan" | "keyTable" | "keyPending";

type Passage = { text: string; from: number | null; to: number | null };

const PLAIN_QUESTION_RE = /^(\d{1,3})[.)](?:\s+(.*))?$/;
const PREFIXED_QUESTION_RE = /^(?:soal|nomor|no\.?)\s*(\d{1,3})\s*[.):]?(?:\s+(.*))?$/i;
const OPTION_RE = /^[([]?([A-Ea-e])[.)\]](?:\s+(.*))?$/;
const KEY_INLINE_RE = /^(?:kunci(?:\s+jawaban)?|jawaban(?:\s+(?:yang\s+)?benar)?|jawab|key|answer)\s*[:=]\s*(.+)$/i;
const KEY_HEADING_RE = /^kunci(?:\s+jawaban)?\s*:?$/i;
const TYPE_RE = /^tipe(?:\s+soal)?\s*:\s*(.+)$/i;
const TYPE_MULTIPLE_RE =
  /kompleks|majemuk|multiple|jawaban\s+ganda|ganda\s+kompleks|lebih\s+dari\s+satu|banyak\s+jawaban/i;
const TYPE_PILGAN_RE = /pilihan\s+ganda|pilgan|tunggal|single|satu\s+jawaban/i;

export function parseTipe(value: string): "pilgan" | "multiple" | null {
  // "Multiple Choice" dalam bahasa Inggris = pilihan ganda biasa (satu jawaban), bukan jawaban ganda.
  const normalized = value.replace(/multiple[\s_-]*choice/gi, "pilihan ganda");
  if (TYPE_MULTIPLE_RE.test(normalized)) return "multiple";
  if (TYPE_PILGAN_RE.test(normalized)) return "pilgan";
  return null;
}
const PEMBAHASAN_RE = /^(?:pembahasan|penjelasan|solusi|penyelesaian)\s*(?::\s*(.*))?$/i;
const PASSAGE_OPEN_RE =
  /^\[\s*(?:bacaan|teks|wacana)(?:\s+(?:untuk\s+)?(?:soal\s+)?(?:no(?:mor)?\.?\s*)?(\d{1,3})\s*[-–—]\s*(\d{1,3}))?\s*\]$/i;
const PASSAGE_CLOSE_RE = /^\[\s*\/\s*(?:bacaan|teks|wacana)\s*\]$/i;
const KEY_PAIR_RE = /(\d{1,3})\s*[.):=-]?\s*\(?([A-E](?:\s*[,&/]\s*[A-E])*)\)?(?![A-Za-z0-9])/gi;
const IMAGE_HINT_RE = /\b(gambar|grafik|diagram|denah|peta|ilustrasi)\b/i;
const PASSAGE_HINT_RE = /\b(teks|bacaan|wacana|paragraf)\s+(di\s*atas|tersebut|berikut)/i;

export function normalizeLine(line: string): string {
  return line
    .replace(/[​-‍﻿]/g, "")
    .replace(/[ \t]/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

function matchQuestion(line: string): { nomor: number; rest: string } | null {
  const m = PLAIN_QUESTION_RE.exec(line) ?? PREFIXED_QUESTION_RE.exec(line);
  if (!m) return null;
  return { nomor: Number(m[1]), rest: m[2] ?? "" };
}

export function parseKeyLabels(value: string): OptionLabel[] | null {
  const cleaned = value.replace(/\b(dan|and)\b/gi, ",").trim();
  const m = /^\(?[A-E]\)?(?:\s*[,&/;]\s*\(?[A-E]\)?)*(?![A-Za-z0-9])/i.exec(cleaned);
  if (!m) return null;
  const letters = (m[0].match(/[A-E]/gi) ?? []).map((l) => l.toUpperCase() as OptionLabel);
  return [...new Set(letters)].sort();
}

/** Mengembalikan pasangan nomor→kunci jika seluruh baris berisi tabel kunci, mis. "1. A  2. C  3. B,D". */
function parseKeyPairs(line: string): Map<number, OptionLabel[]> | null {
  const pairs = new Map<number, OptionLabel[]>();
  const rest = line.replace(KEY_PAIR_RE, (_all, num: string, letters: string) => {
    const labels = parseKeyLabels(letters);
    if (labels) pairs.set(Number(num), labels);
    return " ";
  });
  if (pairs.size === 0 || !/^[\s,;|.-]*$/.test(rest)) return null;
  return pairs;
}

/**
 * Di dalam pembahasan, baris bernomor bisa berupa langkah penyelesaian ("2. Bagi kedua ruas").
 * Baris dianggap soal baru hanya jika sebelum pilihan "A." berikutnya tidak ada baris bernomor
 * antara nomor soal terakhir dan nomor kandidat (yang berarti kandidat hanyalah langkah pembahasan).
 */
function isRealQuestionStart(lines: string[], start: number, nomor: number, lastNomor: number): boolean {
  const limit = Math.min(lines.length, start + 300);
  for (let j = start + 1; j < limit; j++) {
    const line = lines[j]!;
    const option = OPTION_RE.exec(line);
    if (option && option[1]!.toUpperCase() === "A") return true;
    const other = matchQuestion(line)?.nomor;
    if (other !== undefined && other > lastNomor && other <= nomor) return false;
  }
  return true;
}

function newDraft(nomor: number, line: number, rest: string, bacaan: string | null): Draft {
  return {
    nomor,
    line,
    body: rest ? [rest] : [],
    bacaan,
    pilihan: [],
    kunci: [],
    tipe: null,
    pembahasan: [],
    errors: [],
    warnings: [],
  };
}

function setKey(draft: Draft, labels: OptionLabel[], source: string) {
  if (draft.kunci.length > 0 && draft.kunci.join() !== labels.join()) {
    draft.errors.push(
      `Kunci jawaban ganda dan berbeda (${draft.kunci.join(", ")} vs ${labels.join(", ")} dari ${source})`,
    );
    return;
  }
  draft.kunci = labels;
}

/** Mencari blok [Bacaan] … [/Bacaan]. Tanpa penutup, bacaan berakhir saat nomor soal pertama muncul. */
function readPassage(lines: string[], start: number): { passage: Passage; next: number } {
  const open = PASSAGE_OPEN_RE.exec(lines[start] ?? "");
  const from = open?.[1] ? Number(open[1]) : null;
  const to = open?.[2] ? Number(open[2]) : null;

  let closeAt = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (PASSAGE_OPEN_RE.test(lines[i]!)) break;
    if (PASSAGE_CLOSE_RE.test(lines[i]!)) {
      closeAt = i;
      break;
    }
  }

  const body: string[] = [];
  let i = start + 1;
  for (; i < lines.length; i++) {
    if (closeAt !== -1 && i === closeAt) {
      i++;
      break;
    }
    if (closeAt === -1 && (matchQuestion(lines[i]!) || PASSAGE_OPEN_RE.test(lines[i]!))) break;
    if (lines[i]) body.push(lines[i]!);
  }

  return { passage: { text: body.join("\n"), from: from ?? null, to: to ?? null }, next: i };
}

export function parseSoalText(input: string): ParseResult {
  const lines = input.replace(/\r\n?/g, "\n").split("\n").map(normalizeLine);
  const drafts: Draft[] = [];
  const keyTable = new Map<number, OptionLabel[]>();
  const notices: string[] = [];
  const errors: string[] = [];

  let state: State = "preamble";
  let current: Draft | null = null;
  let lastNomor = 0;
  let afterBlank = false;
  let ignoredLines = 0;
  let activePassage: Passage | null = null;
  const passages: Passage[] = [];

  const finish = () => {
    if (current) drafts.push(current);
    current = null;
  };

  const passageFor = (nomor: number): string | null => {
    const ranged = passages.find((p) => p.from !== null && p.to !== null && nomor >= p.from && nomor <= p.to);
    if (ranged) return ranged.text;
    if (activePassage && activePassage.from === null) return activePassage.text;
    return null;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;

    if (!line) {
      afterBlank = true;
      i++;
      continue;
    }

    if (PASSAGE_OPEN_RE.test(line)) {
      finish();
      const { passage, next } = readPassage(lines, i);
      if (!passage.text) notices.push(`Baris ${i + 1}: blok bacaan kosong diabaikan`);
      else if (passage.from !== null) passages.push(passage);
      else activePassage = passage;
      state = "preamble";
      afterBlank = false;
      i = next;
      continue;
    }

    if (PASSAGE_CLOSE_RE.test(line)) {
      i++;
      continue;
    }

    if (state === "keyTable" || state === "keyPending") {
      const pairs = parseKeyPairs(line);
      if (pairs) {
        if (state === "keyPending") finish();
        for (const [n, labels] of pairs) keyTable.set(n, labels);
        state = "keyTable";
        i++;
        continue;
      }
      if (state === "keyPending") {
        const labels = parseKeyLabels(line);
        state = "option";
        if (labels && line.length <= 20) {
          setKey(current!, labels, "baris kunci");
          i++;
          continue;
        }
      }
    }

    const question = matchQuestion(line);
    if (question) {
      const draft = current as Draft | null;
      const hasOptions = (draft?.pilihan.length ?? 0) >= 2;
      const canStart =
        !draft ||
        state === "keyTable" ||
        (state === "pembahasan" &&
          question.nomor > lastNomor &&
          isRealQuestionStart(lines, i, question.nomor, lastNomor)) ||
        (state !== "pembahasan" && hasOptions);

      if (canStart) {
        finish();
        const next = newDraft(question.nomor, i, question.rest, passageFor(question.nomor));
        if (lastNomor > 0 && question.nomor !== lastNomor + 1) {
          next.warnings.push(`Nomor tidak berurutan: sebelumnya ${lastNomor}, lalu ${question.nomor}`);
        }
        current = next;
        lastNomor = question.nomor;
        state = "body";
        afterBlank = false;
        i++;
        continue;
      }
    }

    const tipeLine = current && state !== "pembahasan" ? TYPE_RE.exec(line) : null;
    if (tipeLine) {
      const draft = current as Draft;
      const tipe = parseTipe(tipeLine[1]!);
      if (tipe) draft.tipe = tipe;
      else
        draft.errors.push(`Tipe soal "${tipeLine[1]}" tidak dikenali (gunakan "Pilihan Ganda" atau "Multiple Answer")`);
      afterBlank = false;
      i++;
      continue;
    }

    const keyInline = KEY_INLINE_RE.exec(line);
    if (keyInline && !(state === "pembahasan" && current && (current as Draft).kunci.length > 0)) {
      const value = keyInline[1]!;
      const pairs = parseKeyPairs(value);
      if (pairs && /\d/.test(value)) {
        for (const [n, labels] of pairs) keyTable.set(n, labels);
        finish();
        state = "keyTable";
      } else if (current) {
        const labels = parseKeyLabels(value);
        if (labels) setKey(current, labels, "baris kunci");
        else (current as Draft).errors.push(`Kunci jawaban "${value}" tidak terbaca (gunakan huruf A–E)`);
        if (state !== "pembahasan") state = "option";
      } else {
        ignoredLines++;
      }
      afterBlank = false;
      i++;
      continue;
    }

    if (KEY_HEADING_RE.test(line) && (state === "preamble" || state === "option" || state === "pembahasan")) {
      const draft = current as Draft | null;
      if (draft && draft.kunci.length === 0 && state === "option") {
        state = "keyPending";
      } else {
        finish();
        state = "keyTable";
      }
      i++;
      continue;
    }

    if (!current) {
      ignoredLines++;
      i++;
      continue;
    }
    const draft = current as Draft;

    const pembahasan = PEMBAHASAN_RE.exec(line);
    if (pembahasan && state !== "pembahasan" && state !== "keyTable") {
      state = "pembahasan";
      if (pembahasan[1]) draft.pembahasan.push(pembahasan[1]);
      afterBlank = false;
      i++;
      continue;
    }

    const option = state === "body" || state === "option" ? OPTION_RE.exec(line) : null;
    if (option) {
      const label = option[1]!.toUpperCase() as OptionLabel;
      const idx = OPTION_LABELS.indexOf(label);
      const count = draft.pilihan.length;
      const isFirst = count === 0 && label === "A";
      const isNext = count > 0 && idx >= count;

      if (isFirst || isNext) {
        if (idx > count) {
          const missing = OPTION_LABELS.slice(count, idx).join(", ");
          draft.errors.push(`Pilihan ${missing} tidak ditemukan sebelum pilihan ${label}`);
        }
        draft.pilihan.push({ label, parts: option[2] ? [option[2]] : [] });
        state = "option";
        afterBlank = false;
        i++;
        continue;
      }

      if (count > 0 && label === "A") {
        draft.errors.push(`Pilihan A muncul lagi di baris ${i + 1}. Kemungkinan nomor soal berikutnya tidak terbaca.`);
      }
    }

    if (state === "keyTable") {
      ignoredLines++;
    } else if (state === "pembahasan") {
      if (matchQuestion(line)?.nomor === draft.nomor + 1) {
        const warning = `Pembahasan berisi baris bernomor ${draft.nomor + 1}. Pastikan soal nomor ${draft.nomor + 1} tidak ikut masuk ke pembahasan ini.`;
        if (!draft.warnings.includes(warning)) draft.warnings.push(warning);
      }
      draft.pembahasan.push(line);
    } else if (state === "option") {
      const last = draft.pilihan[draft.pilihan.length - 1]!;
      if (afterBlank) {
        const warning = `Teks setelah baris kosong ikut masuk ke pilihan ${last.label}. Pastikan bukan bacaan soal berikutnya.`;
        if (!draft.warnings.includes(warning)) draft.warnings.push(warning);
      }
      last.parts.push(line);
    } else {
      draft.body.push(line);
    }

    afterBlank = false;
    i++;
  }
  finish();

  for (const [n, labels] of keyTable) {
    const matches = drafts.filter((d) => d.nomor === n);
    if (matches.length === 0) notices.push(`Kunci untuk nomor ${n} tidak cocok dengan soal mana pun`);
    else if (matches.length > 1) errors.push(`Nomor ${n} dipakai lebih dari satu soal, tabel kunci jadi ambigu`);
    else setKey(matches[0]!, labels, "tabel kunci");
  }

  if (ignoredLines > 0) notices.push(`${ignoredLines} baris di luar format soal diabaikan (mis. judul atau petunjuk)`);
  if (drafts.length > IMPORT_MAX_SOAL) {
    errors.push(
      `Terbaca ${drafts.length} soal. Maksimal ${IMPORT_MAX_SOAL} soal per impor, silakan bagi menjadi beberapa kali.`,
    );
  }

  const soal = drafts.map((d, idx) => finalize(d, idx + 1));
  markDuplicates(soal);
  return { soal, errors, notices };
}

function finalize(d: Draft, index: number): ParsedSoal {
  const body = d.body.join("\n").trim();
  const pertanyaan = d.bacaan ? `${d.bacaan}\n\n${body}`.trim() : body;
  const pilihan = d.pilihan.map((p) => ({ label: p.label, isi: p.parts.join(" ").trim() }));
  const pembahasan = d.pembahasan.join("\n").trim();
  const errors = [...d.errors];
  const warnings = [...d.warnings];

  if (!body) errors.push("Teks pertanyaan kosong");
  if (pilihan.length < 2) errors.push("Pilihan jawaban tidak terbaca (minimal A dan B)");
  for (const p of pilihan) if (!p.isi) errors.push(`Pilihan ${p.label} kosong`);

  if (d.kunci.length === 0) {
    errors.push("Kunci jawaban belum ada");
  } else {
    const available = new Set(pilihan.map((p) => p.label));
    const missing = d.kunci.filter((k) => !available.has(k));
    if (missing.length > 0) errors.push(`Kunci ${missing.join(", ")} tidak ada di pilihan jawaban`);
  }

  if (pertanyaan.length > IMPORT_MAX_TEXT_LENGTH) errors.push("Pertanyaan terlalu panjang (maks 20.000 karakter)");
  if (pembahasan.length > IMPORT_MAX_TEXT_LENGTH) errors.push("Pembahasan terlalu panjang (maks 20.000 karakter)");
  if (pilihan.some((p) => p.isi.length > IMPORT_MAX_TEXT_LENGTH)) errors.push("Ada pilihan yang terlalu panjang");

  const tipe = d.tipe ?? (d.kunci.length > 1 ? "multiple" : "pilgan");
  if (tipe === "pilgan" && d.kunci.length > 1) {
    errors.push(`Tipe "Pilihan Ganda" hanya boleh satu kunci, tetapi kuncinya ${d.kunci.join(", ")}`);
  }

  const texts = pilihan.map((p) => p.isi.toLowerCase()).filter(Boolean);
  if (new Set(texts).size !== texts.length) warnings.push("Ada isi pilihan jawaban yang sama persis");
  if (!pembahasan) warnings.push("Pembahasan kosong (bisa ditambahkan nanti)");
  if (IMAGE_HINT_RE.test(body)) {
    warnings.push("Soal menyebut gambar/grafik. Gambar tidak ikut tertempel, tambahkan lewat Edit Soal setelah impor.");
  }
  if (!d.bacaan && body.length < 400 && PASSAGE_HINT_RE.test(body)) {
    warnings.push(
      "Soal merujuk ke teks bacaan, tapi tidak ada blok [Bacaan]. Urutan soal diacak untuk siswa, jadi teksnya perlu disertakan.",
    );
  }

  return {
    index,
    nomor: d.nomor,
    line: d.line,
    pertanyaan,
    bacaan: d.bacaan,
    pilihan,
    kunci: d.kunci,
    pembahasan,
    tipe,
    errors,
    warnings,
  };
}

function markDuplicates(soal: ParsedSoal[]) {
  const seen = new Map<string, number>();
  for (const s of soal) {
    const key = normalizeForCompare(s.pertanyaan);
    if (!key) continue;
    const first = seen.get(key);
    if (first !== undefined) s.warnings.push(`Pertanyaan sama persis dengan soal #${first} di tempelan ini`);
    else seen.set(key, s.index);
  }
}

export function normalizeForCompare(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function toImportPayload(soal: ParsedSoal[], poin: number) {
  return soal.map((s) => ({
    pertanyaan: s.pertanyaan,
    tipe: s.tipe,
    poin,
    pembahasan: s.pembahasan || null,
    pilihan: s.pilihan.map((p) => ({ label: p.label, isi: p.isi, isBenar: s.kunci.includes(p.label) })),
  }));
}
