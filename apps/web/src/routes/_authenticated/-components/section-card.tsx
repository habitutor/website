import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

// Kata aksen serif miring di judul bagian, sama seperti judul-judul di landing page.
export function Accent({ children }: { children: ReactNode }) {
  return <span className="font-sr-serif font-semibold text-sr-blue-600 italic">{children}</span>;
}

// Bagian dashboard tanpa kotak pembungkus supaya tidak ada kartu di dalam kartu.
export function SectionCard({ title, action, className, children }: SectionCardProps) {
  return (
    <section className={cn("relative w-full", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-xl font-extrabold tracking-tight text-sr-ink md:text-2xl">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
