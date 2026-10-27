import { SpinnerIcon } from "@phosphor-icons/react";
import { Slot as SlotPrimitive } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-sr-sm font-semibold text-sm outline-none transition-all duration-200 ease-sr focus-visible:border-sr-blue-500 focus-visible:ring-[3px] focus-visible:ring-sr-blue-500/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>Link]:hover:cursor-pointer [&>a]:hover:cursor-pointer [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-sr-blue-500 bg-linear-145 bg-[length:160%_160%] bg-[position:0%_0%] hover:bg-[position:100%_100%] from-white/20 via-transparent to-black/15 text-white shadow-sr-1 hover:-translate-y-0.5 hover:bg-sr-blue-600 hover:shadow-sr-2",
        darkBlue:
          "bg-sr-ink bg-linear-145 bg-[length:160%_160%] bg-[position:0%_0%] hover:bg-[position:100%_100%] from-white/10 via-transparent to-sr-blue-500/30 text-white shadow-sr-1 hover:-translate-y-0.5 hover:bg-sr-ink-2 hover:shadow-sr-2",
        destructive:
          "bg-destructive bg-linear-145 bg-[length:160%_160%] bg-[position:0%_0%] hover:bg-[position:100%_100%] from-white/15 via-transparent to-black/15 text-white shadow-sr-1 hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border-2 border-sr-line-2 bg-white text-sr-ink hover:-translate-y-0.5 hover:border-sr-blue-200 hover:bg-sr-blue-50 hover:shadow-sr-1",
        // Yellow
        secondary:
          "bg-sr-sun-500 bg-linear-145 bg-[length:160%_160%] bg-[position:0%_0%] hover:bg-[position:100%_100%] from-white/40 via-transparent to-sr-orange-500/25 text-sr-ink shadow-sr-1 hover:-translate-y-0.5 hover:bg-sr-sun-400 hover:shadow-sr-sun",
        // White
        white:
          "bg-white bg-linear-145 bg-[length:160%_160%] bg-[position:0%_0%] hover:bg-[position:100%_100%] from-white via-transparent to-sr-blue-100 text-sr-blue-600 shadow-sr-1 hover:-translate-y-0.5 hover:bg-sr-blue-50 hover:shadow-sr-2",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-sr-blue-600 underline-offset-4 hover:underline",
        navbar:
          "bg-inherit text-foreground hover:bg-primary/5 data-[active=true]:border-primary data-[active=true]:border-b-2 data-[active=true]:bg-primary/10",
        // Light Blue
        lightBlue:
          "bg-sr-blue-500 bg-linear-145 bg-[length:160%_160%] bg-[position:0%_0%] hover:bg-[position:100%_100%] from-white/20 via-transparent to-black/15 text-white shadow-sr-1 hover:-translate-y-0.5 hover:bg-sr-blue-600 hover:shadow-sr-2",
      },
      size: {
        default: "h-10 px-6 py-2 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 rounded-sr-sm px-6 has-[>svg]:px-4",
        lg: "h-11 rounded-sr-sm px-8 has-[>svg]:px-6",
        full: "h-full rounded-none px-6 py-2",
        icon: "size-9",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  isPending = false,
  children,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isPending?: boolean;
  }) {
  const Comp = asChild ? SlotPrimitive : "button";

  if (asChild) {
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isPending}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isPending}
      {...props}
    >
      {isPending && <SpinnerIcon className="animate-spin" />}
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
