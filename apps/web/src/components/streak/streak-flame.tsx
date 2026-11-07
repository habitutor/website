import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";

const OUTER_PATH =
  "M50 4C58 26 82 38 82 70C82 96 66 114 50 114C34 114 18 96 18 70C18 52 30 44 36 30C40 44 46 48 50 50C50 34 46 18 50 4Z";
const INNER_PATH =
  "M50 52C56 64 68 72 68 88C68 102 60 110 50 110C40 110 32 102 32 88C32 76 42 70 44 60C47 68 50 70 52 72C52 64 49 58 50 52Z";

const PALETTE = {
  brain: { outer: ["#c9e3ff", "#4f8bff", "#2347c9"], inner: ["#ffffff", "#e6f1ff", "#9cc4ff"], glow: "#4f8bff" },
  lit: { outer: ["#ffe08a", "#ff9a3c", "#e5482a"], inner: ["#ffffff", "#fff3c4", "#ffc83d"], glow: "#ff9a3c" },
  idle: { outer: ["#e6e9f2", "#bcc3d6", "#949db5"], inner: ["#ffffff", "#eef1f7", "#d5dbe8"], glow: "transparent" },
} as const;

type StreakFlameProps = {
  lit?: boolean;
  tone?: "fire" | "brain";
  animated?: boolean;
  className?: string;
};

// Api berlapis gradien + kilau + bayangan supaya terasa 3D; berkedip pelan saat menyala.
export function StreakFlame({ lit = true, tone = "fire", animated = true, className }: StreakFlameProps) {
  const id = useId().replace(/:/g, "");
  const reduceMotion = useReducedMotion();
  const colors = lit ? (tone === "brain" ? PALETTE.brain : PALETTE.lit) : PALETTE.idle;
  const flicker = animated && lit && !reduceMotion;

  return (
    <svg viewBox="0 0 100 124" className={cn("overflow-visible", className)} aria-hidden>
      <defs>
        <radialGradient id={`${id}-outer`} cx="50%" cy="72%" r="62%">
          <stop offset="0%" stopColor={colors.outer[0]} />
          <stop offset="55%" stopColor={colors.outer[1]} />
          <stop offset="100%" stopColor={colors.outer[2]} />
        </radialGradient>
        <radialGradient id={`${id}-inner`} cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor={colors.inner[0]} />
          <stop offset="45%" stopColor={colors.inner[1]} />
          <stop offset="100%" stopColor={colors.inner[2]} />
        </radialGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <ellipse cx="50" cy="118" rx="26" ry="5" fill="#14224e" opacity="0.18" />
      {lit && <path d={OUTER_PATH} fill={colors.glow} opacity="0.55" filter={`url(#${id}-glow)`} />}

      <motion.g
        style={{ originX: "50%", originY: "100%" }}
        animate={flicker ? { scaleY: [1, 1.05, 0.97, 1.03, 1], skewX: [0, 2, -2, 1, 0] } : undefined}
        transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <path d={OUTER_PATH} fill={`url(#${id}-outer)`} />
        <path d={OUTER_PATH} fill="none" stroke="#000" strokeOpacity="0.08" strokeWidth="2" />
        <motion.path
          d={INNER_PATH}
          fill={`url(#${id}-inner)`}
          style={{ originX: "50%", originY: "100%" }}
          animate={flicker ? { scaleY: [1, 0.92, 1.08, 1], scaleX: [1, 1.04, 0.96, 1] } : undefined}
          transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <ellipse cx="34" cy="64" rx="5" ry="12" fill="#fff" opacity="0.45" transform="rotate(-18 34 64)" />
        <circle cx="38" cy="46" r="2.5" fill="#fff" opacity="0.5" />
      </motion.g>
    </svg>
  );
}
