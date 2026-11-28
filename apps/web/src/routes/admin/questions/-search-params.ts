import { type } from "arktype";

/** Dipakai daftar dan halaman edit, supaya kata cari dan filter ikut terbawa bolak-balik. */
export const questionsSearchSchema = type({
  "search?": "string",
  "flashcard?": "'true' | 'false'",
  "reported?": "'true'",
});
