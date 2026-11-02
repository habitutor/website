import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

// Bagian dashboard tanpa kotak pembungkus supaya tidak ada kartu di dalam kartu.
export function SectionCard({ title, action, className, children }: SectionCardProps) {
  return (
    <section className={cn("relative w-full", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-extrabold text-sr-ink md:text-xl">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
