"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowCounterClockwise, DownloadSimple, Check } from "@phosphor-icons/react";
import type { Ratio } from "@/lib/capture";

/** Preview + retake / keep, shown after a capture. */
export function Review({
  src,
  ratio,
  onRetake,
  onKeep,
}: {
  src: string;
  ratio: Ratio;
  onRetake: () => void;
  onKeep: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[min(80vh,560px)] overflow-hidden rounded-vibe bg-surface ring-1 ring-line"
        style={{ aspectRatio: ratio === "1:1" ? "1 / 1" : "4 / 3" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Your captured photo" className="h-full w-full object-cover" />
      </motion.div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRetake}
          className="inline-flex items-center gap-2 rounded-vibe bg-surface px-5 py-3 font-num text-sm text-ink ring-1 ring-line transition-transform active:scale-[0.97]"
        >
          <ArrowCounterClockwise size={18} weight="bold" />
          Retake
        </button>
        <button
          type="button"
          onClick={onKeep}
          className="inline-flex items-center gap-2 rounded-vibe bg-accent px-6 py-3 font-num text-sm font-medium text-accent-ink transition-transform active:scale-[0.97]"
        >
          <DownloadSimple size={18} weight="bold" />
          Save photo
        </button>
      </div>
      <p className="flex items-center gap-1.5 font-num text-xs text-ink-dim">
        <Check size={14} weight="bold" /> Saves straight to your device. Nothing leaves it.
      </p>
    </div>
  );
}
