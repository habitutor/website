import { useEffect } from "react";

declare global {
	interface Window {
		snap: {
			pay: (
				token: string,
				options: {
					onSuccess?: () => void;
					onPending?: () => void;
					onError?: () => void;
					onClose?: () => void;
				},
			) => void;
		};
	}
}

const MIDTRANS_SCRIPT_URL_PROD = "https://app.midtrans.com/snap/snap.js";
const MIDTRANS_SCRIPT_URL_SANDBOX = "https://app.sandbox.midtrans.com/snap/snap.js";

export function useMidtransScript() {
	useEffect(() => {
		const midtransScriptUrl = import.meta.env.PROD ? MIDTRANS_SCRIPT_URL_PROD : MIDTRANS_SCRIPT_URL_SANDBOX;
		const scriptTag = document.createElement("script");
		scriptTag.src = midtransScriptUrl;
		const myMidtransClientKey = (process.env.MIDTRANS_CLIENT_KEY ?? import.meta.env.MIDTRANS_CLIENT_KEY) || "";
		scriptTag.setAttribute("data-client-key", myMidtransClientKey);
		document.body.appendChild(scriptTag);
		return () => {
			document.body.removeChild(scriptTag);
		};
	}, []);
}
