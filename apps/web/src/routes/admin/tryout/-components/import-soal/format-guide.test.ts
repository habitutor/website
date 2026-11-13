import { describe, expect, test } from "bun:test";
import { CONTOH_FORMAT, TEMPLATES, fillTemplate } from "./format-guide";
import { parseSoalText } from "./parse-soal-text";

describe("template panduan impor", () => {
  test.each(TEMPLATES.map((t) => [t.id, t] as const))("template %s terbaca tanpa error", (_id, template) => {
    const { soal, errors } = parseSoalText(fillTemplate(template.body, 1));
    expect(errors).toEqual([]);
    expect(soal.length).toBeGreaterThan(0);
    for (const s of soal) expect(s.errors).toEqual([]);
  });

  test("template pilihan ganda dan multiple answer menghasilkan tipe yang benar", () => {
    const pilgan = parseSoalText(fillTemplate(TEMPLATES.find((t) => t.id === "pilgan")!.body, 1)).soal[0]!;
    const multiple = parseSoalText(fillTemplate(TEMPLATES.find((t) => t.id === "multiple")!.body, 1)).soal[0]!;
    expect(pilgan).toMatchObject({ tipe: "pilgan", kunci: ["B"] });
    expect(multiple).toMatchObject({ tipe: "multiple", kunci: ["A", "C"] });
  });

  test("semua template digabung dengan nomor lanjutan tetap terbaca utuh", () => {
    let text = "";
    let next = 1;
    for (const template of TEMPLATES) {
      const filled = fillTemplate(template.body, next);
      text = text ? `${text}\n\n${filled}` : filled;
      next = parseSoalText(text).soal.reduce((max, s) => Math.max(max, s.nomor), 0) + 1;
    }
    const { soal, errors } = parseSoalText(text);
    expect(errors).toEqual([]);
    expect(soal).toHaveLength(6);
    expect(soal.map((s) => s.nomor)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(soal.every((s) => s.errors.length === 0)).toBe(true);
    expect(soal[2]!.bacaan).not.toBeNull();
    expect(soal[3]!.bacaan).not.toBeNull();
    expect(soal[4]!.bacaan).toBeNull();
    expect(soal[5]).toMatchObject({ tipe: "multiple", kunci: ["A", "E"] });
  });

  test("contoh format lengkap terbaca tanpa error", () => {
    const { soal, errors } = parseSoalText(CONTOH_FORMAT);
    expect(errors).toEqual([]);
    expect(soal).toHaveLength(3);
    expect(soal.every((s) => s.errors.length === 0)).toBe(true);
  });
});
