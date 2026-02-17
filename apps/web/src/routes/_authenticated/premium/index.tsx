import { PREMIUM_DEADLINE } from "@habitutor/api/lib/constants";
import { InfinityIcon, SparkleIcon, SpinnerIcon, StarIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-components";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMidtransScript } from "@/lib/midtrans";
import { createMeta } from "@/lib/seo-utils";
import { orpc } from "@/utils/orpc";
import { PremiumHeader } from "./-components/premium-header";

export const Route = createFileRoute("/_authenticated/premium/")({
	head: () => ({
		meta: createMeta({
			title: "Premium",
			description: "Upgrade ke premium untuk akses penuh ke semua fitur dan materi Habitutor.",
			noIndex: true,
		}),
	}),
	component: RouteComponent,
});

const features = [
	{
		icon: <InfinityIcon size={24} />,
		title: "Akses Tanpa Batas",
		description: "Buka semua materi latihan tanpa batasan apapun",
	},
	{
		icon: <SparkleIcon size={24} />,
		title: "Tips & Trik Eksklusif",
		description: "Dapatkan strategi rahasia yang tidak tersedia di paket gratis",
	},
	{
		icon: <StarIcon size={24} />,
		title: "Komunitas Premium",
		description: "Bergabung dengan grup diskusi eksklusif untuk pengguna premium",
	},
];

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const transactionMutation = useMutation(orpc.transaction.subscribe.mutationOptions());
	const queryClient = useQueryClient();
	const [token, setToken] = useState<string | undefined>();

	useMidtransScript();

	useEffect(() => {
		if (token) {
			window.snap.pay(token, {
				onSuccess: () => {
					toast.success("Pembayaran berhasil! Selamat menjadi premium!");
					queryClient.removeQueries();
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
	}, [token, queryClient.removeQueries]);

	const isPremium = session?.user.isPremium;
	const isPastDueDate = Date.now() > PREMIUM_DEADLINE.getTime();

	const buttonText = isPremium ? (
		"Kamu sudah Premium!"
	) : transactionMutation.isPending ? (
		<>
			<SpinnerIcon className="animate-spin" />
			Memproses...
		</>
	) : isPastDueDate ? (
		"Promo Berakhir"
	) : (
		"Premium Sekarang!"
	);

	return (
		<MotionStagger className="space-y-8">
			<MotionStaggerItem>
				<PremiumHeader />
			</MotionStaggerItem>

			<MotionStaggerItem>
				<div className="grid gap-8 lg:grid-cols-3">
					<div className="lg:col-span-1">
						<Card className="relative overflow-hidden border-2 border-primary-100 bg-white p-6 shadow-lg">
							<div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary-100 opacity-50 blur-2xl" />

							<h2 className="relative z-10 font-semibold text-lg text-neutral-1000">Paket Premium</h2>
							<div className="relative z-10 mt-4 flex flex-col items-baseline">
								<span className="font-bold text-3xl text-primary-500">Rp249.000</span>
								<span className="ml-1 text-neutral-500 text-sm">s.d. UTBK</span>
							</div>
							<p className="relative z-10 mt-2 text-neutral-600 text-sm">
								Akses penuh ke semua materi dan fitur eksklusif Habitutor.
							</p>
							<Button
								size="lg"
								className="mt-6 w-full hover:cursor-pointer"
								disabled={isPremium || transactionMutation.isPending || isPastDueDate}
								onClick={async () => {
									if (isPremium) return;
									transactionMutation
										.mutateAsync({
											name: "premium",
										})
										.then((data) => {
											setToken(data.token);
										})
										.catch((err) => {
											toast.error(err);
										});
								}}
							>
								{buttonText}
							</Button>
						</Card>
					</div>

					<div className="space-y-6 lg:col-span-2">
						<div>
							<h2 className="mb-4 font-bold text-neutral-1000 text-xl">Fitur Unggulan</h2>
							<div className="grid gap-4">
								{features.map((feature) => (
									<Card key={feature.title} className="border-neutral-200 p-4">
										<div className="flex items-start gap-4">
											<div className="shrink-0 rounded-full bg-primary-100 p-2 text-primary-500">{feature.icon}</div>
											<div>
												<h3 className="font-semibold text-neutral-1000">{feature.title}</h3>
												<p className="mt-1 text-neutral-600 text-sm">{feature.description}</p>
											</div>
										</div>
									</Card>
								))}
							</div>
						</div>
					</div>
				</div>
			</MotionStaggerItem>
		</MotionStagger>
	);
}
