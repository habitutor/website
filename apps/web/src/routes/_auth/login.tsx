import { ArrowRightIcon, GoogleLogoIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { motion, useAnimate } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/feedback/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { createMeta } from "@/lib/seo-utils";
import { AuthCard, AuthDivider, AuthShell, FieldErrors } from "./-components/auth-shell";
import { PasswordInput } from "./-components/password-input";
import { getPostLoginRedirectPath } from "./auth-routing";

export const Route = createFileRoute("/_auth/login")({
  head: () => ({
    meta: createMeta({
      title: "Masuk",
      description: "Masuk ke akun Habitutor untuk memulai persiapan SNBT/UTBK kamu.",
    }),
  }),
  component: RouteComponent,
});

const LOGIN_HIGHLIGHTS = [
  "Lanjutkan streak belajarmu",
  "250+ video bahas soal",
  "Tryout rutin & komunitas pejuang PTN",
];

function RouteComponent() {
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  return (
    <AuthShell
      eyebrow="Selamat datang kembali"
      title={
        <>
          Satu langkah kecil hari ini, <span className="font-sr-serif text-sr-sun-400 italic">PTN impian</span> esok
          hari.
        </>
      }
      description="Masuk dan lanjutkan kebiasaan belajarmu bareng ribuan pejuang SNBT lainnya."
      highlights={LOGIN_HIGHLIGHTS}
      mascotHidden={isPasswordFocused}
      footer={
        <>
          Belum punya akun?{" "}
          <Link to="/register" className="font-bold text-sr-blue-600 underline-offset-4 hover:underline">
            Daftar Sekarang
          </Link>
        </>
      }
    >
      <SignInForm onPasswordFocusChange={setIsPasswordFocused} />
    </AuthShell>
  );
}

const fieldMotion = (index: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.25 + index * 0.07, duration: 0.4 },
});

function SignInForm({ onPasswordFocusChange }: { onPasswordFocusChange: (focused: boolean) => void }) {
  const navigate = useNavigate({
    from: "/",
  });
  const queryClient = useQueryClient();
  const { isPending } = authClient.useSession();
  const [scope, animate] = useAnimate();

  const shake = () => {
    if (scope.current) animate(scope.current, { x: [0, -10, 10, -6, 6, 0] }, { duration: 0.45 });
  };

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          rememberMe: true,
        },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["auth", "getSession"] });

            const session = await authClient.getSession();
            const user = session.data?.user as { role?: string } | undefined;
            navigate({ to: getPostLoginRedirectPath(user?.role) });
          },
          onError: (error) => {
            shake();
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    onSubmitInvalid: shake,
    validators: {
      onSubmit: type({
        email: "string.email",
        password: "string",
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div ref={scope}>
      <AuthCard>
        <motion.div className="flex flex-col items-center gap-2 text-center" {...fieldMotion(0)}>
          <h1 className="text-3xl font-extrabold text-sr-ink">
            Selamat Datang <span className="font-sr-serif text-sr-blue-600 italic">Kembali</span>
          </h1>
          <p className="text-sm text-sr-muted">Masuk kembali untuk memulai belajar lagi!</p>
        </motion.div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="mt-8 space-y-4"
        >
          <motion.div {...fieldMotion(1)}>
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    autoFocus
                    className="h-11"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldErrors errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </motion.div>

          <motion.div className="space-y-2" {...fieldMotion(2)}>
            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.name}>Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-sr-blue-600 underline-offset-4 hover:underline"
                    >
                      Lupa Password?
                    </Link>
                  </div>
                  <PasswordInput
                    id={field.name}
                    name={field.name}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    className="h-11"
                    value={field.state.value}
                    onFocus={() => onPasswordFocusChange(true)}
                    onBlur={() => {
                      onPasswordFocusChange(false);
                      field.handleBlur();
                    }}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldErrors errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </motion.div>

          <motion.div {...fieldMotion(3)}>
            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  size="lg"
                  className="group sr-sheen w-full"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting ? "Memuat..." : "Masuk"}
                  {!state.isSubmitting && (
                    <ArrowRightIcon weight="bold" className="transition-transform group-hover:translate-x-1" />
                  )}
                </Button>
              )}
            </form.Subscribe>
          </motion.div>
        </form>

        <motion.div {...fieldMotion(4)}>
          <AuthDivider />
          <Button
            onClick={() => {
              authClient.signIn.social({
                provider: "google",
                callbackURL: `${window.location.origin}/dashboard`,
              });
            }}
            variant="outline"
            size="lg"
            className="w-full hover:cursor-pointer"
          >
            <GoogleLogoIcon weight="bold" />
            Masuk dengan Google
          </Button>
        </motion.div>
      </AuthCard>
    </div>
  );
}
