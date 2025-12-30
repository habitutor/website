import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/premium")({
	component: RouteComponent,
});

function RouteComponent() {
	const transactionMutation = useMutation(orpc.transactiuon.create.mutationOptions());

	useEffect(() => {
		// You can also change below url value to any script url you wish to load,
		// for example this is snap.js for Sandbox Env (Note: remove `.sandbox` from url if you want to use production version)
		const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";

		const scriptTag = document.createElement("script");
		scriptTag.src = midtransScriptUrl;

		// Optional: set script attribute, for example snap.js have data-client-key attribute
		// (change the value according to your client-key)
		const myMidtransClientKey = process.env.MIDTRANS_CLIENT_KEY || "";
		scriptTag.setAttribute("data-client-key", myMidtransClientKey);

		document.body.appendChild(scriptTag);

		return () => {
			document.body.removeChild(scriptTag);
		};
	}, []);

	return (
		<section>
			<h1>premum bos</h1>
			<Button>Activate Premum</Button>
		</section>
	);
}
