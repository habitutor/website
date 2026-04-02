import { isDefinedError } from "@orpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { FlashcardResultPremiumDialog } from "./flashcard-result-premium-dialog";

export function FlashcardResultBottomBar() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);

  const startMutation = useMutation(
    orpc.flashcard.start.mutationOptions({
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: orpc.flashcard.get.key() });
        navigate({ to: "/dashboard/flashcard" });
      },
      onError: (error) => {
        if (isDefinedError(error) && error.code === "NOT_FOUND") {
          toast.error("Ups! Kamu sudah mengerjakan semua Brain Gym yang tersedia!", {
            description: "Silahkan coba lagi dalam beberapa saat.",
          });
        } else if (isDefinedError(error) && error.code === "UNPROCESSABLE_CONTENT") {
          setShowPremiumAlert(true);
        }
      },
    }),
  );

  return (
    <>
      {showPremiumAlert && <FlashcardResultPremiumDialog onClose={() => setShowPremiumAlert(false)} />}

      <div className="fixed right-0 bottom-0 left-0 z-50 flex h-22.75 items-center justify-end gap-4 border-t border-neutral-500 bg-white px-6">
        <Link
          to="/dashboard"
          className="flex h-10.5 w-50 items-center justify-center rounded-lg border border-primary-300 text-[15px] text-primary-300 no-underline transition-colors hover:bg-blue-50"
        >
          Selesaikan
        </Link>
        <button
          onClick={() => startMutation.mutate({})}
          disabled={startMutation.isPending}
          className="h-10.5 w-50 rounded-lg border border-primary-300 bg-primary-300 text-[15px] text-white transition-colors hover:bg-[#2d4082] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {startMutation.isPending ? "Memulai..." : "Main Lagi!"}
        </button>
      </div>
    </>
  );
}
