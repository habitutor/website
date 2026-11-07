import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BrainIcon,
  BuildingsIcon,
  CakeIcon,
  CheckIcon,
  GoogleLogoIcon,
  GraduationCapIcon,
  type Icon,
  PhoneIcon,
  RocketLaunchIcon,
  StudentIcon,
} from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { type } from "arktype";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { AuthCard, AuthDivider, FieldErrors } from "../-components/auth-shell";
import { PasswordInput } from "../-components/password-input";
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

const STEP_ICONS: Icon[] = [
  BuildingsIcon,
  GraduationCapIcon,
  CakeIcon,
  StudentIcon,
  BrainIcon,
  PhoneIcon,
  RocketLaunchIcon,
];

interface OnboardingWizardProps {
  mode?: "register" | "complete";
  initialAnswers?: OnboardingAnswers;
  onComplete?: () => void | Promise<void>;
  showAvatar?: boolean;
  onStepChange?: (step: number) => void;
}

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

export function OnboardingWizard({
  mode = "register",
  initialAnswers,
  onComplete,
  showAvatar = true,
  onStepChange,
}: OnboardingWizardProps) {
  const totalSteps = mode === "complete" ? QUESTION_STEPS.length : TOTAL_STEPS;
  const [{ answers, step }, setDraft] = useState({
    answers: initialAnswers ?? EMPTY_ONBOARDING_ANSWERS,
    step: 0,
  });
  const [hydrated, setHydrated] = useState(mode === "complete");
  const [isSaving, setIsSaving] = useState(false);
  const previousStep = useRef(step);
  const direction = step >= previousStep.current ? 1 : -1;

  useEffect(() => {
    previousStep.current = step;
    onStepChange?.(step);
  }, [step, onStepChange]);

  // Hydrate from localStorage after mount so SSR markup stays deterministic
  useEffect(() => {
    if (mode === "complete") return;
    const stored = loadOnboardingDraft();
    if (stored) {
      setDraft({
        answers: stored.answers,
        step: Math.min(Math.max(stored.step, 0), totalSteps - 1),
      });
    }
    setHydrated(true);
  }, [mode, totalSteps]);

  useEffect(() => {
    if (mode === "complete" || !hydrated) return;
    saveOnboardingDraft({ answers, step });
  }, [answers, step, hydrated, mode]);

  const setAnswer = <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => {
    setDraft((prev) => ({ ...prev, answers: { ...prev.answers, [key]: value } }));
  };

  const goNext = () => setDraft((prev) => ({ ...prev, step: Math.min(prev.step + 1, totalSteps - 1) }));
  const goBack = () => setDraft((prev) => ({ ...prev, step: Math.max(prev.step - 1, 0) }));

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await client.profile.update(toProfileUpdateInput(answers));
      clearOnboardingDraft();
      await onComplete?.();
    } catch {
      toast.error("Gagal menyimpan profil. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const isAccountStep = mode === "register" && step === QUESTION_STEPS.length;

  return (
    <div className="relative w-full max-w-md">
      {showAvatar && (
        <div className="absolute -top-8 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
          <Image src="/avatar/login-avatar.webp" alt="Study Avatar" width={120} height={120} />
        </div>
      )}

      <AuthCard className={cn(showAvatar && "pt-16 sm:pt-16")}>
        <StepProgress step={step} totalSteps={totalSteps} />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: 40 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 * direction }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {isAccountStep ? (
              <AccountStep answers={answers} onBack={goBack} />
            ) : (
              <QuestionStep
                step={step}
                answers={answers}
                setAnswer={setAnswer}
                onNext={goNext}
                onBack={goBack}
                isLastStep={mode === "complete" && step === QUESTION_STEPS.length - 1}
                onFinish={handleComplete}
                isSaving={isSaving}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </AuthCard>

      {mode === "register" && (
        <p className="mt-5 text-center text-sm text-sr-ink-2">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold text-sr-blue-600 underline-offset-4 hover:underline">
            Masuk Sekarang
          </Link>
        </p>
      )}
    </div>
  );
}

function StepProgress({ step, totalSteps }: { step: number; totalSteps: number }) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-sr-muted">
          Langkah <span className="text-sr-blue-600">{step + 1}</span> dari {totalSteps}
        </span>
        <span className="text-sr-amber-700">{Math.round(((step + 1) / totalSteps) * 100)}%</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-sr-line">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-sr-blue-500 to-sr-sun-400"
              initial={false}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionStep({
  step,
  answers,
  setAnswer,
  onNext,
  onBack,
  isLastStep = false,
  onFinish,
  isSaving = false,
}: {
  step: number;
  answers: OnboardingAnswers;
  setAnswer: <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => void;
  onNext: () => void;
  onBack: () => void;
  isLastStep?: boolean;
  onFinish?: () => void;
  isSaving?: boolean;
}) {
  const key = QUESTION_STEPS[step];
  const valid = isStepValid(step, answers);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!valid) return;
        if (isLastStep) {
          onFinish?.();
          return;
        }
        onNext();
      }}
      className="space-y-6"
    >
      {key === "dreamCampus" && (
        <StepShell
          step={step}
          title="Apa kampus impian kamu?"
          subtitle="Tulis nama PTN atau kampus yang paling kamu incar."
        >
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
        <StepShell
          step={step}
          title="Apa jurusan impian kamu?"
          subtitle="Jurusan yang bakal kamu perjuangin sampai hari-H."
        >
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
        <StepShell step={step} title="Berapa umur kamu?" subtitle="Biar kami bisa menyesuaikan materi buat kamu.">
          <Input
            type="number"
            min={10}
            max={60}
            value={answers.age}
            onChange={(e) => setAnswer("age", e.target.value)}
            placeholder="Contoh: 17"
            className="h-11"
            autoFocus
          />
        </StepShell>
      )}

      {key === "educationLevel" && (
        <StepShell step={step} title="Sekarang kamu di jenjang apa?" subtitle="Pilih salah satu.">
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
        <StepShell step={step} title="Mapel apa yang paling sulit buat kamu?" subtitle="Boleh pilih lebih dari satu.">
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
        <StepShell step={step} title="Berapa nomor HP kamu?" subtitle="Buat info penting seputar kelas dan komunitas.">
          <Input
            type="tel"
            value={answers.phoneNumber}
            onChange={(e) => setAnswer("phoneNumber", e.target.value)}
            placeholder="Contoh: 081234567890"
            className="h-11"
            autoFocus
          />
          {answers.phoneNumber.trim().length > 0 && !valid && (
            <p className="text-xs text-red-500">Masukkan nomor HP Indonesia yang valid (contoh: 081234567890).</p>
          )}
        </StepShell>
      )}

      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={step === 0}>
          <ArrowLeftIcon />
          Kembali
        </Button>
        <Button type="submit" size="lg" className="group sr-sheen" disabled={!valid || isSaving}>
          {isLastStep ? (isSaving ? "Menyimpan..." : "Selesai") : "Lanjut"}
          {!isLastStep && <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />}
        </Button>
      </div>
    </form>
  );
}

