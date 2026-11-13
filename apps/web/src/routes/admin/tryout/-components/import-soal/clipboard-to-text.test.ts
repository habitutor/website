import { beforeAll, describe, expect, test } from "bun:test";
// @ts-expect-error -- jsdom (devDependency) tidak menyertakan tipe; hanya dipakai untuk menyediakan DOMParser di test.
import { JSDOM } from "jsdom";
import { htmlToPlainText, toScript } from "./clipboard-to-text";
import { parseSoalText } from "./parse-soal-text";

beforeAll(() => {
  const { window } = new JSDOM("");
  globalThis.DOMParser = window.DOMParser;
  globalThis.Node = window.Node;
});

describe("toScript", () => {
  test("mengubah angka dan tanda menjadi Unicode", () => {
    expect(toScript("2", "sup")).toBe("²");
    expect(toScript("-1", "sup")).toBe("⁻¹");
    expect(toScript("2", "sub")).toBe("₂");
  });

  test("memakai notasi ^ / _ jika tidak ada padanan Unicode", () => {
    expect(toScript("k", "sup")).toBe("^k");
    expect(toScript("2k", "sup")).toBe("^(2k)");
    expect(toScript("max", "sub")).toBe("_(max)");
  });
});

describe("htmlToPlainText", () => {
  test("paragraf, <br>, pangkat dan indeks", () => {
    const html = `<p>Jika x<sup>2</sup> = 9</p><p>maka H<sub>2</sub>O<br>adalah air</p>`;
    expect(htmlToPlainText(html)).toBe("Jika x² = 9\nmaka H₂O\nadalah air");
  });

  test("pangkat gaya Google Docs (vertical-align: super)", () => {
    const html = `<b id="docs-internal-guid-1"><p><span>10</span><span style="vertical-align: super">3</span></p></b>`;
    expect(htmlToPlainText(html)).toBe("10³");
  });

  test("daftar bernomor Google Docs mendapat nomor dan huruf", () => {
    const html = `
      <ol style="list-style-type:decimal"><li><p>Soal pertama</p>
        <ol style="list-style-type:upper-alpha"><li>satu</li><li>dua</li></ol>
      </li></ol>
      <ol start="2"><li><p>Soal kedua</p></li></ol>`;
    expect(htmlToPlainText(html)).toBe("1. Soal pertama\nA. satu\nB. dua\n2. Soal kedua");
  });

  test("format Word: nomor ada di teks, style dan komentar diabaikan", () => {
    const html = `<html><head><style>p{}</style></head><body>
      <p class=MsoListParagraph><!--[if !supportLists]--><span style='mso-list:Ignore'>1.<span>&nbsp;&nbsp; </span></span><!--[endif]-->Nilai
      dari 2<sup>3</sup> adalah<o:p></o:p></p>
      <p class=MsoNormal>A. 6</p><p class=MsoNormal>B. 8</p><p class=MsoNormal>Kunci: B</p>
    </body></html>`;
    const text = htmlToPlainText(html);
    expect(text).toBe("1. Nilai dari 2³ adalah\nA. 6\nB. 8\nKunci: B");
    expect(parseSoalText(text).soal[0]).toMatchObject({ pertanyaan: "Nilai dari 2³ adalah", kunci: ["B"], errors: [] });
  });

  test("tabel menjadi baris dengan pemisah |", () => {
    const html = `<table><tr><td>Tahun</td><td>Jumlah</td></tr><tr><td>2020</td><td>15</td></tr></table>`;
    expect(htmlToPlainText(html)).toBe("Tahun | Jumlah\n2020 | 15");
  });
});
