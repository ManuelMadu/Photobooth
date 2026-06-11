"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowCounterClockwise,
  DownloadSimple,
  Check,
  WarningCircle,
} from "@phosphor-icons/react";

/** Preview + retake / keep, shown after a capture. */
export function Review({
  src,
  onRetake,
  onKeep,
}: {
  src: string;
  onRetake: () => void;
  /** Returns false if the browser refused the download. */
  onKeep: () => boolean;
}) {
  const reduce = useReducedMotion();
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);
  const returnTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (returnTimer.current !== null) window.clearTimeout(returnTimer.current);
    };
  }, []);

  // Save, flip to a "Saved" confirmation, then ease back to the live camera so
  // the download registers instead of vanishing in a single frame. If the
  // browser refuses the download, stay put and offer a manual-save fallback.
  const handleKeep = useCallback(() => {
    if (saved) return;
    setFailed(false);
    if (!onKeep()) {
      setFailed(true);
      return;
    }
    setSaved(true);
    returnTimer.current = window.setTimeout(onRetake, 1200);
  }, [saved, onKeep, onRetake]);

  // Keyboard parity with the live screen: Enter saves, R / Backspace retakes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (saved) return;
      if (e.code === "Enter") {
        e.preventDefault();
        handleKeep();
      } else if (e.code === "KeyR" || e.code === "Backspace") {
        e.preventDefault();
        onRetake();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saved, handleKeep, onRetake]);

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
          disabled={saved}
          className="inline-flex items-center gap-2 rounded-vibe bg-surface px-5 py-3 font-num text-sm text-ink ring-1 ring-line transition-transform active:scale-[0.97] disabled:opacity-40"
        >
          <ArrowCounterClockwise size={18} weight="bold" />
          Retake
        </button>
        <button
          type="button"
          onClick={handleKeep}
          disabled={saved}
          aria-live="polite"
          className="inline-flex min-w-[148px] items-center justify-center gap-2 rounded-vibe bg-accent px-6 py-3 font-num text-sm font-medium text-accent-ink transition-transform active:scale-[0.97] disabled:active:scale-100"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {saved ? (
              <motion.span
                key="saved"
                initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2"
              >
                <Check size={18} weight="bold" />
                Saved
              </motion.span>
            ) : (
              <motion.span
                key="save"
                exit={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-2"
              >
                <DownloadSimple size={18} weight="bold" />
                {failed ? "Try again" : "Save photo"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <p
        className={`flex items-center gap-1.5 text-center font-num text-xs ${
          failed ? "text-accent" : "text-ink-dim"
        }`}
      >
        {failed ? (
          <WarningCircle size={14} weight="bold" />
        ) : (
          <Check size={14} weight="bold" />
        )}
        {failed
          ? "Couldn’t save automatically. Long-press the photo to save it."
          : saved
            ? "Saved to your device. Nothing left it."
            : "Saves straight to your device. Nothing leaves it."}
      </p>
    </div>
  );
}
