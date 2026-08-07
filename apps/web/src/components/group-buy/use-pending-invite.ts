import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

const PENDING_INVITE_KEY = "habitutor:pending-group-invite";

export function storePendingGroupInvite(inviteCode: string) {
  try {
    localStorage.setItem(PENDING_INVITE_KEY, inviteCode);
  } catch {
    // Storage unavailable (private mode) — the user still has the link.
  }
}

export function clearPendingGroupInvite() {
  try {
    localStorage.removeItem(PENDING_INVITE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

// A friend opening an invite link often has to register/login first, which
// lands them on the dashboard. This sends them back to the invite exactly once.
export function usePendingGroupInviteRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    let inviteCode: string | null = null;
    try {
      inviteCode = localStorage.getItem(PENDING_INVITE_KEY);
    } catch {
      return;
    }

    if (!inviteCode) return;

    clearPendingGroupInvite();
    navigate({ to: "/group-buy/$inviteCode", params: { inviteCode } });
  }, [navigate]);
}
