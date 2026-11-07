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
      hide?: () => void;
    };
  }
}

const MIDTRANS_SCRIPT_URL_PROD = "https://app.midtrans.com/snap/snap.js";
const MIDTRANS_SCRIPT_URL_SANDBOX = "https://app.sandbox.midtrans.com/snap/snap.js";

const MIDTRANS_SCRIPT_ID = "midtrans-snap";

// Skrip Snap dimuat sekali lalu dipakai ulang. Dulu tiap komponen pembayaran menambah & menghapus skripnya
// sendiri, sehingga snap.js diunduh berulang (bahkan beberapa sekaligus) dan popup bayar terasa lambat.
export function useMidtransScript() {
  useEffect(() => {
    if (document.getElementById(MIDTRANS_SCRIPT_ID)) return;
    const midtransScriptUrl = import.meta.env.PROD ? MIDTRANS_SCRIPT_URL_PROD : MIDTRANS_SCRIPT_URL_SANDBOX;
    const scriptTag = document.createElement("script");
    scriptTag.id = MIDTRANS_SCRIPT_ID;
    scriptTag.src = midtransScriptUrl;
    scriptTag.async = true;
    const myMidtransClientKey = (process.env.MIDTRANS_CLIENT_KEY ?? import.meta.env.MIDTRANS_CLIENT_KEY) || "";
    scriptTag.setAttribute("data-client-key", myMidtransClientKey);
    document.body.appendChild(scriptTag);
  }, []);
}
