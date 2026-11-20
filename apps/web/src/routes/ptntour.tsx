import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { CampusSkyline } from "@/components/layout/campus-skyline";
import { HeaderDashboard } from "@/components/navigation/header-dashboard";
import Header from "@/components/navigation/header";
import { Container } from "@/components/ui/container";
import { $getSession } from "@/lib/get-user";
import { createMeta } from "@/lib/seo-utils";

// Layout publik: event bisa dilihat tanpa login (link dari poster/IG), tetapi mendaftar tetap wajib login.
export const Route = createFileRoute("/ptntour")({
  head: () => ({
    meta: createMeta({
      title: "PTN Tour",
      description: "Event gratis Habitutor: Masterclass, PTN Tour, dan sesi intensif persiapan SNBT.",
    }),
  }),
  beforeLoad: async ({ context, preload }) => {
    if (preload) return { session: null };
    const { session } = await $getSession(context.queryClient);
    return { session: session ?? null };
  },
  component: PtnTourLayout,
});

function PtnTourLayout() {
  const { session } = Route.useRouteContext();

  return (
    <MotionConfig reducedMotion="user">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-sr-blue-50" />
      {session ? <HeaderDashboard session={session} /> : <Header />}
      <div className="relative z-10 min-h-dvh">
        <Container className="flex flex-col gap-6 pt-24 pb-24 sm:pt-28 sm:pb-16">
          <Outlet />
        </Container>
      </div>
      <CampusSkyline />
    </MotionConfig>
  );
}
