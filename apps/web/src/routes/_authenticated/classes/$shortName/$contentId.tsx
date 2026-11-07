import { ExamIcon, NoteIcon, PlayCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/navigation/back-button";
import { NextButton } from "@/components/navigation/next-button";
import { PremiumGateModal } from "@/components/premium/premium-gate-modal";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/classes/$shortName/$contentId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { shortName, contentId } = Route.useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const content = useQuery({
    ...orpc.subtest.content.find.queryOptions({
      input: { contentId: Number(contentId) },
    }),
    // Don't retry on 403 FORBIDDEN - user doesn't have access
    retry: (failureCount, error) => {
      // Don't retry if it's a forbidden/premium error
      if (error?.message?.includes("premium") || error?.message?.includes("FORBIDDEN")) {
        return false;
      }
      // Default retry behavior for other errors (max 3 retries)
      return failureCount < 3;
    },
  });

  const trackViewMutation = useMutation(orpc.subtest.content.trackView.mutationOptions());

  // Check if error is FORBIDDEN (premium content)
  const isForbiddenError = content.isError && content.error?.message?.includes("premium");

  // Show premium modal when accessing premium content
  useEffect(() => {
    if (isForbiddenError) {
      setShowPremiumModal(true);
    }
  }, [isForbiddenError]);

  // Track view when content is viewed
  // Always track to update viewedAt timestamp, even if already tracked in this session
  useEffect(() => {
    if (!content.data) return;

    // Use a debounce mechanism to avoid multiple rapid calls
    const storageKey = `tracking_content_${contentId}`;
    const lastTracked = sessionStorage.getItem(storageKey);
    const now = Date.now();
    const DEBOUNCE_MS = 2000; // Track at most once per 2 seconds per content

    if (!lastTracked || now - Number(lastTracked) > DEBOUNCE_MS) {
      trackViewMutation.mutate(
        { id: Number(contentId) },
        {
          onSuccess: () => {
            // Update last tracked timestamp
            sessionStorage.setItem(storageKey, now.toString());
            queryClient.invalidateQueries({
              queryKey: orpc.subtest.content.recent.key(),
            });
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.data, contentId, queryClient.invalidateQueries, trackViewMutation.mutate]);

  // Handle premium modal close - redirect back to class list
  const handlePremiumModalClose = () => {
    setShowPremiumModal(false);
    navigate({ to: `/classes/${shortName}` });
  };

  // Show premium modal for forbidden content
  if (isForbiddenError) {
    return (
      <Container className="min-h-screen pt-24 sm:pt-26">
        <PremiumGateModal isOpen={showPremiumModal} onClose={handlePremiumModalClose} contentType="content" />
      </Container>
    );
  }

  const currentPath = location.pathname;
  const currentTab: "video" | "notes" | "latihan-soal" = currentPath.endsWith("/notes")
    ? "notes"
    : currentPath.endsWith("/latihan-soal")
      ? "latihan-soal"
      : "video";

  const handleTabChange = (value: string) => {
    navigate({
      to:
        value === "video"
          ? `/classes/${shortName}/${contentId}/video`
          : value === "notes"
            ? `/classes/${shortName}/${contentId}/notes`
            : `/classes/${shortName}/${contentId}/latihan-soal`,
      params: { shortName, contentId },
    });
  };

  return (
    <Container className="flex min-h-screen flex-col gap-6 pt-24 pb-14 sm:pt-26">
      <div className="flex items-center justify-between gap-3">
        {currentTab === "video" ? (
          <BackButton to="/classes/$shortName" params={{ shortName }} />
        ) : currentTab === "notes" ? (
          <BackButton to="/classes/$shortName/$contentId/video" params={{ shortName, contentId }} />
        ) : (
          <BackButton to="/classes/$shortName/$contentId/notes" params={{ shortName, contentId }} />
        )}
        {currentTab === "video" && (
          <NextButton
            to={`/classes/${shortName}/${contentId}/notes`}
            className={!location.pathname.includes("/video") ? "hidden" : ""}
          />
        )}
        {currentTab === "notes" && (
          <NextButton
            to={`/classes/${shortName}/${contentId}/latihan-soal`}
            className={!location.pathname.includes("/notes") ? "hidden" : ""}
          />
        )}
      </div>

      {/* Langkah belajar: siswa selalu tahu sedang di tahap mana dan bisa pindah tahap. */}
      <nav aria-label="Tahap belajar" className="rounded-sr-xl border border-sr-line bg-white p-1.5 shadow-sr-1">
        <ol className="grid grid-cols-3 gap-1">
          {CONTENT_STEPS.map((step, index) => {
            const active = step.value === currentTab;
            const Icon = step.icon;
            return (
              <li key={step.value}>
                <button
                  type="button"
                  onClick={() => handleTabChange(step.value)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex w-full flex-col items-center justify-center gap-1 rounded-sr-lg px-1 py-2 text-xs font-bold whitespace-nowrap transition-colors sm:flex-row sm:gap-2 sm:px-2 sm:py-2.5 sm:text-sm",
                    active
                      ? "bg-sr-blue-500 text-white shadow-sr-2"
                      : "text-sr-ink-2 hover:bg-sr-blue-50 hover:text-sr-blue-600",
                  )}
                >
                  <span
                    className={cn(
                      "hidden size-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold sm:flex",
                      active ? "bg-white/20" : "bg-sr-blue-50 text-sr-blue-600",
                    )}
                  >
                    {index + 1}
                  </span>
                  <Icon weight={active ? "fill" : "bold"} className="size-5 shrink-0 sm:hidden" />
                  <span className="leading-none sm:leading-normal">
                    <span className="sm:hidden">{step.short}</span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsContent value={currentTab}>
          <div className="rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 sm:p-7 lg:p-9">
            <Outlet />
          </div>
        </TabsContent>
      </Tabs>
    </Container>
  );
}

const CONTENT_STEPS = [
  { value: "video", label: "Video Materi", short: "Video", icon: PlayCircleIcon },
  { value: "notes", label: "Catatan Materi", short: "Catatan", icon: NoteIcon },
  { value: "latihan-soal", label: "Latihan Soal", short: "Latihan", icon: ExamIcon },
] as const;
