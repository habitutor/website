import { type } from "arktype";

/** Dipakai daftar dan halaman edit, supaya kata cari, filter, dan nomor halaman ikut terbawa bolak-balik. */
export const questionsSearchSchema = type({
  "search?": "string",
  "page?": "number",
  "flashcard?": "'true' | 'false'",
  "reported?": "'true'",
});
