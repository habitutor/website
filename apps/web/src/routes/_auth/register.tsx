import { ArrowLeft } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { createMeta } from "@/lib/seo-utils";
import { SignUpForm } from "./register-form";

export const Route = createFileRoute("/_auth/register")({
  head: () => ({
    meta: createMeta({
      title: "Daftar",
      description: "Buat akun baru di Habitutor dan mulai persiapan SNBT/UTBK kamu sekarang.",
    }),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-y-auto px-4 py-16 md:justify-center">
      <Button
        asChild
        variant="outline"
        className="absolute top-4 left-4 border border-primary/50 bg-white text-primary hover:bg-primary/10"
      >
        <Link to="/">
          <ArrowLeft />
          Kembali
        </Link>
      </Button>
      <SignUpForm />
    </main>
  );
}
