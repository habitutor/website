import { Image } from "@unpic/react";
import { motion, type MotionProps } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FeatureCardProps = {
  title: ReactNode;
  description: ReactNode;
  imageSrc: string;
  imageAlt: string;
  className?: string;
  contentClassName?: string;
  imageClassName?: string;
  decorations?: ReactNode;
  motionProps?: MotionProps;
};

export function FeatureCard({
  title,
  description,
  imageSrc,
  imageAlt,
  className,
  contentClassName,
  imageClassName,
  decorations,
  motionProps,
}: FeatureCardProps) {
  return (
    <motion.div
      className={cn(
        "relative flex min-h-88 flex-col overflow-hidden rounded-2xl bg-neutral-100 p-5 shadow-sm sm:min-h-96 md:min-h-112 md:p-8 md:pt-10",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      {...motionProps}
    >
      {decorations}

      <div className={cn("relative z-10 space-y-2 text-center md:text-left", contentClassName)}>
        <h3 className="text-xl font-bold md:text-3xl">{title}</h3>
        <p className="text-sm leading-relaxed text-foreground md:text-lg">{description}</p>
      </div>

      <div className="relative z-10 mt-auto flex min-h-40 w-full items-end justify-center pt-4 sm:min-h-44 md:min-h-52 md:pt-6">
        <motion.div whileHover={{ scale: 1.02, transition: { duration: 0.3 } }} className="flex w-full justify-center">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={800}
            height={600}
            layout="constrained"
            className={cn(
              "h-auto w-full max-w-56 object-contain object-bottom sm:max-w-64 md:max-w-72 lg:max-w-80",
              "border-2 border-neutral-200",
              imageClassName,
            )}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
