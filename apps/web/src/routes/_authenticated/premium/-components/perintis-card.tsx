import { ArrowRightIcon, CheckIcon, MedalIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DATA } from "@/routes/home-premium/-components/data";

interface PerintisClassroomCardProps {
	variant: "perintis1" | "perintis2" | "classroom";
}

interface PlanFeature {
	label: string;
	status: string;
	value?: string;
}

interface PlanData {
	label: string;
	price_full: string;
	suffix: string;
	features: PlanFeature[];
	cta: {
		label: string;
		url: string;
	};
	price_monthly?: string;
}

const plans: Record<"perintis1" | "perintis2" | "classroom", PlanData> = {
	perintis1: DATA.perintis.perintis1,
	perintis2: DATA.perintis.perintis2,
	classroom: DATA.classroom,
};

const planColors = {
	perintis1: {
		bg: "bg-tertiary-100",
		border: "border-tertiary-200",
	},
	perintis2: {
		bg: "bg-secondary-100 border-secondary-200",
		border: "border-secondary-600",
	},
	classroom: {
		bg: "bg-[#C5F5DC]",
		border: "border-fourtiary-100",
	},
} as const;

export function PerintisClassroomCard({ variant }: PerintisClassroomCardProps) {
	const data = plans[variant];
	const colors = planColors[variant];

	return (
		<div className="relative flex h-full min-h-110 w-full max-w-110 flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm">
			<div
				className={cn("absolute -right-12 -bottom-20 z-1 size-45 rounded-full border-2", colors.bg, colors.border)}
			/>
			<div
				className={cn(
					"absolute bottom-13 left-1/2 z-0 size-9 -translate-x-1/2 rounded-full border-2",
					colors.bg,
					colors.border,
				)}
			/>

			<div className={cn("relative z-10 rounded-t-2xl border-2 px-6 py-4 text-neutral-1000", colors.bg, colors.border)}>
				<h3 className="font-bold text-base text-neutral-1000">{data.label}</h3>
			</div>

			<div className="relative z-10 border-2 border-b-0 px-6 py-4">
				{data.price_monthly && (
					<div className="mb-1 flex items-baseline gap-1">
						<p className="font-bold text-[16px] text-neutral-1000">{data.price_monthly}</p>
						<span className="text-[12px]">/ bulan</span>
					</div>
				)}
				<div className="flex items-baseline gap-1">
					<p className="font-black text-3xl text-primary-300">{data.price_full}</p>
					<span className="whitespace-nowrap text-[12px] text-neutral-1000">{data.suffix}</span>
				</div>
				<hr className="mt-4 border-neutral-200" />
			</div>

			<div className="relative z-10 flex-1 border-x-2 px-6 py-4">
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
					to={data.cta.url}
					className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full hover:bg-neutral-200")}
				>
					{data.cta.label} <ArrowRightIcon size={16} weight="bold" />
				</Link>
			</div>
		</div>
	);
}

function FeatureIcon({ status }: { status: string }) {
	const base = "flex size-4 items-center justify-center rounded-full p-0.5 text-white flex-shrink-0";

	if (status === "included") {
		return (
			<div className={cn(base, "bg-primary-300")}>
				<CheckIcon weight="bold" size={12} />
			</div>
		);
	}

	if (status === "limited") {
		return (
			<div className={cn(base, "bg-secondary-700")}>
				<MedalIcon size={12} />
			</div>
		);
	}

	return (
		<div className={cn(base, "bg-neutral-400")}>
			<XIcon weight="bold" size={12} />
		</div>
	);
}
