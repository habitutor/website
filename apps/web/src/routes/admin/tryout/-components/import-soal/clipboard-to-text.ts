const SUPERSCRIPT: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "−": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  n: "ⁿ",
  i: "ⁱ",
  x: "ˣ",
  y: "ʸ",
};

const SUBSCRIPT: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "−": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
  a: "ₐ",
  e: "ₑ",
  o: "ₒ",
  x: "ₓ",
  n: "ₙ",
};

/**
 * Mengubah teks pangkat/indeks menjadi karakter Unicode (x² , H₂O) karena soal disimpan sebagai teks biasa.
 * Jika ada karakter yang tidak punya padanan Unicode, dipakai notasi ^(…) atau _(…) agar maknanya tidak hilang.
 */
export function toScript(text: string, kind: "sup" | "sub"): string {
  const map = kind === "sup" ? SUPERSCRIPT : SUBSCRIPT;
  const trimmed = text.trim();
  if (!trimmed) return text;
  const chars = [...trimmed];
  if (chars.every((c) => map[c] !== undefined)) return chars.map((c) => map[c]).join("");
  const marker = kind === "sup" ? "^" : "_";
  return chars.length === 1 ? `${marker}${trimmed}` : `${marker}(${trimmed})`;
}

const BLOCK_TAGS = new Set([
  "P",
  "DIV",
  "LI",
  "TR",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "PRE",
  "SECTION",
  "ARTICLE",
  "UL",
  "OL",
  "TABLE",
]);
const SKIP_TAGS = new Set(["STYLE", "SCRIPT", "HEAD", "TITLE", "META", "LINK", "XML", "O:P"]);

function listMarker(style: string, n: number): string {
  if (/upper-alpha|upper-latin/.test(style)) return `${String.fromCharCode(64 + Math.min(n, 26))}.`;
  if (/lower-alpha|lower-latin/.test(style)) return `${String.fromCharCode(96 + Math.min(n, 26))}.`;
  return `${n}.`;
}

function listStyleOf(ol: Element, li: Element): string {
  const type = ol.getAttribute("type");
  if (type === "A") return "upper-alpha";
  if (type === "a") return "lower-alpha";
  const liStyle = li.getAttribute("style") ?? "";
  const olStyle = ol.getAttribute("style") ?? "";
  return `${liStyle} ${olStyle}`.toLowerCase();
}

function verticalAlign(el: Element): "sup" | "sub" | null {
  if (el.tagName === "SUP") return "sup";
  if (el.tagName === "SUB") return "sub";
  const style = (el.getAttribute("style") ?? "").toLowerCase().replace(/\s/g, "");
  if (style.includes("vertical-align:super")) return "sup";
  if (style.includes("vertical-align:sub")) return "sub";
  return null;
}

/** Mengubah HTML clipboard (Word / Google Docs / web) menjadi teks biasa yang siap diparse. */
export function htmlToPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out: string[] = [];
  let afterListMarker = false;
  const atLineStart = () => out.length === 0 || out[out.length - 1]!.endsWith("\n");
  const newline = () => {
    if (afterListMarker) return;
    if (!atLineStart()) out.push("\n");
  };

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? "").replace(/\s+/g, " ");
      if (!text.trim() && (atLineStart() || afterListMarker)) return;
      afterListMarker = false;
      out.push(text);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toUpperCase();
    if (SKIP_TAGS.has(tag)) return;

    if (tag === "BR") {
      out.push("\n");
      return;
    }

    const align = verticalAlign(el);
    if (align) {
      afterListMarker = false;
      out.push(toScript(el.textContent ?? "", align));
      return;
    }

    if (tag === "TR") {
      newline();
      const cells = [...el.children].map((cell) => htmlToPlainText(cell.innerHTML).replace(/\n+/g, " ").trim());
      out.push(cells.join(" | "));
      out.push("\n");
      return;
    }

    const isBlock = BLOCK_TAGS.has(tag);
    if (isBlock) newline();

    if (tag === "LI" && el.parentElement?.tagName === "OL") {
      const ol = el.parentElement;
      const start = Number(ol.getAttribute("start") ?? "1") || 1;
      const position = [...ol.children].filter((c) => c.tagName === "LI").indexOf(el);
      out.push(`${listMarker(listStyleOf(ol, el), start + position)} `);
      afterListMarker = true;
    }

    for (const child of el.childNodes) walk(child);
    if (isBlock) newline();
  };

  walk(doc.body);
  return out
    .join("")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Ambil teks terbaik dari event paste: HTML jika ada (mempertahankan pangkat & penomoran), jika tidak teks biasa. */
export function clipboardToText(data: DataTransfer): string {
  const html = data.getData("text/html");
  const plain = data.getData("text/plain");
  if (!html) return plain;
  try {
    const converted = htmlToPlainText(html);
    return converted || plain;
  } catch {
    return plain;
  }
}
