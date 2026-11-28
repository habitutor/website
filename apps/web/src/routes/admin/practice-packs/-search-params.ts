import { type } from "arktype";

/** Dipakai daftar dan halaman detail pack, supaya kata cari dan nomor halaman ikut terbawa bolak-balik. */
export const packSearchSchema = type({
  "search?": "string",
  "page?": "number",
});
