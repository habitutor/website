import { createFileRoute } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import Header from "@/components/navigation/header";
import { createMeta } from "@/lib/seo-utils";
import { Benefits } from "./-components/benefits";
import { CallToAction } from "./-components/call-to-action";
import { FAQ } from "./-components/faq";
import { Hero } from "./-components/hero";
import { Pricing } from "./-components/pricing";
import { StudySchedule } from "./-components/study-schedule";

export const Route = createFileRoute("/home-premium/")({
  head: () => ({
    meta: createMeta({
      title: "Paket Premium SNBT & TKA 2027",
      description:
        "Pilih paket Premium Habitutor: playlist video, bank soal, try out, 150+ sesi live, dan komunitas yang jagain lo tetep konsisten.",
    }),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="overflow-x-clip">
        <Header />
        <Hero />
        <section className="space-y-14 bg-linear-to-b from-sr-blue-50 via-tertiary-100 to-sr-blue-50 pt-16 pb-12 md:space-y-16 md:pt-20 md:pb-14">
          <Benefits />
          <Pricing />
        </section>
        <StudySchedule />
        <FAQ className="py-10 md:py-12" />
        <CallToAction />
      </main>
    </MotionConfig>
  );
}
