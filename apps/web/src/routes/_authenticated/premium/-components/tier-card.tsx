import { PREMIUM_DEADLINE } from "@habitutor/api/lib/constants";
import { CheckIcon, SpinnerIcon, StarIcon } from "@phosphor-icons/react";
import type { UseMutateFunction } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMidtransScript } from "@/lib/midtrans";
import { cn } from "@/lib/utils";

interface TierCardProps {
	variant: "free" | "premium";
	isPremium: boolean;
	isPending?: boolean;
	mutate?: UseMutateFunction<{ token: string; redirectUrl: string }, Error, { name: "basic" | "premium" }>;
}

const freeFeatures = ["1 subtest pertama gratis", "Brain Gym harian", "Progress tracking dasar"];

const premiumFeatures = [
	"Akses tanpa batas ke semua materi",
	"Tips & trik eksklusif",
	"Grup diskusi premium (Discord & WhatsApp)",
	"Latihan soal tak terbatas",
	"Brain Gym tak terbatas",
];

export function TierCard({ variant, isPremium, isPending, mutate }: TierCardProps) {
	const isFree = variant === "free";
	const isCurrentFree = !isPremium && isFree;
	const isCurrentPremium = isPremium && !isFree;
	const isPastDueDate = Date.now() > PREMIUM_DEADLINE.getTime();
	const [token, setToken] = useState<string | undefined>();

	useMidtransScript();

	useEffect(() => {
		if (token && window.snap) {
			window.snap.pay(token, {
				onSuccess: () => {
					toast.success("Pembayaran berhasil! Selamat menjadi premium!");
					window.location.reload();
				},
				onPending: () => {
					toast.info("Menunggu pembayaran...");
				},
				onError: () => {
					toast.error("Pembayaran gagal. Silakan coba lagi.");
				},
				onClose: () => {
					toast.warning("Pembayaran dibatalkan.");
				},
			});
		}
	}, [token]);

	const cardBase = cn(
		"relative flex w-full flex-col rounded-[10px] p-6 shadow-sm transition-all",
		isFree
			? "border border-neutral-200 bg-white"
			: "border-2 border-primary-300 bg-gradient-to-b from-primary-50 to-white",
	);

	return (
		<div className={cardBase}>
			{!isFree && (
				<div className="absolute -top-3 left-1/2 -translate-x-1/2">
					<span className="flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 font-medium text-white text-xs">
						<StarIcon size={12} weight="fill" />
						Paling Populer
					</span>
				</div>
			)}

			<div className="mt-2">
				<h3 className="font-semibold text-lg text-neutral-1000">{isFree ? "Gratis" : "Premium"}</h3>
				<div className="mt-2 flex items-baseline gap-1">
					<span className={cn("font-bold text-3xl", isFree ? "text-neutral-700" : "text-primary-500")}>
						{isFree ? "Rp0" : "Rp249.000"}
					</span>
					<span className="text-neutral-500 text-sm">{isFree ? "selamanya" : "s.d. UTBK"}</span>
				</div>
				<p className="mt-2 text-neutral-600 text-sm">
					{isFree ? "Coba fitur dasar Habitutor" : "Akses penuh ke semua materi dan fitur eksklusif"}
				</p>
			</div>

			<ul className="mt-6 flex-1 space-y-3">
				{(isFree ? freeFeatures : premiumFeatures).map((feature) => (
					<li key={feature} className="flex items-start gap-2">
						<CheckIcon size={20} className="shrink-0 text-primary-500" weight="bold" />
						<span className="text-neutral-700 text-sm">{feature}</span>
					</li>
				))}
			</ul>

			<div className="mt-6">
				<TierButton
					variant={variant}
					isPremium={isPremium}
					isCurrentFree={isCurrentFree}
					isCurrentPremium={isCurrentPremium}
					isPending={isPending}
					isPastDueDate={isPastDueDate}
					mutate={mutate}
					onTokenReceived={setToken}
				/>
			</div>
		</div>
	);
}

function TierButton({
	variant,
	isPremium,
	isCurrentFree,
	isCurrentPremium,
	isPending,
	isPastDueDate,
	mutate,
	onTokenReceived,
}: {
	variant: "free" | "premium";
	isPremium: boolean;
	isCurrentFree: boolean;
	isCurrentPremium: boolean;
	isPending?: boolean;
	isPastDueDate: boolean;
	mutate?: UseMutateFunction<{ token: string; redirectUrl: string }, Error, { name: "basic" | "premium" }>;
	onTokenReceived: (token: string) => void;
}) {
	if (variant === "free") {
		return (
			<button
				type="button"
				disabled
				className={cn(
					"w-full rounded-lg px-4 py-3 font-medium text-sm transition-colors",
					isCurrentFree
						? "border border-neutral-300 bg-neutral-100 text-neutral-500"
						: "border border-neutral-200 bg-white text-neutral-400",
				)}
			>
				{isCurrentFree ? "Paket Saat Ini" : "Tidak Tersedia"}
			</button>
		);
	}

	const isDisabled = isPremium || isPending || isPastDueDate;

	return (
		<button
			type="button"
			disabled={isDisabled}
			onClick={() => {
				if (isPremium || !mutate) return;
				mutate(
					{ name: "premium" },
					{
						onSuccess: (data) => {
							onTokenReceived(data.token);
						},
						onError: (err) => {
							toast.error(err.message);
						},
					},
				);
			}}
			className={cn(
				"flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-sm transition-colors",
				isCurrentPremium
					? "bg-primary-100 text-primary-600"
					: "bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50",
			)}
		>
			{isPending && <SpinnerIcon className="animate-spin" size={16} />}
			{isCurrentPremium
				? "Kamu sudah Premium!"
				: isPending
					? "Memproses..."
					: isPastDueDate
						? "Promo Berakhir"
						: "Premium Sekarang!"}
		</button>
	);
}
