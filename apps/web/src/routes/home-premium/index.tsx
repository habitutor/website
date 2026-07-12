import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/navigation/header";
import { createMeta } from "@/lib/seo-utils";
import { Benefits } from "./-components/benefits";
import { CallToAction } from "./-components/call-to-action";
import { FAQ } from "./-components/faq";
import { Hero } from "./-components/hero";
import { Pricing } from "./-components/pricing";

export const Route = createFileRoute("/home-premium/")({
  head: () => ({
    meta: createMeta({
      title: "Perintis SNBT & TKA 2027",
      description:
        "Belajar bareng sampai hari-H SNBT 2027: playlist video, bank soal, try out, 100+ sesi live, dan komunitas yang jagain lo tetep konsisten.",
    }),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      <Header />
      <Hero />
      <section className="space-y-20 border-b-2 border-tertiary-200 bg-tertiary-100 py-20 md:space-y-24 md:py-24">
        <Benefits />
        <Pricing />
      </section>
      <FAQ />
      <CallToAction />
    </main>
  );
}
