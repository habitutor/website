import { isAdminRole } from "@habitutor/shared/auth-domain";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { isOnboardingComplete } from "@/lib/onboarding-completion";
import { orpc } from "@/utils/orpc";

/**
 * After login, checks profile completeness in the background and redirects
 * incomplete users to /onboarding without blocking the initial render.
 */
export function useOnboardingGuard(session: { user: { role?: string | null } } | null) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile, isLoading } = useQuery({
    ...orpc.profile.me.queryOptions(),
    enabled: Boolean(session) && !isAdminRole(session?.user.role),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!session || isAdminRole(session.user.role)) return;
		if (location.pathname.startsWith("/onboarding")) return;
    if (isLoading || !profile) return;
    if (!isOnboardingComplete(profile)) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [session, profile, isLoading, location.pathname, navigate]);
}
