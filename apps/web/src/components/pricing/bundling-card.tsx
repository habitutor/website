import { ArrowRightIcon, CheckIcon, MedalIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BundlingFeature {
	label: string;
	status: string;
	value?: string;
}

interface PremiumPlanData {
	label: string;
	original_price: string;
	price_now: string;
	suffix?: string;
	percentage: string;
	promo_end: string;
	features: BundlingFeature[];
	cta: { label: string; url: string };
}

interface BasicPlanData {
	label: string;
	price_monthly?: string;
	price_full: string;
	suffix?: string;
	features: BundlingFeature[];
	cta: { label: string; url: string };
}

interface BundlingCardColors {
	bg?: string;
	border?: string;
	text?: string;
	price?: string;
	promo?: string;
	header?: string;
	circle?: string;
	button?: string;
	checkBadge?: string;
	limitedBadge?: string;
	medalBadge?: string;
	divider?: string;
}

type BundlingCardProps =
	| { data: PremiumPlanData; variant: "premium"; span?: boolean; colors?: BundlingCardColors }
	| { data: BasicPlanData; variant: "basic"; span?: boolean; colors?: BundlingCardColors };

export function BundlingCard({ data, variant, span, colors }: BundlingCardProps) {
	const isPremium = variant === "premium";

	if (isPremium) {
		// Default colors for premium
		const defaultPremiumColors = {
			bg: "bg-primary-300",
			text: "text-white",
			price: "text-white",
			promo: "",
			header: "bg-primary-500 border-neutral-1000",
			circle: "bg-primary-400 border-primary-500",
			button: "bg-primary-500 hover:bg-primary-600 text-white",
			checkBadge: "bg-secondary-200",
			medalBadge: "bg-secondary-700",
			divider: "border-white",
		};

		const premiumColors = { ...defaultPremiumColors, ...colors };

		return (
			<motion.div
				className={cn(
					"relative flex h-131.25 w-full max-w-110 shrink-0 flex-col overflow-hidden rounded-2xl shadow-lg md:max-w-70",
					premiumColors.bg,
					premiumColors.text,
				)}
			>
				<div className={cn("absolute -right-12 -bottom-20 z-1 size-45 rounded-full border-2", premiumColors.circle)} />
				<div
					className={cn(
						"absolute bottom-13 left-1/2 z-1 size-9 -translate-x-1/2 rounded-full border-2",
						premiumColors.circle,
					)}
				/>
				<div
					className={cn(
						"relative z-10 flex items-center justify-between rounded-t-2xl border-2 px-6 py-4 text-neutral-100",
						premiumColors.header,
					)}
				>
					<h3 className="font-bold text-base">{data.label}</h3>
					{span && (
						<span className="rounded-xl bg-red-100 px-2 py-0.5 font-medium text-[10px] text-black uppercase">
							Terlengkap!
						</span>
					)}
				</div>
				<div className={cn("relative z-10 border-2 border-b-0 px-6 py-4", premiumColors.border)}>
					<div className={cn("relative inline-block font-bold text-base", premiumColors.text)}>
						{data.original_price}
						<span className="pointer-events-none absolute top-1/2 left-0 h-0.5 w-full -origin-center -rotate-6 bg-red-400" />
					</div>
					<div className="flex items-baseline gap-1">
						<p className={cn("font-black text-3xl", premiumColors.price)}>{data.price_now}</p>
						<span className="whitespace-nowrap text-[10px]">sampai SNBT</span>
					</div>
					<p className={cn("text-[12px]")}>
						promo <span className={cn("font-bold", premiumColors.promo)}>hemat {data.percentage}</span> sampai{" "}
						{data.promo_end}
					</p>
					<hr className={cn("mt-4", premiumColors.divider)} />
				</div>
				<div className={cn("relative z-10 flex-1 border-x-2 px-6 pb-4", premiumColors.border)}>
					<ul className="mt-4 space-y-2">
						{data.features.map((feature) => (
							<li key={feature.label} className="flex items-center gap-2 text-xs">
								<FeatureIcon status={feature.status} premium colors={premiumColors} />
								<span>{feature.label}</span>
							</li>
						))}
					</ul>
				</div>
				<div className={cn("relative z-10 border-2 border-t-0 p-6", premiumColors.border)}>
					<Link
						to={data.cta.url as string}
						className={cn(buttonVariants({ size: "sm" }), "w-full border", premiumColors.button)}
					>
						{data.cta.label} <ArrowRightIcon size={16} weight="bold" />
					</Link>
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div className="relative flex h-131.25 w-full max-w-110 shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm md:max-w-70">
			<div className={cn("absolute -right-12 -bottom-20 z-1 size-45 rounded-full border-2", colors?.circle)} />
			<div
				className={cn("absolute bottom-13 left-1/2 z-0 size-9 -translate-x-1/2 rounded-full border-2", colors?.circle)}
			/>
			<div className={cn("relative z-10 rounded-t-2xl border-2 px-6 py-4", colors?.header)}>
				<h3 className="font-bold text-base text-neutral-1000">{data.label}</h3>
			</div>
			<div className="relative z-10 border-2 border-neutral-200 border-b-0 px-6 py-4">
				{data.price_monthly && (
					<div className="flex items-baseline gap-1">
						<p className="font-bold text-[16px]">{data.price_monthly}</p>
						<span className="font-regular text-[12px]">/ bulan</span>
					</div>
				)}
				<div className="flex items-baseline gap-1">
					<p className="font-bold text-2xl text-[#3650A2]">{data.price_full}</p>
					<span className="text-[12px]">sampai SNBT</span>
				</div>
				<hr className="mt-4 border-slate-100" />
			</div>
			<div className="relative z-10 flex-1 border-neutral-200 border-x-2 px-6 pb-4">
				<ul className="mt-2 space-y-2">
					{data.features.map((feature) => (
						<li key={feature.label} className="flex items-center gap-2 text-xs">
							<FeatureIcon status={feature.status} />
							<span className={cn(feature.status === "excluded" && "text-neutral-1000")}>{feature.label}</span>
						</li>
					))}
				</ul>
			</div>
			<div className="relative z-10 rounded-b-2xl border-2 border-neutral-200 border-t-0 p-6">
				<Link
					to={data.cta.url as string}
					className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full hover:bg-neutral-200")}
				>
					{data.cta.label} <ArrowRightIcon size={16} weight="bold" />
				</Link>
			</div>
		</motion.div>
	);
}

function FeatureIcon({ status, premium, colors }: { status: string; premium?: boolean; colors?: BundlingCardColors }) {
	const base = "flex size-4 items-center justify-center rounded-full p-0.5 text-white";
	if (status === "included")
		return (
			<div
				className={cn(
					base,
					premium && colors?.checkBadge ? colors.checkBadge : premium ? "bg-[#1A2855]" : "bg-primary-300",
				)}
			>
				<CheckIcon weight="bold" />
			</div>
		);
	if (status === "limited")
		return (
			<div className={cn(base, premium && colors?.medalBadge ? colors.medalBadge : "bg-secondary-700")}>
				<MedalIcon />
			</div>
		);
	return (
		<div className={cn(base, premium ? "bg-[#FF4D4D]" : "bg-neutral-500")}>
			<XIcon weight="bold" />
		</div>
	);
}
