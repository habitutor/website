import { createFileRoute, redirect } from "@tanstack/react-router";

/** Tautan ajakan pendek: habitutor.id/r/KODE -> halaman daftar dengan kode referral terisi. */
export const Route = createFileRoute("/r/$code")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/register", search: { ref: params.code } });
  },
});
