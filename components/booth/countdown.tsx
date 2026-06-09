"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/** Big, room-legible countdown number. Rendered over the live preview. */
export function Countdown({ value }: { value: number | null }) {
  const reduce = useReducedMotion();
  if (value === null) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={reduce ? { opacity: 0 } : { scale: 1.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="select-none font-num text-[26vw] font-bold leading-none text-white drop-shadow-[0_6px_30px_rgb(0_0_0_/0.6)] sm:text-[180px]"
        >
          {value === 0 ? "" : value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
