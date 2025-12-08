import { ArrowRightIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const DismissableAlert = () => {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="flex justify-between bg-yellow-200 p-4">
      <div className="flex flex-col justify-center">
        <p className="font-bold text-2xl">Download Aplikasi Sekarang</p>
        <p>Gunakan di Mobile. Akses kapanpun</p>
      </div>

      <div className="flex flex-col items-end justify-between gap-4">
        <Button onClick={() => setClosed(true)} variant={"ghost"} size={"icon"}>
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
