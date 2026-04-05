import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Loader from "@/components/feedback/loader";
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

  if (flashcard.isPending) {
    return <Loader />;
  }

  if (flashcard.data?.status === "not_started") {
    return (
      <FlashcardNotStartedView showPremiumDialog={showPremiumDialog} onPremiumDialogChange={setShowPremiumDialog} />
    );
  }

  return (
    <div className="relative">
      <FlashcardBackgroundCircles />
      <div className="relative z-10">
        <FlashcardCard />
      </div>
    </div>
  );
}
