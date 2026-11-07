import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createMeta } from "@/lib/seo-utils";
import { AuthShell } from "./-components/auth-shell";
import { OnboardingWizard } from "./-onboarding/onboarding-wizard";

export const Route = createFileRoute("/_auth/register")({
  head: () => ({
    meta: createMeta({
      title: "Daftar",
      description: "Buat akun baru di Habitutor dan mulai persiapan SNBT/UTBK kamu sekarang.",
    }),
  }),
  component: RouteComponent,
});

const REGISTER_HIGHLIGHTS = [
  "Mulai dari 3 menit sehari",
  "Mentor dari UI, ITB, dan UGM",
  "Komunitas sesama pejuang PTN",
];

function RouteComponent() {
  const [step, setStep] = useState(0);

  return (
    <AuthShell
      eyebrow="#MulaiDariHabit"
      title={
        <>
          Mulai perjalananmu ke <span className="font-sr-serif text-sr-sun-400 italic">PTN impian</span>.
        </>
      }
      description="Jawab beberapa pertanyaan singkat supaya Habitutor bisa menyesuaikan belajarmu."
      highlights={REGISTER_HIGHLIGHTS}
      mascotKey={step}
    >
      <OnboardingWizard showAvatar={false} onStepChange={setStep} />
    </AuthShell>
  );
}
