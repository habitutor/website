import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TryOutCard({ data }: { data: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-sm w-full 2xl:min-w-80 h-100"
    >
      <div className="space-y-2 border-b bg-background p-6">
        <h3 className="font-medium text-sm text-neutral-1000">{data.label}</h3>
        {data.price && (
          <p className="font-bold text-3xl text-primary-300">{data.price}</p>
        )}
      </div>
      <ul className="mt-4 space-y-2 px-6 flex-1">
        {data.features.map((feature: string) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <div className="flex size-4 items-center justify-center rounded-full bg-primary-300 p-0.5 text-white">
              <CheckIcon weight="bold" />
            </div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="p-6">
        <Link
          to={data.cta.url as string}
          className={cn(
            buttonVariants({ size: "sm", variant: "outline" }),
            "w-full",
          )}
        >
          {data.cta.label}
          <ArrowRightIcon size={16} weight="bold" />
        </Link>
      </div>
    </motion.div>
  );
}
