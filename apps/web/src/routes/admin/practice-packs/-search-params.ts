import { type } from "arktype";

/** Dipakai daftar dan halaman detail pack, supaya kata cari ikut terbawa bolak-balik. */
export const packSearchSchema = type({
  "search?": "string",
});
