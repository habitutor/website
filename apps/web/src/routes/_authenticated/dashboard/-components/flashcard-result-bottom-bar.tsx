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
      {showPremiumAlert && <FlashcardResultPremiumDialog onClose={() => setShowPremiumAlert(false)} />}

      <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-sr-line bg-white/95 p-3 backdrop-blur sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-xl gap-3 sm:justify-center">
          <Link
            to="/dashboard"
            className="flex h-12 flex-1 items-center justify-center rounded-sr-md border-2 border-sr-line bg-white text-sm font-extrabold text-sr-blue-700 transition-colors hover:border-sr-blue-200 hover:bg-sr-blue-50 sm:w-48 sm:flex-none"
          >
            Selesai
          </Link>
          <button
            type="button"
            onClick={() => startMutation.mutate({})}
            disabled={startMutation.isPending}
            className="h-12 flex-1 cursor-pointer rounded-sr-md border-b-4 border-sr-blue-800 bg-sr-blue-500 text-sm font-extrabold tracking-wide text-white uppercase transition-[transform,border-width] active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-48 sm:flex-none"
          >
            {startMutation.isPending ? "Memulai..." : "Main Lagi!"}
          </button>
        </div>
      </div>
    </>
  );
}
