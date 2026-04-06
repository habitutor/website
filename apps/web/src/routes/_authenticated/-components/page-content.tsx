import { MotionStagger } from "@/components/motion/motion-components";
import { cn } from "@/lib/utils";

export function PageContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <MotionStagger className={cn("relative z-10 flex flex-col gap-6", className)}>{children}</MotionStagger>;
}
