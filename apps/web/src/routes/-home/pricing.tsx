import { ArrowRightIcon, MedalIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { DATA } from "./data";

export function Pricing() {
	const { title, subtitle, starter, premium } = DATA.pricing;

	return (
		<Container>
			<div className="mb-4 text-center">
				<h1 className="font-bold text-2xl">{title}</h1>
				<p className="font-medium text-sm">{subtitle}</p>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6">
				<StarterCard data={starter} />
				<PremiumCard data={premium} />
			</div>
		</Container>
	);
}

function StarterCard({ data }: { data: typeof DATA.pricing.starter }) {
	return (
		<div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
			{/* Top */}
			<div className="relative z-1">
				<h3 className="font-medium text-base">{data.label}</h3>
				<p className="font-bold text-4xl text-primary-300">{data.price}</p>
			</div>

			{/* Bottom */}
			<div className="relative z-1">
				<ul className="mt-4 space-y-2">
					{data.features.map((feature) => (
						<li key={feature} className="flex items-center gap-2">
							<MedalIcon size={16} />
							<span className="whitespace-pre-wrap text-sm">{feature}</span>
						</li>
					))}
				</ul>

				<div className="-mt-8 flex justify-end">
					<Link to="/dashboard" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "")}>
						{data.cta}
						<ArrowRightIcon size={16} />
					</Link>
				</div>
			</div>

			<div className="absolute top-0 right-0 z-0 aspect-square h-[140%] translate-x-1/2 -translate-y-1/2 rounded-full bg-tertiary-100" />
		</div>
	);
}

function PremiumCard({ data }: { data: typeof DATA.pricing.premium }) {
	return (
		<div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-primary-300 p-6 shadow-sm">
			{/* Top */}
			<div className="relative z-2">
				<h3 className="font-medium text-base text-white">{data.label}</h3>
				<p className="font-bold text-4xl text-secondary-200">
					{data.price}
					<span className="ml-1 font-normal text-sm text-white">{data.suffix}</span>
				</p>
			</div>

			{/* Bottom */}
			<div className="relative z-1">
				<ul className="mt-4 space-y-2 *:text-white">
					{data.features.map((feature) => (
						<li key={feature} className="flex items-center gap-2">
							<MedalIcon size={16} />
							<span className="whitespace-pre-wrap text-sm">{feature}</span>
						</li>
					))}
				</ul>

				<div className="-mt-8 flex justify-end">
					<Link to="/premium" className={cn(buttonVariants({ size: "sm", variant: "default" }), "")}>
						{data.cta}
						<ArrowRightIcon size={16} />
					</Link>
				</div>
			</div>

			{/* Avatar */}
			<Image
				src="/avatar/premium-pricing-card-avatar.webp"
				alt="Subtest Header Avatar"
				width={530}
				height={530}
				className="absolute right-5 bottom-12 z-1 h-[50%] w-auto sm:bottom-10 sm:h-[80%] lg:bottom-11 lg:h-[60%]"
			/>

			<div className="absolute right-0 bottom-0 z-0 aspect-square h-[140%] translate-x-1/2 translate-y-1/2 rounded-full bg-primary-200" />
		</div>
	);
}
