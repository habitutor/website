import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StreakCelebration } from "@/components/streak/streak-celebration";
import { takeBrainGymStreak } from "./-components/brain-gym-streak";
import { STYLES } from "./-components/flashcard-result-animations";
import { FlashcardResultBottomBar } from "./-components/flashcard-result-bottom-bar";
import { LeaderboardSection } from "./-components/flashcard-result-leaderboard";
import { ResultsSection } from "./-components/flashcard-result-answers";

export const Route = createFileRoute("/_authenticated/dashboard/flashcard/result")({
  component: RouteComponent,
});

function RouteComponent() {
  const [streakChange, setStreakChange] = useState<{ from: number; to: number } | null>(null);
  const [showStreak, setShowStreak] = useState(false);

  useEffect(() => {
    const change = takeBrainGymStreak();
    if (change) setStreakChange(change);
    // Hanya di mode dev: buka halaman hasil dengan ?preview-streak untuk melihat popup streak Brain Gym.
    else if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("preview-streak")) {
      setStreakChange({ from: 2, to: 3 });
    }
  }, []);

  // Popup streak menunggu animasi skor dan podium selesai dulu.
  useEffect(() => {
    if (!streakChange) return;
    const timer = setTimeout(() => setShowStreak(true), 2200);
    return () => clearTimeout(timer);
  }, [streakChange]);

  return (
    <>
      <style>{STYLES}</style>

      {/* Background circle */}
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-[2000px] border border-sr-sun-200 bg-sr-cream"
          style={{
            width: "max(2000px, 139vw)",
            height: "max(1440px, 100vw)",
            bottom: "clamp(-1250px, -111vw, -800px)",
          }}
        />
      </div>

      <div className="min-h-screen pb-25">
        <div className="mx-auto grid max-w-300 grid-cols-1 items-start gap-4 px-3 py-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:py-8">
          <LeaderboardSection />
          <ResultsSection />
        </div>
      </div>

      <FlashcardResultBottomBar />

      <StreakCelebration
        variant="braingym"
        open={showStreak}
        from={streakChange?.from ?? 0}
        to={streakChange?.to ?? 0}
        onClose={() => setShowStreak(false)}
      />
    </>
  );
}
