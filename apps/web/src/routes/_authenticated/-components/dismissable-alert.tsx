import { ArrowRightIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const TIME_ELAPSED_BEFORE_SHOWING_ALERT_AGAIN = 1000 * 60 * 60 * 24; // 24 hours

export const DismissableAlert = () => {
  const [closed, setClosed] = useState<boolean>(() => {
    const previousCloseState = localStorage.getItem("dismissable-alert-closed");
    if (!previousCloseState) return false;

    const lastClosed = new Date(previousCloseState);
    const now = new Date();

    return (
      now.getTime() - lastClosed.getTime() <
      TIME_ELAPSED_BEFORE_SHOWING_ALERT_AGAIN
    );
  });

  if (closed) return null;

  return (
    <div className="flex justify-between bg-yellow-200 p-4">
      <div className="flex flex-col justify-center">
        <p className="font-bold text-2xl">Download Aplikasi Sekarang</p>
        <p>Gunakan di Mobile. Akses kapanpun</p>
      </div>

      <div className="flex flex-col items-end justify-between gap-4">
        <Button
          onClick={() => {
            setClosed(true);
            localStorage.setItem(
              "dismissable-alert-closed",
              new Date().toISOString(),
            );
          }}
          variant={"ghost"}
          size={"icon"}
        >
          <XIcon strokeWidth={24} />
        </Button>
        <Button size={"icon"} asChild>
          <a
            href="https://youtube.com"
            rel="noopener norefferer"
            target="_blank"
          >
            <ArrowRightIcon strokeWidth={12} />
          </a>
        </Button>
      </div>
    </div>
  );
};
