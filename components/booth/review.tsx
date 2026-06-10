"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowCounterClockwise, DownloadSimple, Check } from "@phosphor-icons/react";

/** Preview + retake / keep, shown after a capture. */
export function Review({
  src,
  onRetake,
  onKeep,
}: {
  src: string;
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
        className="relative flex max-h-[68vh] w-full items-center justify-center"
      >
        {/* The frame is baked into the image; show it whole, no cropping. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Your framed photo"
          className="block h-auto max-h-[68vh] w-auto max-w-[min(90vw,520px)] rounded-[4px] shadow-[0_24px_60px_rgb(0_0_0/0.22)]"
        />
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
