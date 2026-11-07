import { ArrowCounterClockwiseIcon, EnvelopeSimpleIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { type } from "arktype";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { createMeta } from "@/lib/seo-utils";
import { AuthCard, AuthShell, FieldErrors } from "./-components/auth-shell";

const resetPasswordSearchSchema = type({
  email: "string.email?",
});

export const Route = createFileRoute("/_auth/forgot-password")({
  head: () => ({
    meta: createMeta({
      title: "Lupa Password",
      description: "Lupa password akun Habitutor? Reset password kamu melalui email yang terdaftar.",
    }),
  }),
  component: RouteComponent,
  validateSearch: resetPasswordSearchSchema,
});

const FORGOT_HIGHLIGHTS = [
  "Link reset dikirim ke email kamu",
  "Streak dan progres belajarmu tetap aman",
  "Langsung lanjut belajar lagi",
];

const stepMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] as const },
};

function RouteComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_auth/forgot-password" });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      email: search.email || "",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      const { error } = await authClient.requestPasswordReset({
        email: value.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error(error);
        toast.error(error.message || "Terjadi kesalahan. Silakan coba lagi.");
      } else {
        setHasSubmitted(true);
      }
      setIsSubmitting(false);
    },
    validators: {
      onSubmit: type({
        email: "string.email",
      }),
    },
  });

  return (
    <AuthShell
      eyebrow="Tenang, bisa diatur"
      title={
        <>
          Lupa password? <span className="font-sr-serif text-sr-sun-400 italic">Bukan masalah.</span>
        </>
      }
      description="Masukkan email akunmu, nanti kami kirim link untuk bikin password baru."
      highlights={FORGOT_HIGHLIGHTS}
      footer={
        !hasSubmitted && (
          <>
            Ingat password?{" "}
            <Link to="/login" className="font-bold text-sr-blue-600 underline-offset-4 hover:underline">
              Masuk
            </Link>
          </>
        )
      }
    >
      <AuthCard>
        <AnimatePresence mode="wait" initial={false}>
          {hasSubmitted ? (
            <motion.div key="sent" className="flex flex-col items-center gap-5 text-center" {...stepMotion}>
              <motion.span
                className="relative flex size-20 items-center justify-center rounded-full sr-card-sun"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 }}
              >
                <span className="absolute inset-0 animate-sr-halo rounded-full bg-sr-sun-400" />
                <PaperPlaneTiltIcon weight="fill" className="relative size-9" />
              </motion.span>
              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold text-sr-ink">
                  Email <span className="font-sr-serif text-sr-blue-600 italic">Terkirim!</span>
                </h1>
                <p className="text-sm text-sr-ink-2">
                  Kami telah mengirimkan instruksi pengaturan ulang kata sandi ke{" "}
                  <span className="font-semibold text-sr-ink">{form.state.values.email}</span>. Silakan periksa inbox
                  (dan folder spam) kamu.
                </p>
              </div>

              <Button onClick={() => navigate({ to: "/login" })} size="lg" className="sr-sheen w-full">
                Kembali ke Halaman Masuk
              </Button>
              <button
                type="button"
                onClick={() => setHasSubmitted(false)}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-sr-blue-600 underline-offset-4 hover:underline"
              >
                <ArrowCounterClockwiseIcon weight="bold" className="size-4" />
                Salah email? Kirim ulang
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" {...stepMotion}>
              <div className="flex flex-col items-center gap-3 text-center">
                <motion.span
                  className="flex size-14 items-center justify-center rounded-sr-md bg-sr-blue-50 text-sr-blue-600"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.15 }}
                >
                  <EnvelopeSimpleIcon weight="duotone" className="size-7" />
                </motion.span>
                <h1 className="text-3xl font-extrabold text-sr-ink">
                  Lupa <span className="font-sr-serif text-sr-blue-600 italic">Password</span>
                </h1>
                <p className="text-sm text-sr-muted">Kami bantu kamu masuk lagi dalam beberapa langkah.</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="mt-8 space-y-4"
              >
                <form.Field name="email">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Email</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="email"
                          autoFocus
                          className="h-11"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="email@contoh.com"
                          autoComplete="email"
                        />
                        <FieldErrors errors={isInvalid ? field.state.meta.errors : []} />
                      </div>
                    );
                  }}
                </form.Field>

                <form.Subscribe>
                  {(state) => (
                    <Button
                      type="submit"
                      size="lg"
                      className="group sr-sheen w-full"
                      disabled={!state.canSubmit || state.isSubmitting || isSubmitting}
                    >
                      {state.isSubmitting || isSubmitting ? "Memuat..." : "Kirim Instruksi"}
                      {!(state.isSubmitting || isSubmitting) && (
                        <PaperPlaneTiltIcon
                          weight="fill"
                          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      )}
                    </Button>
                  )}
                </form.Subscribe>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </AuthCard>
    </AuthShell>
  );
}
