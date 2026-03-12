import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/header";
import { Bundling } from "./-components/bundling";
import { CallToAction } from "./-components/call-to-action.tsx";
import { Hero } from "./-components/hero";
import { Perintis } from "./-components/perintis";
import { Tryout } from "./-components/tryout";

export const Route = createFileRoute("/home-premium/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="">
      <Header />
      <Hero />
      <section className="space-y-30 border-b-2 border-tertiary-200 bg-tertiary-100 pb-30">
        <Bundling />
        <Perintis />
        <Tryout />
      </section>
      <CallToAction />
    </main>
  );
}
