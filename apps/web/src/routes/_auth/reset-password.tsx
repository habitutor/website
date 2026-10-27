import { CheckCircleIcon, CircleIcon, LockKeyIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/feedback/loader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { createMeta } from "@/lib/seo-utils";
import { cn } from "@/lib/utils";
import { AuthCard, AuthShell, FieldErrors } from "./-components/auth-shell";
import { PasswordInput } from "./-components/password-input";

export const Route = createFileRoute("/_auth/reset-password")({
  head: () => ({
    meta: createMeta({
      title: "Reset Password",
      description: "Atur ulang password akun Habitutor kamu.",
    }),
  }),
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: search.token as string,
    };
  },
});

const RESET_HIGHLIGHTS = [
  "Minimal 8 karakter",
  "Gunakan kombinasi yang mudah kamu ingat",
  "Langsung bisa dipakai masuk",
];

function RouteComponent() {
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  return (
    <AuthShell
      eyebrow="Hampir selesai"
      title={
        <>
          Bikin password baru, <span className="font-sr-serif text-sr-sun-400 italic">lanjut belajar lagi.</span>
        </>
      }
      description="Satu langkah lagi sebelum kamu kembali ke perjalanan belajarmu."
      highlights={RESET_HIGHLIGHTS}
      mascotHidden={isPasswordFocused}
      footer={
        <>
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold text-sr-blue-600 underline-offset-4 hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <ResetPasswordForm onPasswordFocusChange={setIsPasswordFocused} />
    </AuthShell>
  );
}

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium transition-colors",
        met ? "text-sr-live" : "text-sr-muted",
      )}
    >
      <motion.span key={String(met)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="inline-flex">
        {met ? <CheckCircleIcon weight="fill" className="size-4" /> : <CircleIcon className="size-4" />}
      </motion.span>
      {label}
    </li>
  );
}

function ResetPasswordForm({ onPasswordFocusChange }: { onPasswordFocusChange: (focused: boolean) => void }) {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      nextPassphrase: "",
      confirmNextPassphrase: "",
    },
    onSubmit: async ({ value }) => {
      if (value.nextPassphrase !== value.confirmNextPassphrase) {
        toast.error("Password tidak sama");
        return;
      }
      await authClient.resetPassword(
        {
          newPassword: value.nextPassphrase,
          token: search.token,
        },
        {
          onSuccess: () => {
            toast.success("Password berhasil diubah");
            navigate({ to: "/login" });
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: type({
        nextPassphrase: "string >= 8",
        confirmNextPassphrase: "string >= 8",
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  const focusHandlers = (handleBlur: () => void) => ({
    onFocus: () => onPasswordFocusChange(true),
    onBlur: () => {
      onPasswordFocusChange(false);
      handleBlur();
    },
  });

  return (
    <AuthCard>
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.span
          className="flex size-14 items-center justify-center rounded-sr-md bg-sr-blue-50 text-sr-blue-600"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.15 }}
        >
          <LockKeyIcon weight="duotone" className="size-7" />
        </motion.span>
        <h1 className="text-3xl font-extrabold text-sr-ink">
          Reset <span className="font-sr-serif text-sr-blue-600 italic">Password</span>
        </h1>
        <p className="text-sm text-sr-muted">Masukkan password baru kamu</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="mt-8 space-y-4"
      >
        <form.Field name="nextPassphrase">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Password Baru</Label>
              <PasswordInput
                id={field.name}
                name={field.name}
                autoFocus
                autoComplete="new-password"
                className="h-11"
                value={field.state.value}
                {...focusHandlers(field.handleBlur)}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldErrors errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field name="confirmNextPassphrase">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Konfirmasi Password</Label>
              <PasswordInput
                id={field.name}
                name={field.name}
                autoComplete="new-password"
                className="h-11"
                value={field.state.value}
                {...focusHandlers(field.handleBlur)}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldErrors errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values}>
          {(values) => (
            <ul className="space-y-1.5 rounded-sr-sm bg-sr-blue-50 px-3 py-2.5">
              <Requirement met={values.nextPassphrase.length >= 8} label="Minimal 8 karakter" />
              <Requirement
                met={values.confirmNextPassphrase.length > 0 && values.nextPassphrase === values.confirmNextPassphrase}
                label="Kedua password sama"
              />
            </ul>
          )}
        </form.Subscribe>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              size="lg"
              className="sr-sheen w-full"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Memuat..." : "Ubah Password"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  );
}
