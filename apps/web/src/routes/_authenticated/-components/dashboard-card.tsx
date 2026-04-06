import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export const DashboardCard = ({ className, ...props }: ComponentProps<"section">) => (
  <section className={cn("rounded-2xl border bg-neutral-100 p-4 shadow-sm md:px-8 md:py-6", className)} {...props} />
);

export const DashboardCardTitle = ({ className, ...props }: ComponentProps<"h2">) => (
  <h2 className={cn("mb-2 font-medium", className)} {...props} />
);

export const DashboardCardContent = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cn("w-full", className)} {...props} />
);
