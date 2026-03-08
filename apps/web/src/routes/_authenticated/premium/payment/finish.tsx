import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import Loader from "@/components/loader";
import { Container } from "@/components/ui/container";
import { getApiBaseUrl } from "@/lib/api-base-url";
import { refreshAuthSession } from "@/lib/auth-session";
import { usePaymentStatus } from "./-hooks/use-payment-status";

async function syncTransactionStatus(orderId: string) {
	const response = await fetch(`${getApiBaseUrl()}/rpc/transaction/sync-status`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ orderId }),
	});

	if (!response.ok) {
		throw new Error("Gagal menyinkronkan status transaksi.");
	}
}

export const Route = createFileRoute("/_authenticated/premium/payment/finish")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>) => ({
		order_id: search.order_id as string | undefined,
		status_code: search.status_code as number | undefined,
		transaction_status: search.transaction_status as string | undefined,
	}),
});

function RouteComponent() {
	const search = Route.useSearch();
	const { isLoading, order_id } = usePaymentStatus("finish", search);
	const navigate = useNavigate();

	useEffect(() => {
		if (isLoading || !order_id) return;

		let isCancelled = false;

		const refreshPremiumState = async () => {
			try {
				await syncTransactionStatus(order_id);
			} catch (error) {
				console.error("Failed to sync premium state after payment finish", error);
			}

			await refreshAuthSession();

			if (isCancelled) return;

			await navigate({ to: "/premium", replace: true });
			window.location.replace("/premium");
		};

		void refreshPremiumState();

		return () => {
			isCancelled = true;
		};
	}, [isLoading, navigate, order_id]);

	if (isLoading) return <Loader />;

	return (
		<Container className="flex min-h-[calc(100vh-200px)] items-center justify-center">
			<div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl bg-primary-300 p-8 shadow-lg">
				<Loader />
				<div className="text-center text-white">
					<h1 className="font-bold text-2xl">Memperbarui akun premium...</h1>
					<p className="mt-2 text-sm text-white/90">Kamu akan langsung dikembalikan ke halaman premium.</p>
				</div>
			</div>
		</Container>
	);
}
