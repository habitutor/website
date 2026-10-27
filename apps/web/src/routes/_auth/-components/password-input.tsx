import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { type ComponentProps, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordInput({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-11", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-sr-muted transition-colors hover:text-sr-blue-600"
      >
        {visible ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
      </button>
    </div>
  );
}
