import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  clearOnboardingDraft,
  hasOnboardingAnswers,
  loadOnboardingDraft,
  toProfileUpdateInput,
} from "@/lib/onboarding-storage";
import { isOnboardingComplete } from "@/lib/onboarding-completion";
import { client, orpc } from "@/utils/orpc";

/**
 * Pushes onboarding answers saved before authentication (e.g. the Google
 * sign-up flow, which redirects away mid-wizard) to the user's profile.
 * Skips users who already have onboarding data so a stale draft from another
 * account on the same browser can't overwrite their profile.
 */
export function useSyncOnboardingProfile() {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(orpc.profile.me.queryOptions());
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    if (!profile || hasAttemptedRef.current) return;

    const draft = loadOnboardingDraft();
    if (!hasOnboardingAnswers(draft) || !draft) return;

    hasAttemptedRef.current = true;

    const alreadyOnboarded = isOnboardingComplete(profile);
    if (alreadyOnboarded) {
      clearOnboardingDraft();
      return;
    }

    client.profile
      .update(toProfileUpdateInput(draft.answers))
      .then(() => {
        clearOnboardingDraft();
        queryClient.invalidateQueries({ queryKey: orpc.profile.me.key() });
      })
      .catch(() => {
        hasAttemptedRef.current = false;
      });
  }, [profile, queryClient]);
}
