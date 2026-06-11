"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/** Big, room-legible countdown number. Rendered over the live preview. */
export function Countdown({ value }: { value: number | null }) {
  const reduce = useReducedMotion();
  if (value === null) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        {value === 0 ? (
          // The "go" beat: an expanding ring closes in as the shutter fires, so
          // the capture instant reads clearly instead of a blank pause.
          <motion.div
            key="go"
            initial={reduce ? { opacity: 0 } : { scale: 0.5, opacity: 0.9 }}
            animate={reduce ? { opacity: 1 } : { scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="h-[42vw] max-h-[220px] w-[42vw] max-w-[220px] rounded-full border-[6px] border-white drop-shadow-[0_6px_30px_rgb(0_0_0_/0.5)]"
          />
        ) : (
          <motion.span
            key={value}
            initial={reduce ? { opacity: 0 } : { scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="select-none font-num text-[26vw] font-bold leading-none text-white drop-shadow-[0_6px_30px_rgb(0_0_0_/0.6)] sm:text-[180px]"
          >
            {value}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
