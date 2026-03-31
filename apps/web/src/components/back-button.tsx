import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import { cn, type TRoutes } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export function BackButton({
  to,
  params,
  variant = "lightBlue",
  className,
}: {
  to: TRoutes;
  params?: Record<string, string>;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  className?: string;
}) {
  return (
    <Link to={to} params={params} className={cn(buttonVariants({ variant, size: "sm" }), className)}>
      <ArrowLeftIcon size={20} weight="bold" />
      Kembali
    </Link>
  );
}
