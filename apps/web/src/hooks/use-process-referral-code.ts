import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";

export function useProcessReferralCode() {
  const mutation = useMutation(orpc.referral.use.mutationOptions());

  useEffect(() => {
    const processPendingCode = async () => {
      // Check jika ada pending referral code di session storage
      const pendingCode = sessionStorage.getItem("pendingReferralCode");
      if (!pendingCode) {
        console.log("[Referral] No pending code in session storage");
        return;
      }

      console.log("[Referral] Processing pending code:", pendingCode);
      try {
        const result = await mutation.mutateAsync({ code: pendingCode });
        console.log("[Referral] API response:", result);

        if (result.success) {
          toast.success(result.message || "Kode referral berhasil digunakan!");
          sessionStorage.removeItem("pendingReferralCode");
        } else {
          toast.error(result.message || "Gagal menggunakan kode referral.");
          console.warn("[Referral] Failed:", result.message);
        }
      } catch (error) {
        console.error("[Referral] Error processing referral code:", error);
        const errorMsg =
          (error instanceof Error ? error.message : JSON.stringify(error)) ||
          "Unknown error";
        console.error("[Referral] Error details:", errorMsg);
        // Jangan toast di sini, biarkan mutation handler handle error
      }
    };

    processPendingCode();
  }, [mutation]);

  return { isProcessing: mutation.isPending };
}
