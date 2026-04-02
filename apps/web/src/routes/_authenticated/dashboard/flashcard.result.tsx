import { createFileRoute } from "@tanstack/react-router";
import { STYLES } from "./-components/flashcard-result-animations";
import { FlashcardResultBottomBar } from "./-components/flashcard-result-bottom-bar";
import { LeaderboardSection } from "./-components/flashcard-result-leaderboard";
import { ResultsSection } from "./-components/flashcard-result-answers";

export const Route = createFileRoute("/_authenticated/dashboard/flashcard/result")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <style>{STYLES}</style>

      {/* Background circle */}
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-[2000px] border border-[#FEEAAE] bg-[#FFF5D7]"
          style={{
            width: "max(2000px, 139vw)",
            height: "max(1440px, 100vw)",
            bottom: "clamp(-1250px, -111vw, -800px)",
          }}
        />
      </div>

      <div className="min-h-screen pb-25">
        <div className="mx-auto grid max-w-300 grid-cols-1 items-start gap-10 px-6 py-8 lg:grid-cols-2">
          <LeaderboardSection />
          <ResultsSection />
        </div>
      </div>

      <FlashcardResultBottomBar />
    </>
  );
}
