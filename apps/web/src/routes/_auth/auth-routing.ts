import { isAdminRole } from "@habitutor/shared/auth-domain";

export function getPostLoginRedirectPath(role?: string | null) {
  return isAdminRole(role) ? "/admin/dashboard" : "/dashboard";
}

export function getPostRegisterRedirectPath(referralCode: string) {
  const normalizedReferralCode = referralCode.trim();
  if (!normalizedReferralCode) {
    return "/dashboard";
  }

  return `/dashboard?referralCode=${encodeURIComponent(normalizedReferralCode)}`;
}
