import { useInView as useFramerInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useFramerInView(ref, {
    once: true,
    amount: 0.1,
    ...options,
  });

  return [ref, isInView] as const;
}

export function useAnimatedCounter(
  endValue: number,
  duration = 1500,
  delay = 0,
): { ref: React.RefObject<HTMLSpanElement>; value: number } {
  const [value, setValue] = useState(0);
  const [ref, isInView] = useInView();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!(isInView || endValue > 0) || hasStarted.current) return;
    hasStarted.current = true;

    let animationFrame: number;

    const timeoutId = setTimeout(() => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - (1 - progress) ** 3;
        setValue(Math.floor(endValue * easeOut));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrame);
    };
  }, [isInView, endValue, duration, delay]);

  return { ref: ref as React.RefObject<HTMLSpanElement>, value };
}
