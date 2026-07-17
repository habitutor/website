import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import Loader from "@/components/feedback/loader";
import { createMeta } from "@/lib/seo-utils";
import { isOnboardingComplete, profileToOnboardingAnswers } from "@/lib/onboarding-completion";
import { orpc } from "@/utils/orpc";
import { OnboardingWizard } from "@/routes/_auth/-onboarding/onboarding-wizard";

export const Route = createFileRoute("/_authenticated/onboarding/")({
  head: () => ({
    meta: createMeta({
      title: "Lengkapi Profil",
      description: "Lengkapi profil belajarmu di Habitutor.",
      noIndex: true,
    }),
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isPending } = useQuery(orpc.profile.me.queryOptions());

  useEffect(() => {
    if (profile && isOnboardingComplete(profile)) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [profile, navigate]);

  if (isPending || !profile) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </main>
    );
  }

  if (isOnboardingComplete(profile)) {
    return null;
  }

  return (
    <main className="relative flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-10">
      <OnboardingWizard
        mode="complete"
        initialAnswers={profileToOnboardingAnswers(profile)}
        onComplete={async () => {
          await queryClient.invalidateQueries({ queryKey: orpc.profile.me.key() });
          navigate({ to: "/dashboard", replace: true });
        }}
      />
    </main>
  );
}
