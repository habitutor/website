import type { Icon } from "@phosphor-icons/react";
import { Image } from "@unpic/react";
import { type MotionProps, motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TiltCard } from "./motion-bits";

export const FEATURE_TONES = {
  blue: {
    card: "from-white via-sr-blue-50 to-sr-blue-100",
    blob: "bg-sr-blue-200/70",
    badge: "bg-sr-blue-500 text-white shadow-sr-2",
  },
  sun: {
    card: "from-white via-sr-ivory to-sr-sun-100",
    blob: "bg-sr-sun-200/80",
    badge: "sr-card-sun",
  },
  orange: {
    card: "from-white via-sr-ivory to-sr-orange-100",
    blob: "bg-sr-orange-200/70",
    badge: "bg-sr-orange-500 text-white shadow-sr-1",
  },
  sky: {
    card: "from-white via-sr-blue-50 to-tertiary-100",
    blob: "bg-tertiary-200/80",
    badge: "bg-sr-blue-700 text-white shadow-sr-2",
  },
} as const;

export type FeatureTone = keyof typeof FEATURE_TONES;

type FeatureCardProps = {
  title: ReactNode;
  description: ReactNode;
  imageSrc: string;
  imageAlt: string;
  icon: Icon;
  badge: string;
  tone?: FeatureTone;
  className?: string;
  contentClassName?: string;
  imageClassName?: string;
  motionProps?: MotionProps;
};

export function FeatureCard({
  title,
  description,
  imageSrc,
  imageAlt,
  icon: BadgeIcon,
  badge,
  tone = "blue",
  className,
  contentClassName,
  imageClassName,
  motionProps,
}: FeatureCardProps) {
  const palette = FEATURE_TONES[tone];

  return (
    <motion.div
      className={cn("h-full", className)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      {...motionProps}
    >
      <TiltCard
        maxTilt={6}
        whileHover={{ y: -6 }}
        className={cn(
          "group flex h-full min-h-88 flex-col overflow-hidden rounded-sr-lg border border-white bg-linear-to-br p-5 shadow-sr-1 transition-shadow duration-500 hover:shadow-sr-3 sm:min-h-96 md:min-h-112 md:p-8",
          palette.card,
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -right-16 -bottom-16 size-64 animate-sr-drift rounded-full blur-2xl transition-transform duration-700 group-hover:scale-125",
            palette.blob,
          )}
        />

        <div className={cn("relative z-10 space-y-3 text-center md:text-left", contentClassName)}>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-transform duration-300 group-hover:-translate-y-0.5",
              palette.badge,
            )}
          >
            <BadgeIcon weight="fill" className="size-3.5 transition-transform duration-500 group-hover:rotate-12" />
            {badge}
          </span>
          <h3 className="text-xl font-bold text-sr-ink md:text-3xl">{title}</h3>
          <p className="text-sm leading-relaxed text-sr-ink-2 md:text-lg">{description}</p>
        </div>

        <div
          className="relative z-10 mt-auto flex min-h-40 w-full items-end justify-center pt-6 sm:min-h-44 md:min-h-52"
          style={{ transform: "translateZ(40px)" }}
        >
          <div
            className={cn(
              "w-full max-w-56 overflow-hidden rounded-sr-sm border border-sr-line bg-white shadow-sr-2 transition-transform duration-500 ease-(--ease-sr) group-hover:-translate-y-3 group-hover:rotate-[-1deg] sm:max-w-64 md:max-w-72 lg:max-w-80",
              imageClassName,
            )}
          >
            <div className="flex items-center gap-1 border-b border-sr-line bg-sr-blue-50 px-2.5 py-1.5">
              <span className="size-1.5 rounded-full bg-sr-orange-500" />
              <span className="size-1.5 rounded-full bg-sr-sun-500" />
              <span className="size-1.5 rounded-full bg-sr-live" />
            </div>
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={800}
              height={600}
              layout="constrained"
              className="h-auto w-full object-contain object-bottom"
            />
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}
