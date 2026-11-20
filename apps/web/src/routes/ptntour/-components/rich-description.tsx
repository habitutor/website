import { CheckCircleIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Merapikan "Deskripsi lengkap" yang ditulis admin (mengikuti template brief: hook, profil tutor, "YANG KALIAN DAPET",
 * bonus, penutup) tanpa admin perlu menulis format khusus. Teks tetap teks biasa di database.
 */

type Block =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

const EMOJI_START = /^\p{Extended_Pictographic}️?\s*/u;
const BULLET_START = /^(?:[-•*▪●]|\d{1,2}[.)])\s+/u;

/** Judul bagian: semua huruf kapital, contoh "YANG KALIAN DAPET:" atau "🎁 BONUS". */
function isHeadingLine(line: string) {
  const letters = line.replace(/[^\p{L}]/gu, "");
  return letters.length >= 4 && letters === letters.toUpperCase() && line.length <= 60;
}

export function parseDescription(source: string): Block[] {
  const blocks: Block[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push({ kind: "list", items: list });
    list = [];
  };

  for (const rawLine of source.replace(/\r/g, "").split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      flush();
      continue;
    }
    if (isHeadingLine(line)) {
      flush();
      blocks.push({ kind: "heading", text: line.replace(/:$/, "") });
    } else if (BULLET_START.test(line)) {
      list.push(line.replace(BULLET_START, ""));
    } else if (EMOJI_START.test(line) && list.length > 0) {
      // Baris berawalan emoji yang mengikuti daftar dianggap bagian dari daftar yang sama.
      list.push(line);
    } else {
      flush();
      blocks.push({ kind: "paragraph", text: line });
    }
  }
  flush();

  // Beberapa baris berawalan emoji berurutan = daftar, walau tanpa tanda "-".
  return blocks.flatMap<Block>((block, index, all) => {
    if (block.kind !== "paragraph" || !EMOJI_START.test(block.text)) return [block];
    const prev = all[index - 1];
    const next = all[index + 1];
    const siblingEmoji =
      (prev?.kind === "paragraph" && EMOJI_START.test(prev.text)) ||
      (next?.kind === "paragraph" && EMOJI_START.test(next.text));
    return siblingEmoji ? [{ kind: "list", items: [block.text] }] : [block];
  });
}

/** Gabungkan daftar satu-item yang bersebelahan (hasil langkah emoji di atas) jadi satu daftar. */
function mergeLists(blocks: Block[]) {
  const merged: Block[] = [];
  for (const block of blocks) {
    const last = merged[merged.length - 1];
    if (block.kind === "list" && last?.kind === "list") last.items.push(...block.items);
    else merged.push(block.kind === "list" ? { kind: "list", items: [...block.items] } : block);
  }
  return merged;
}

/** "YANG KALIAN DAPET" ditampilkan sebagai "Yang kalian dapet": lebih mudah dibaca daripada huruf kapital semua. */
function toSentenceCase(text: string) {
  const lower = text.toLocaleLowerCase("id-ID");
  const firstLetter = lower.search(/\p{L}/u);
  return firstLetter < 0 ? lower : lower.slice(0, firstLetter) + lower.charAt(firstLetter).toLocaleUpperCase("id-ID") + lower.slice(firstLetter + 1);
}

/** @habitutor.id -> tautan Instagram. */
function linkify(text: string): ReactNode[] {
  return text.split(/(@[\w.]+\w)/g).map((part, index) =>
    /^@[\w.]+$/.test(part) ? (
      <a
        key={`${part}-${index.toString()}`}
        href={`https://www.instagram.com/${part.slice(1)}`}
        target="_blank"
        rel="noreferrer"
        className="font-bold text-sr-blue-600 hover:underline"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export function RichDescription({ text, className }: { text: string; className?: string }) {
  const blocks = mergeLists(parseDescription(text));
  const firstParagraph = blocks.findIndex((block) => block.kind === "paragraph");
  const lastIndex = blocks.length - 1;

  return (
    <div className={cn("flex max-w-2xl flex-col gap-3", className)}>
      {blocks.map((block, index) => {
        const key = `${block.kind}-${index.toString()}`;
        if (block.kind === "heading") {
          return (
            <h3 key={key} className="mt-3 text-base font-black text-sr-ink first:mt-0">
              {toSentenceCase(block.text)}
            </h3>
          );
        }
        if (block.kind === "list") {
          return (
            <ul key={key} className="grid gap-2">
              {block.items.map((item, itemIndex) => {
                const emoji = item.match(EMOJI_START)?.[0];
                return (
                  <li
                    key={`${item}-${itemIndex.toString()}`}
                    className="flex items-start gap-2.5 rounded-sr-md bg-sr-ivory/70 px-3 py-2.5 text-sm leading-relaxed text-sr-ink-2 sm:text-[15px]"
                  >
                    {emoji ? (
                      <span className="shrink-0 text-base leading-snug">{emoji.trim()}</span>
                    ) : (
                      <CheckCircleIcon weight="fill" className="mt-0.5 size-5 shrink-0 text-sr-blue-500" />
                    )}
                    <span className="min-w-0">{linkify(item.replace(EMOJI_START, ""))}</span>
                  </li>
                );
              })}
            </ul>
          );
        }
        // Baris berlabel ("Tutor: ...", "Bonus: ...") tampil dengan chip label di depannya.
        const labelled = block.text.match(/^(Tutor|Bonus|Reward|Catatan)\s*:\s*(.+)$/i);
        if (labelled?.[1] && labelled[2]) {
          return (
            <p key={key} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 leading-7 text-sr-ink-2 sm:text-[15px]">
              <span className="rounded-full bg-sr-sun-100 px-2.5 py-0.5 text-[11px] font-black tracking-wider text-sr-amber-700 uppercase">
                {labelled[1]}
              </span>
              <span className="min-w-0">{linkify(labelled[2])}</span>
            </p>
          );
        }
        // Paragraf pertama = hook, ditonjolkan; paragraf penutup berisi ajakan DM dibuat seperti kotak ajakan.
        const isHook = index === firstParagraph;
        const isClosing = index === lastIndex && /\bDM\b|tonton rekaman/i.test(block.text);
        return (
          <p
            key={key}
            className={cn(
              "leading-7 text-sr-ink-2 sm:text-[15px]",
              isHook && "text-base font-semibold text-sr-ink sm:text-lg",
              isClosing && "mt-1 rounded-sr-md border border-sr-blue-100 bg-sr-blue-50/60 px-4 py-3 text-sm",
            )}
          >
            {linkify(block.text)}
          </p>
        );
      })}
    </div>
  );
}
