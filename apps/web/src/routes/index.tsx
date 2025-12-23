import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/header";
import { CallToAction } from "./-home/call-to-action";
import { Hero } from "./-home/hero";
import { Pricing } from "./-home/pricing";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<>
			<Header />
			<Hero />
			<Pricing />
			<CallToAction />
		</>
	);
}
