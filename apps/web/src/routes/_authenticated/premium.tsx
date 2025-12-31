import { ArrowRightIcon, CrownIcon, InfinityIcon, SparkleIcon, StarIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/premium")({
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
		icon: <CrownIcon size={24} />,
		title: "Badge Premium",
		description: "Tampilkan status premium kamu di profil dan komunitas",
	},
	{
		icon: <StarIcon size={24} />,
		title: "Update Prioritas",
		description: "Dapatkan akses ke fitur baru sebelum pengguna lainnya",
	},
];

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const transactionMutation = useMutation(orpc.transaction.premium.mutationOptions());
	const [token, setToken] = useState<string | undefined>();

	useEffect(() => {
		const midtransScriptUrl =
			(process.env.MIDTRANS_SCRIPT_URL ?? import.meta.env.MIDTRANS_SCRIPT_URL) ||
			"https://app.sandbox.midtrans.com/snap/snap.js";
		const scriptTag = document.createElement("script");
		scriptTag.src = midtransScriptUrl;
		const myMidtransClientKey = (process.env.MIDTRANS_CLIENT_KEY ?? import.meta.env.MIDTRANS_CLIENT_KEY) || "";
		scriptTag.setAttribute("data-client-key", myMidtransClientKey);
		document.body.appendChild(scriptTag);
		return () => {
			document.body.removeChild(scriptTag);
		};
	}, []);

	useEffect(() => {
		if (token) {
			// @ts-expect-error
			window.snap.pay(token, {
				onSuccess: () => {
					toast.success("Pembayaran berhasil! Selamat menjadi premium!");
				},
				onPending: () => {
					toast.info("Menunggu pembayaran...");
				},
				onError: () => {
					toast.error("Pembayaran gagal. Silakan coba lagi.");
				},
			});
		}
	}, [token]);

	return (
		<Container>
			<section className="relative overflow-hidden rounded-2xl bg-primary-300 p-8 shadow-sm md:p-12">
				<div className="relative z-2">
					<div className="mb-6 text-center">
						<div className="mb-4 inline-flex items-center justify-center rounded-full bg-white/20 p-3">
							<CrownIcon size={48} className="text-white" />
						</div>
						<h1 className="mb-2 font-bold text-3xl text-white">Premium Access</h1>
						<p className="text-sm text-white/90">
							Hai, <strong>{session?.user.name.split(" ")[0]}</strong>! Tingkatkan peluangmu lolos SNBT dengan akses
							penuh ke semua materi.
						</p>
					</div>

					<div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
						{features.map((feature) => (
							<div key={feature.title} className="flex gap-3 rounded-lg bg-white/10 p-4">
								{feature.icon}
								<div>
									<h3 className="mb-1 font-semibold text-white">{feature.title}</h3>
									<p className="text-sm text-white/80">{feature.description}</p>
								</div>
							</div>
						))}
					</div>

					<div className="text-center">
						<p className="mb-4 font-bold text-4xl text-white">
							Rp 100.000
							<span className="ml-2 font-normal text-lg text-white/80">/ bulan</span>
						</p>
						<Button
							size="lg"
							className="w-full md:w-auto"
							disabled={transactionMutation.isPending}
							onClick={async () => {
								transactionMutation
									.mutateAsync({})
									.then((data) => {
										setToken(data.token);
									})
									.catch(() => {
										toast.error("Gagal membuat transaksi. Silakan coba lagi.");
									});
							}}
						>
							{transactionMutation.isPending ? (
								<>Memproses...</>
							) : (
								<>
									Aktifkan Premium
									<ArrowRightIcon size={20} />
								</>
							)}
						</Button>
					</div>
				</div>

				<div className="absolute -right-20 -bottom-20 aspect-square h-[150%] translate-x-1/3 translate-y-1/4 rounded-full bg-primary-200" />
			</section>
		</Container>
	);
}
