import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/premium")({
  component: RouteComponent,
});

function RouteComponent() {
  const transactionMutation = useMutation(orpc.transaction.premium.mutationOptions());
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    // You can also change below url value to any script url you wish to load,
    // for example this is snap.js for Sandbox Env (Note: remove `.sandbox` from url if you want to use production version)
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";

    const scriptTag = document.createElement("script");
    scriptTag.src = midtransScriptUrl;

    // Optional: set script attribute, for example snap.js have data-client-key attribute
    // (change the value according to your client-key)
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
          toast("Payment success!");
        },
      });
    }

    return () => {
      return;
    };
  }, [token]);

  return (
    <section>
      <h1>premum bos</h1>
      <Button
        disabled={transactionMutation.isPending}
        onClick={async () => {
          transactionMutation.mutateAsync(6).then((data) => {
            toast(JSON.stringify(data));
            setToken(data.token);
          });
        }}
      >
        {transactionMutation.isPending ? <>Mengalihkan...</> : "Activate Premium"}
      </Button>
    </section>
  );
}
