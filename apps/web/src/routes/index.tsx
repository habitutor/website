import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/navigation/header";
import { createMeta } from "@/lib/seo-utils";
import { CallToAction } from "./-home/call-to-action";
import { FAQ } from "./-home/faq";
import { Features } from "./-home/features";
import { Hero } from "./-home/hero";
import { Pricing } from "./-home/pricing";
import { Statistics } from "./-home/statistics";
import Testimonial from "./-home/testimonial";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: createMeta({
      description:
        "Ubah persiapan ujian SNBT/UTBK menjadi lebih mudah dan terstruktur dengan Habitutor. Materi lengkap, latihan soal interaktif, dan analisis progres belajar.",
      image: "/og-image.png",
    }),
  }),
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <>
      <Header />
      <Hero />
      <Testimonial />
      <Statistics />
      <Features />
      <Pricing />
      <FAQ />
      <CallToAction />
      {/* <Footer /> */}
    </>
  );
}
