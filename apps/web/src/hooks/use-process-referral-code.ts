import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";

export function useProcessReferralCode() {
  const mutation = useMutation(orpc.referral.use.mutationOptions());

  useEffect(() => {
    const processPendingCode = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const pendingCode = searchParams.get("referralCode")?.trim();
      if (!pendingCode) {
        return;
      }

      try {
        const result = await mutation.mutateAsync({ code: pendingCode });

        if (result.success) {
          toast.success(result.message || "Kode referral berhasil digunakan!");
          searchParams.delete("referralCode");
          const queryString = searchParams.toString();
          const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
          window.history.replaceState(null, "", nextUrl);
        } else {
          toast.error(result.message || "Gagal menggunakan kode referral.");
        }
      } catch (error) {
        console.error("Error processing referral code:", error);
      }
    };

    processPendingCode();
  }, [mutation]);

  return { isProcessing: mutation.isPending };
}
