import { cn } from "@/lib/utils";

export const RequiredMarker = (props: { className?: string }) => (
  <span className={cn("text-destructive", props.className)}>*</span>
);
