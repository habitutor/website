/**
 * Impor event lama (poster, judul, tutor, tanggal, rekaman, materi) dari CSV.
 *
 *   bun run src/scripts/import-ptn-events.ts events.csv            -> dry-run (tidak menulis apa pun)
 *   bun run src/scripts/import-ptn-events.ts events.csv --apply    -> simpan ke database
 *
 * Event dengan slug yang sudah ada dilewati, jadi aman dijalankan ulang. Template: ptn-events-template.csv.
 * Kolom: slug,title,category,tutor,campus,starts_at,description,poster_url,recording_url,access_mode,materials
 *  - starts_at   : waktu WIB, contoh 2026-03-14 19:30
 *  - materials   : "Label|https://link;Label 2|https://link2"
 *  - access_mode : free | premium | mixed (kosong = free)
 */
import { readFileSync } from "node:fs";
import { db } from "../index";
import { ptnTourEvent, ptnTourMaterial } from "../schema/ptn-tour";
import { eq } from "drizzle-orm";

const CATEGORIES = ["Masterclass", "Kelas Gratis PTN Tour", "Intensif"];
const MODES = ["free", "premium", "mixed"];

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const input = text.replace(/^﻿/, "");
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

const isUrl = (value: string) => /^https?:\/\//i.test(value);

async function main() {
  const [file, flag] = process.argv.slice(2);
  if (!file) {
    console.error("Pemakaian: bun run src/scripts/import-ptn-events.ts <file.csv> [--apply]");
    process.exit(1);
  }
  const apply = flag === "--apply";
  const [header, ...body] = parseCsv(readFileSync(file, "utf-8"));
  if (!header) throw new Error("CSV kosong.");
  const cols = header.map((name) => name.trim());

  const problems: string[] = [];
  const prepared = body.map((cells, index) => {
    const get = (name: string) => (cells[cols.indexOf(name)] ?? "").trim();
    const line = index + 2;
    const fail = (message: string) => problems.push(`Baris ${line} (${get("slug") || "?"}): ${message}`);
    const slug = get("slug");
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail("slug harus huruf kecil/angka/tanda hubung");
    for (const name of ["title", "tutor", "campus", "description", "poster_url"]) if (!get(name)) fail(`kolom ${name} kosong`);
    if (get("description").length > 160) fail("description lebih dari 160 karakter");
    const category = get("category") || "Masterclass";
    if (!CATEGORIES.includes(category)) fail(`category harus salah satu: ${CATEGORIES.join(", ")}`);
    const accessMode = get("access_mode") || "free";
    if (!MODES.includes(accessMode)) fail("access_mode harus free/premium/mixed");
    const startsAt = new Date(`${get("starts_at").replace(" ", "T")}:00+07:00`);
    if (Number.isNaN(startsAt.getTime())) fail("starts_at tidak valid (contoh 2026-03-14 19:30)");
    const poster = get("poster_url");
    if (poster && !isUrl(poster) && !poster.startsWith("/")) fail("poster_url harus link http(s) atau path /");
    const recording = get("recording_url");
    if (recording && !isUrl(recording)) fail("recording_url harus link http(s)");
    const materials = get("materials")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [label, url] = part.split("|").map((value) => value.trim());
        if (!label || !url || !isUrl(url)) fail(`materi tidak valid: "${part}"`);
        return { label: label ?? "", url: url ?? "" };
      });
    return { slug, title: get("title"), category, tutor: get("tutor"), campus: get("campus"), description: get("description"), poster, startsAt, recording, accessMode, materials };
  });

  if (problems.length) {
    console.error(`Ditemukan ${problems.length} masalah, tidak ada yang disimpan:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;
  for (const item of prepared) {
    const [exists] = await db.select({ id: ptnTourEvent.id }).from(ptnTourEvent).where(eq(ptnTourEvent.slug, item.slug)).limit(1);
    if (exists) {
      skipped++;
      console.log(`LEWATI  ${item.slug} (sudah ada)`);
      continue;
    }
    console.log(`${apply ? "BUAT   " : "AKAN BUAT"} ${item.slug} | ${item.startsAt.toISOString()} | rekaman: ${item.recording ? "ya" : "tidak"} | materi: ${item.materials.length}`);
    if (!apply) continue;
    const [event] = await db
      .insert(ptnTourEvent)
      .values({
        slug: item.slug,
        title: item.title,
        category: item.category,
        description: item.description,
        tutor: item.tutor,
        campus: item.campus,
        posterUrl: item.poster,
        startsAt: item.startsAt,
        recordingUrl: item.recording || null,
        accessMode: item.accessMode,
        isPublished: true,
      })
      .returning({ id: ptnTourEvent.id });
    if (event && item.materials.length) {
      await db.insert(ptnTourMaterial).values(
        item.materials.map((material, order) => ({
          eventId: event.id,
          label: material.label,
          fileUrl: material.url,
          fileType: "LINK",
          unlockAt: "after_register",
          sortOrder: order,
          isPublished: true,
        })),
      );
    }
    created++;
  }
  console.log(apply ? `Selesai: ${created} dibuat, ${skipped} dilewati.` : `Dry-run: ${prepared.length - skipped} akan dibuat, ${skipped} dilewati. Tambahkan --apply untuk menyimpan.`);
  process.exit(0);
}

void main();
