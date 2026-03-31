import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingFeature {
	label: string;
	status: "included" | "excluded" | "limited";
}

interface PricingData {
	label: string;
	original_price?: string;
	price_now?: string;
	price_monthly?: string;
	price_full: string;
	features: PricingFeature[];
	cta: {
		label: string;
		url: string;
	};
}

export function TryOutCard({ data }: { data: PricingData }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="relative flex h-100 w-full flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-sm 2xl:min-w-80"
		>
			<div className="space-y-2 border-b bg-background p-6">
				<h3 className="font-medium text-neutral-1000 text-sm">{data.label}</h3>
				{data.price_full && <p className="font-bold text-3xl text-primary-300">{data.price_full}</p>}
			</div>
			<ul className="mt-4 flex-1 space-y-2 px-6">
				{data.features.map((feature: PricingFeature) => (
					<li key={feature.label} className="flex items-center gap-2 text-sm">
						<div className="flex size-4 items-center justify-center rounded-full bg-primary-300 p-0.5 text-white">
							<CheckIcon weight="bold" />
						</div>
						<span>{feature.label}</span>
					</li>
				))}
			</ul>
			<div className="p-6">
				<Link to={data.cta.url as string} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}>
					{data.cta.label}
					<ArrowRightIcon size={16} weight="bold" />
				</Link>
			</div>
		</motion.div>
	);
}