function StepIcon({ step }: { step: number }) {
  const StepGlyph = STEP_ICONS[step] ?? RocketLaunchIcon;

  return (
    <motion.span
      className="mx-auto flex size-14 items-center justify-center rounded-sr-md sr-card-sun"
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.05 }}
    >
      <StepGlyph weight="duotone" className="size-7" />
    </motion.span>
  );
}

function StepShell({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-3 text-center">
        <StepIcon step={step} />
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-sr-ink">{title}</h1>
          <p className="text-sm text-sr-muted">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SelectBubble({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.94 }}
      animate={selected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border-2 px-4 py-2 text-left text-sm font-semibold transition-colors",
        selected
          ? "border-transparent bg-sr-blue-500 text-white shadow-sr-2"
          : "border-sr-line-2 bg-white text-sr-ink-2 hover:border-sr-blue-200 hover:bg-sr-blue-50",
      )}
    >
      <AnimatePresence initial={false}>
        {selected && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden"
          >
            <CheckIcon weight="bold" className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
      {label}
    </motion.button>
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
      <div className="space-y-3 text-center">
        <StepIcon step={QUESTION_STEPS.length} />
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-sr-ink">
            Satu langkah <span className="font-sr-serif text-sr-blue-600 italic">terakhir!</span>
          </h1>
          <p className="text-sm text-sr-muted">Buat akun kamu dan mulai belajar hari ini.</p>
        </div>
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
                className="h-11"
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                autoFocus
              />
              <FieldErrors errors={field.state.meta.errors} />
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
                autoComplete="email"
                className="h-11"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldErrors errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field name="accountPassphrase">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Password</Label>
              <PasswordInput
                id={field.name}
                name={field.name}
                autoComplete="new-password"
                className="h-11"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldErrors errors={field.state.meta.errors} />
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
              <PasswordInput
                id={field.name}
                name={field.name}
                autoComplete="new-password"
                className="h-11"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldErrors errors={field.state.meta.errors} />
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
                className="h-11"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              size="lg"
              className="group sr-sheen w-full"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Memuat..." : "Daftar & Mulai Belajar"}
              {!state.isSubmitting && (
                <RocketLaunchIcon weight="fill" className="transition-transform group-hover:-translate-y-0.5" />
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <AuthDivider />

      <Button
        onClick={() =>
          authClient.signIn.social({
            provider: "google",
            callbackURL: `${window.location.origin}/dashboard`,
          })
        }
        variant="outline"
        size="lg"
        className="w-full hover:cursor-pointer"
      >
        <GoogleLogoIcon weight="bold" />
        Daftar dengan Google
      </Button>

      <Button type="button" variant="ghost" onClick={onBack} className="h-auto min-h-9 w-full py-2 whitespace-normal">
        <ArrowLeftIcon />
        Kembali ke pertanyaan sebelumnya
      </Button>
    </div>
  );
}
