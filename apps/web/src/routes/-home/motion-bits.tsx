import {
  animate,
  type HTMLMotionProps,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { type PointerEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TILT_SPRING = { stiffness: 220, damping: 18, mass: 0.6 };

type TiltCardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: ReactNode;
  maxTilt?: number;
  glare?: boolean;
};

export function TiltCard({ maxTilt = 8, glare = true, className, children, style, ...props }: TiltCardProps) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), TILT_SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), TILT_SPRING);
  const glareX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(py, [0, 1], ["0%", "100%"]);
  const glareBg = useMotionTemplate`radial-gradient(420px circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.45), transparent 45%)`;

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: "preserve-3d", ...style }}
      className={cn("group/tilt relative", className)}
      {...props}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  );
}

type CountUpProps = {
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
};

export function CountUp({ to, duration = 1.6, className, prefix = "", suffix = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, to, { duration, ease: [0.2, 0.7, 0.2, 1], onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [isInView, to, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {value.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

type FloatProps = HTMLMotionProps<"div"> & {
  distance?: number;
  duration?: number;
  delay?: number;
  rotate?: number;
};

export function Float({ distance = 10, duration = 4, delay = 0, rotate = 0, children, ...props }: FloatProps) {
  return (
    <motion.div
      animate={{ y: [0, -distance, 0], rotate: [0, rotate, 0] }}
      transition={{ duration, delay, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, className }: SectionHeadingProps) {
  return (
    <motion.div
      className={cn("flex flex-col items-center gap-3 text-center", className)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-sr-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-sr-blue-700 shadow-sr-1 backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-sr-sun-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-sr-amber" />
          </span>
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl font-bold text-pretty text-sr-ink md:text-4xl">{title}</h2>
      {description && <p className="max-w-2xl text-sm text-pretty text-sr-muted md:text-lg">{description}</p>}
    </motion.div>
  );
}
