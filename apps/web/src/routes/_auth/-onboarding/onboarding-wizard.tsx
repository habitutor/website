import { ArrowLeftIcon, ArrowRightIcon, GoogleLogoIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { type } from "arktype";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import {
  clearOnboardingDraft,
  EMPTY_ONBOARDING_ANSWERS,
  loadOnboardingDraft,
  type OnboardingAnswers,
  saveOnboardingDraft,
  toProfileUpdateInput,
} from "@/lib/onboarding-storage";
import { cn } from "@/lib/utils";
import { client } from "@/utils/orpc";
import { getPostRegisterRedirectPath } from "../auth-routing";
import {
  CAMPUS_SUGGESTIONS,
  EDUCATION_LEVELS,
  MAJOR_SUGGESTIONS,
  PHONE_NUMBER_PATTERN,
  SNBT_SUBJECTS,
} from "./constants";
import { AutocompleteInput } from "./autocomplete-input";

const QUESTION_STEPS = [
  "dreamCampus",
  "dreamMajor",
  "age",
  "educationLevel",
  "difficultSubjects",
  "phoneNumber",
] as const;

const TOTAL_STEPS = QUESTION_STEPS.length + 1; // + account creation step

function isStepValid(step: number, answers: OnboardingAnswers): boolean {
  switch (QUESTION_STEPS[step]) {
    case "dreamCampus":
      return answers.dreamCampus.trim().length >= 2;
    case "dreamMajor":
      return answers.dreamMajor.trim().length >= 2;
    case "age": {
      const age = Number.parseInt(answers.age, 10);
      return Number.isFinite(age) && age >= 10 && age <= 60;
    }
    case "educationLevel":
      return answers.educationLevel.length > 0;
    case "difficultSubjects":
      return answers.difficultSubjects.length > 0;
    case "phoneNumber":
      return PHONE_NUMBER_PATTERN.test(answers.phoneNumber.trim());
    default:
      return true;
  }
}

export function OnboardingWizard() {
  const [{ answers, step }, setDraft] = useState({ answers: EMPTY_ONBOARDING_ANSWERS, step: 0 });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount so SSR markup stays deterministic
  useEffect(() => {
    const stored = loadOnboardingDraft();
    if (stored) {
      setDraft({
        answers: stored.answers,
        step: Math.min(Math.max(stored.step, 0), TOTAL_STEPS - 1),
      });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveOnboardingDraft({ answers, step });
  }, [answers, step, hydrated]);

  const setAnswer = <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => {
    setDraft((prev) => ({ ...prev, answers: { ...prev.answers, [key]: value } }));
  };

  const goNext = () => setDraft((prev) => ({ ...prev, step: Math.min(prev.step + 1, TOTAL_STEPS - 1) }));
  const goBack = () => setDraft((prev) => ({ ...prev, step: Math.max(prev.step - 1, 0) }));

  const isAccountStep = step === QUESTION_STEPS.length;

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute -top-8 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
        <Image src="/avatar/login-avatar.webp" alt="Study Avatar" width={120} height={120} />
      </div>

      <div className="relative z-10 w-full rounded-sm border border-primary/50 bg-white p-8 pt-16 shadow-lg">
        <div className="mb-6 space-y-2">
          <p className="text-center text-xs font-medium text-muted-foreground">
            Langkah {step + 1} dari {TOTAL_STEPS}
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
            <motion.div
              className="h-full rounded-full bg-primary-300"
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            {isAccountStep ? (
              <AccountStep answers={answers} onBack={goBack} />
            ) : (
              <QuestionStep step={step} answers={answers} setAnswer={setAnswer} onNext={goNext} onBack={goBack} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-4 text-center text-sm">
        Sudah punya akun?{" "}
        <Link to="/login" className="font-bold text-primary">
          Masuk Sekarang
        </Link>
      </p>
    </div>
  );
}

function QuestionStep({
  step,
  answers,
  setAnswer,
  onNext,
  onBack,
}: {
  step: number;
  answers: OnboardingAnswers;
  setAnswer: <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const key = QUESTION_STEPS[step];
  const valid = isStepValid(step, answers);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) onNext();
      }}
      className="space-y-6"
    >
      {key === "dreamCampus" && (
        <StepShell title="Apa kampus impian kamu?" subtitle="Tulis nama PTN atau kampus yang paling kamu incar.">
          <AutocompleteInput
            value={answers.dreamCampus}
            onChange={(value) => setAnswer("dreamCampus", value)}
            suggestions={CAMPUS_SUGGESTIONS}
            placeholder="Contoh: Universitas Gadjah Mada"
            autoFocus
          />
        </StepShell>
      )}

      {key === "dreamMajor" && (
        <StepShell title="Apa jurusan impian kamu?" subtitle="Jurusan yang bakal kamu perjuangin sampai hari-H.">
          <AutocompleteInput
            value={answers.dreamMajor}
            onChange={(value) => setAnswer("dreamMajor", value)}
            suggestions={MAJOR_SUGGESTIONS}
            placeholder="Contoh: Kedokteran"
            autoFocus
          />
        </StepShell>
      )}

      {key === "age" && (
        <StepShell title="Berapa umur kamu?" subtitle="Biar kami bisa menyesuaikan materi buat kamu.">
          <Input
            type="number"
            min={10}
            max={60}
            value={answers.age}
            onChange={(e) => setAnswer("age", e.target.value)}
            placeholder="Contoh: 17"
            autoFocus
          />
        </StepShell>
      )}

      {key === "educationLevel" && (
        <StepShell title="Sekarang kamu di jenjang apa?" subtitle="Pilih salah satu.">
          <div className="flex flex-wrap gap-2">
            {EDUCATION_LEVELS.map((level) => (
              <SelectBubble
                key={level}
                label={level}
                selected={answers.educationLevel === level}
                onClick={() => setAnswer("educationLevel", level)}
              />
            ))}
          </div>
        </StepShell>
      )}

      {key === "difficultSubjects" && (
        <StepShell title="Mapel apa yang paling sulit buat kamu?" subtitle="Boleh pilih lebih dari satu.">
          <div className="flex flex-wrap gap-2">
            {SNBT_SUBJECTS.map((subject) => {
              const selected = answers.difficultSubjects.includes(subject);
              return (
                <SelectBubble
                  key={subject}
                  label={subject}
                  selected={selected}
                  onClick={() =>
                    setAnswer(
                      "difficultSubjects",
                      selected
                        ? answers.difficultSubjects.filter((s) => s !== subject)
                        : [...answers.difficultSubjects, subject],
                    )
                  }
                />
              );
            })}
          </div>
        </StepShell>
      )}

      {key === "phoneNumber" && (
        <StepShell title="Berapa nomor HP kamu?" subtitle="Buat info penting seputar kelas dan komunitas.">
          <Input
            type="tel"
            value={answers.phoneNumber}
            onChange={(e) => setAnswer("phoneNumber", e.target.value)}
            placeholder="Contoh: 081234567890"
            autoFocus
          />
          {answers.phoneNumber.trim().length > 0 && !valid && (
            <p className="text-xs text-red-500">Masukkan nomor HP Indonesia yang valid (contoh: 081234567890).</p>
          )}
        </StepShell>
      )}

      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={step === 0}>
          <ArrowLeftIcon />
          Kembali
        </Button>
        <Button type="submit" disabled={!valid}>
          Lanjut
          <ArrowRightIcon />
        </Button>
      </div>
    </form>
  );
}

function StepShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SelectBubble({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "border-primary-300 bg-primary-300 text-white"
          : "border-neutral-300 bg-white text-neutral-800 hover:border-primary-200 hover:bg-primary-100/30",
      )}
    >
      {label}
    </button>
  );
}

function AccountStep({ answers, onBack }: { answers: OnboardingAnswers; onBack: () => void }) {
  const navigate = useNavigate({ from: "/" });
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      accountPassphrase: "",
      confirmAccountPassphrase: "",
      referralCode: "",
    },
    onSubmit: async ({ value }) => {
      if (value.accountPassphrase !== value.confirmAccountPassphrase) {
        toast.error("Password harus sama. Silakan cek ulang.");
        return;
      }

      const result = await authClient.signUp.email(
        {
          email: value.email,
          password: value.accountPassphrase,
          name: value.name,
          phoneNumber: answers.phoneNumber.trim() || undefined,
        },
        {},
      );

      if (result.error) {
        toast.error(result.error.message || result.error.statusText || "Gagal mendaftar");
        return;
      }

      try {
        await client.profile.update(toProfileUpdateInput(answers));
        clearOnboardingDraft();
      } catch {
        // Answers stay in localStorage; the dashboard sync will retry
      }

      await queryClient.invalidateQueries({ queryKey: ["auth", "getSession"] });
      navigate({ to: getPostRegisterRedirectPath(value.referralCode) });
    },
    validators: {
      onSubmit: type({
        name: "string >= 2",
        email: "string.email",
        accountPassphrase: "string >= 8",
        confirmAccountPassphrase: "string >= 8",
      }),
    },
  });

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-primary">Satu langkah terakhir!</h1>
        <p className="text-sm text-muted-foreground">Buat akun kamu dan mulai belajar hari ini.</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Nama</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                autoFocus
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-red-500">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Email</Label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-red-500">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="accountPassphrase">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Password</Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-red-500">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field
          name="confirmAccountPassphrase"
          validators={{
            onChangeListenTo: ["accountPassphrase"],
            onChange: ({ value, fieldApi }) => {
              if (value !== fieldApi.form.getFieldValue("accountPassphrase"))
                return "Password harus sama. Silakan cek ulang.";
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Ulangi Password</Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {field.state.meta.errors.map((error, index) => (
                <p key={`${field.name}-${index}`} className="text-xs text-red-500">
                  {typeof error === "string" ? error : error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="referralCode">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Kode Referral (Opsional)</Label>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Subscribe>
          {(state) => (
            <Button type="submit" className="w-full" disabled={!state.canSubmit || state.isSubmitting}>
              {state.isSubmitting ? "Memuat..." : "Daftar"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="flex items-center gap-4 py-2">
        <Separator className="flex-1" />
        <span className="shrink-0 text-xs text-muted-foreground uppercase">atau</span>
        <Separator className="flex-1" />
      </div>

      <Button
        onClick={() =>
          authClient.signIn.social({
            provider: "google",
            callbackURL: `${window.location.origin}/dashboard`,
          })
        }
        variant="outline"
        className="w-full hover:cursor-pointer"
      >
        <GoogleLogoIcon weight="bold" />
        Daftar dengan Google
      </Button>

      <Button type="button" variant="ghost" onClick={onBack} className="w-full">
        <ArrowLeftIcon />
        Kembali ke pertanyaan sebelumnya
      </Button>
    </div>
  );
}
