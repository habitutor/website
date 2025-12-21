import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { ArrowRightIcon } from "@phosphor-icons/react";

export function NextButton({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className={cn(
        buttonVariants({ variant: "lightBlue", size: "sm" }),
        "gap-2 px-[14px] py-[8px] text-white text-xs shadow-xs"
      )}
    >
      Selanjutnya
      <ArrowRightIcon size={20} weight="bold" />
    </Link>
  );
}
