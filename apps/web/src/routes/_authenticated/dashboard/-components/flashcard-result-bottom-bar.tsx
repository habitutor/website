import { isDefinedError } from "@orpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { NotPremiumDialog } from "@/components/ui/not-premium-dialog";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export function FlashcardResultBottomBar() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);

  const startMutation = useMutation(
    orpc.flashcard.start.mutationOptions({
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: orpc.flashcard.session.key() });
        navigate({ to: "/dashboard/flashcard" });
      },
      onError: (error) => {
        if (isDefinedError(error) && error.code === "NOT_FOUND") {
          toast.error("Ups! Kamu sudah mengerjakan semua Brain Gym yang tersedia!", {
            description: "Silahkan coba lagi dalam beberapa saat.",
          });
        } else if (isDefinedError(error) && error.code === "UNPROCESSABLE_CONTENT") {
          if (error.message.includes("memulai sesi flashcard hari ini")) {
            setShowPremiumAlert(true);
            return;
          }

          toast.error(error.message || "Permintaan tidak dapat diproses.");
        }
      },
    }),
  );

  return (
    <>
      <NotPremiumDialog open={showPremiumAlert} onOpenChange={setShowPremiumAlert} />

      <div className="fixed right-0 bottom-0 left-0 z-50 flex h-18 items-center justify-end gap-4 border-t border-neutral-200 bg-white px-6">
        <Button asChild variant="secondaryOutline" size="lg">
          <Link to="/dashboard">Selesaikan</Link>
        </Button>
        <Button onClick={() => startMutation.mutate({})} isPending={startMutation.isPending} size="lg">
          {startMutation.isPending ? "Memulai..." : "Main Lagi!"}
        </Button>
      </div>
    </>
  );
}
