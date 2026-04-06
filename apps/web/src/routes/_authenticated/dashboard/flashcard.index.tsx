import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import { FlashcardBackgroundCircles } from "./-components/flashcard-background-circles";
import { FlashcardCard } from "./-components/flashcard-card";
import { FlashcardNotStartedView } from "./-components/flashcard-not-started-view";

export const Route = createFileRoute("/_authenticated/dashboard/flashcard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = useRouteContext({ from: "/_authenticated" });
  const navigate = useNavigate();
  const flashcard = useQuery(
    orpc.flashcard.session.queryOptions({
      retry: false,
    }),
  );

  useEffect(() => {
    if (flashcard.data?.status === "submitted") {
      navigate({ to: "/dashboard/flashcard/result" });
    }
  }, [flashcard.data?.status, navigate]);

  const [showPremiumDialog, setShowPremiumDialog] = useState(!session?.user.isPremium);

  if (flashcard.data?.status === "not_started") {
    return (
      <FlashcardNotStartedView showPremiumDialog={showPremiumDialog} onPremiumDialogChange={setShowPremiumDialog} />
    );
  }

  return (
    <div className="relative">
      <FlashcardBackgroundCircles />
      <div className="relative z-10">
        {flashcard.isPending ? (
          <div className="mx-auto max-w-md">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <div className="mt-4 flex justify-center gap-4">
              <Skeleton className="h-12 w-28 rounded-xl" />
              <Skeleton className="h-12 w-28 rounded-xl" />
            </div>
          </div>
        ) : (
          <FlashcardCard />
        )}
      </div>
    </div>
  );
}
