import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { useNavigate, useSearch } from "@tanstack/react-router";

export function useProcessReferralCode() {
  const hasProcessed = useRef(false);
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { referralCode?: string };
  const referralCode = search.referralCode?.trim();

  const mutation = useMutation(orpc.referral.use.mutationOptions());

  useEffect(() => {
    if (!referralCode || hasProcessed.current) return;
    hasProcessed.current = true;

    mutation.mutateAsync(
      { code: referralCode },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success(result.message || "Kode referral berhasil digunakan!");
          } else {
            toast.error(result.message || "Gagal menggunakan kode referral.");
          }
        },
        onError: () => {
          toast.error("Terjadi kesalahan saat memproses kode referral.");
        },
        onSettled: () => {
          // Clean URL regardless of outcome
          navigate({ to: "/dashboard", replace: true });
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralCode]);
}
