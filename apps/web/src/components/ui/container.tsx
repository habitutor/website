import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

export const Container = ({
  className,
  asChild = false,
  children,
}: {
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
}) => {
  const Comp = asChild ? Slot.Slot : "section";

  return (
    <Comp
      className={cn("mx-auto w-full max-w-4xl px-4 py-8 md:px-8", className)}
    >
      {children}
    </Comp>
  );
};
