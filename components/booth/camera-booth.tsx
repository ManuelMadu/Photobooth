"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  Palette,
  ArrowsClockwise,
  SpeakerSimpleHigh,
  SpeakerSimpleX,
  Lightning,
  LightningSlash,
  X,
  Heart,
  Star,
  Sparkle,
} from "@phosphor-icons/react";
import { useCamera } from "@/hooks/use-camera";
import {
  cropFrame,
  downloadImage,
  photoFilename,
  playShutter,
  type Ratio,
} from "@/lib/capture";
import { frameToDataURL } from "@/lib/frames";
import { getVibe, type VibeId } from "@/lib/vibes";
import { PermissionState } from "./permission-state";
import { Countdown } from "./countdown";
import { Review } from "./review";

type Phase = "live" | "counting" | "review";
type CountdownSec = 0 | 3 | 5;

export function CameraBooth({ vibe }: { vibe: VibeId }) {
  const router = useRouter();
  const { videoRef, attachVideo, status, facing, hasMultiple, flip, retry } =
    useCamera();

  const [phase, setPhase] = useState<Phase>("live");
  const [photo, setPhoto] = useState<string | null>(null);
  const [countNum, setCountNum] = useState<number | null>(null);
  const [flashing, setFlashing] = useState(false);

  // capture settings
  const [ratio, setRatio] = useState<Ratio>("1:1");
  const [countdownSec, setCountdownSec] = useState<CountdownSec>(3);
  const [sound, setSound] = useState(true);
  const [flashOn, setFlashOn] = useState(true);

  const timers = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const doCapture = useCallback(() => {
    clearTimers();
    setCountNum(null);
    if (flashOn) {
      setFlashing(true);
      schedule(() => setFlashing(false), 180);
    }
    if (sound) playShutter();
    const video = videoRef.current;
    const crop = video ? cropFrame(video, ratio, facing === "user") : null;
    if (!crop) {
      setPhase("live");
      return;
    }
    setPhoto(frameToDataURL(crop, vibe));
    schedule(() => setPhase("review"), flashOn ? 150 : 0);
  }, [clearTimers, schedule, flashOn, sound, ratio, facing, vibe, videoRef]);

  const capture = useCallback(() => {
    if (phase !== "live" || status !== "ready") return;
    if (countdownSec === 0) {
      doCapture();
      return;
    }
    setPhase("counting");
    let n = countdownSec;
    setCountNum(n);
    const tick = () => {
      n -= 1;
      if (n > 0) {
        setCountNum(n);
        schedule(tick, 1000);
      } else {
        setCountNum(0);
        schedule(doCapture, 300);
      }
    };
    schedule(tick, 1000);
  }, [phase, status, countdownSec, doCapture, schedule]);

  const retake = useCallback(() => {
    clearTimers();
    setPhoto(null);
    setCountNum(null);
    setPhase("live");
  }, [clearTimers]);

  // Abort an in-progress countdown and drop straight back to the live preview.
  const cancelCountdown = useCallback(() => {
    clearTimers();
    setCountNum(null);
    setPhase("live");
  }, [clearTimers]);

  // Downloads only, reporting whether the browser accepted it. The Review screen
  // owns the "saved" confirmation beat (or a failure fallback) and calls back to
  // retake() once it's done, so the return-to-live isn't instant.
  const keep = useCallback(
    () => (photo ? downloadImage(photo, photoFilename()) : false),
    [photo],
  );

  // keyboard: space/enter captures while live, escape aborts a countdown
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "Enter") && phase === "live") {
        e.preventDefault();
        capture();
      } else if (e.code === "Escape" && phase === "counting") {
        e.preventDefault();
        cancelCountdown();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [capture, phase, cancelCountdown]);

  const meta = getVibe(vibe);
  const aspect = ratio === "1:1" ? "1 / 1" : "4 / 3";
  const isPurikura = vibe === "purikura";
  const backdrop =
    vibe === "purikura"
      ? "vibe-candy"
      : vibe === "polaroid"
        ? "vibe-snapshot"
        : "vibe-paper";

  const stageInner = (
    <>
      <video
        ref={attachVideo}
        playsInline
        muted
        autoPlay
        className={`h-full w-full object-cover ${facing === "user" ? "mirror" : ""} ${
          status === "ready" ? "opacity-100" : "opacity-0"
        } transition-opacity duration-500`}
      />

      <Countdown value={countNum} />

      {/* capture flash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-40 transition-opacity duration-150"
        style={{ background: meta.flash, opacity: flashing ? 0.92 : 0 }}
      />

      {/* permission / error / loading overlay */}
      {status !== "ready" && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-bg/85 p-6 backdrop-blur-sm">
          <PermissionState status={status} onRetry={retry} />
        </div>
      )}
    </>
  );

  return (
    <div
      data-vibe={vibe}
      className={`relative flex min-h-[100dvh] flex-col text-ink ${backdrop}`}
    >
      {/* ---- Top bar ---- */}
      <header className="relative z-20 flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 rounded-vibe bg-surface px-3 py-2 font-num text-sm text-ink ring-1 ring-line transition-transform active:scale-[0.97]"
        >
          <Palette size={16} weight="bold" />
          <span>Change look</span>
        </button>
      </header>

      {/* ---- Stage ---- */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6">
        {phase === "review" && photo ? (
          <Review src={photo} vibe={vibe} onRetake={retake} onKeep={keep} />
        ) : (
          <div className="flex w-full flex-col items-center gap-6">
            {vibe === "purikura" ? (
              <>
                <PurikuraTitle />
                <PurikuraFrame aspect={aspect} animate={phase === "counting"}>
                  {stageInner}
                </PurikuraFrame>
              </>
            ) : vibe === "polaroid" ? (
              <>
                <PolaroidTitle />
                <PolaroidFrame aspect={aspect}>{stageInner}</PolaroidFrame>
              </>
            ) : (
              <>
                <VintageTitle />
                <VintageFrame aspect={aspect}>{stageInner}</VintageFrame>
              </>
            )}
          </div>
        )}
      </main>

      {/* ---- Controls ---- */}
      {phase !== "review" && (
        <footer className="relative z-20 px-4 pb-6 pt-3 sm:px-6">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            {/* left settings cluster */}
            <div
              className={`flex items-center gap-2 transition-opacity ${
                phase === "counting" ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <Pill
                onClick={() => setRatio((r) => (r === "1:1" ? "4:3" : "1:1"))}
                label={`Aspect ratio ${ratio}`}
              >
                <span className="font-num text-xs">{ratio}</span>
              </Pill>
              <TimerSegment value={countdownSec} onChange={setCountdownSec} />
            </div>

            {/* shutter while live, cancel while counting */}
            {phase === "counting" ? (
              <button
                type="button"
                onClick={cancelCountdown}
                aria-label="Cancel countdown"
                className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-surface text-ink ring-2 ring-line transition-transform active:scale-95 sm:h-[76px] sm:w-[76px]"
              >
                <X size={26} weight="bold" />
              </button>
            ) : (
              <button
                type="button"
                onClick={capture}
                disabled={status !== "ready" || phase !== "live"}
                aria-label="Take photo"
                className="group relative grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full ring-2 ring-accent transition-transform active:scale-95 disabled:opacity-40 sm:h-[76px] sm:w-[76px]"
              >
                {isPurikura ? (
                  <span className="grid place-items-center text-accent transition-transform duration-150 group-active:scale-90">
                    <Heart weight="fill" size={42} />
                  </span>
                ) : (
                  <span className="h-[52px] w-[52px] rounded-full bg-accent transition-transform duration-150 group-active:scale-90 sm:h-[58px] sm:w-[58px]" />
                )}
              </button>
            )}

            {/* right cluster */}
            <div
              className={`flex items-center gap-2 transition-opacity ${
                phase === "counting" ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <Pill onClick={() => setFlashOn((f) => !f)} active={flashOn} label="Flash">
                {flashOn ? (
                  <Lightning size={18} weight="fill" />
                ) : (
                  <LightningSlash size={18} weight="bold" />
                )}
              </Pill>
              <Pill onClick={() => setSound((s) => !s)} active={sound} label="Sound">
                {sound ? (
                  <SpeakerSimpleHigh size={18} weight="bold" />
                ) : (
                  <SpeakerSimpleX size={18} weight="bold" />
                )}
              </Pill>
              {hasMultiple && (
                <Pill onClick={flip} label="Flip camera">
                  <ArrowsClockwise size={18} weight="bold" />
                </Pill>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

/* ---- Vintage: a framed paper print with a typewriter caption strip ------- */
function VintageFrame({
  aspect,
  children,
}: {
  aspect: string;
  children: React.ReactNode;
}) {
  // Date stamped on the print, like a real booth strip. Day-level, so the SSR
  // and client renders agree.
  const stamp = useMemo(
    () =>
      new Date()
        .toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
        .toUpperCase(),
    [],
  );
  return (
    <div className="relative w-full max-w-[min(70vh,520px)] rounded-vibe bg-surface p-3 pb-9 shadow-[0_28px_70px_rgb(43_32_24/0.3)] ring-1 ring-line">
      <div
        className="relative w-full overflow-hidden rounded-[2px] bg-surface-2"
        style={{ aspectRatio: aspect }}
      >
        {children}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-2.5 font-num text-[11px] uppercase tracking-[0.2em] text-ink-dim">
        <span>Photo Booth</span>
        <span>{stamp}</span>
      </div>
    </div>
  );
}

/* ---- Polaroid: white film border with a handwritten date under the photo - */
function PolaroidFrame({
  aspect,
  children,
}: {
  aspect: string;
  children: React.ReactNode;
}) {
  const stamp = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );
  return (
    <div
      // Real Polaroid proportions: generous, even white on the sides + top, a
      // much thicker bottom border for the caption. Percentage padding keeps the
      // border-to-photo ratio fixed as the frame scales.
      className="relative w-full max-w-[min(76vh,540px)] rounded-vibe bg-surface shadow-[0_30px_70px_rgb(20_22_24/0.32)] ring-1 ring-line"
      style={{ padding: "6% 6% 22%" }}
    >
      <div
        className="relative w-full overflow-hidden rounded-[2px] bg-surface-2"
        style={{ aspectRatio: aspect }}
      >
        {children}
      </div>
      <p className="absolute inset-x-0 bottom-[7%] -rotate-1 text-center font-display text-3xl leading-none text-ink-dim sm:text-4xl">
        {stamp}
      </p>
    </div>
  );
}

/* ---- Purikura: rounded sticker frame ringed with floating doodads -------- */
function PurikuraFrame({
  aspect,
  animate,
  children,
}: {
  aspect: string;
  /** Float the doodads. Kept still while live so they don't fight framing. */
  animate: boolean;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const still = reduce || !animate;
  return (
    <div className="relative w-full max-w-[min(70vh,520px)]">
      <Doodad className="-left-3 -top-4 text-accent" delay={0} reduce={still}>
        <Heart weight="fill" size={30} />
      </Doodad>
      <Doodad className="-right-2 -top-5 text-[#7cd6d6]" delay={0.5} reduce={still}>
        <Star weight="fill" size={24} />
      </Doodad>
      <Doodad className="-left-4 bottom-10 text-[#b794f6]" delay={1} reduce={still}>
        <Sparkle weight="fill" size={26} />
      </Doodad>
      <Doodad className="-right-3 bottom-6 text-accent" delay={1.5} reduce={still}>
        <Star weight="fill" size={18} />
      </Doodad>

      <div className="relative rounded-vibe bg-surface p-2.5 shadow-[0_22px_60px_rgb(255_95_162/0.28)] ring-4 ring-accent/25">
        <div
          className="relative w-full overflow-hidden rounded-[16px] bg-surface-2"
          style={{ aspectRatio: aspect }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Doodad({
  className,
  children,
  delay,
  reduce,
}: {
  className: string;
  children: React.ReactNode;
  delay: number;
  reduce: boolean | null;
}) {
  return (
    <motion.span
      aria-hidden
      className={`absolute z-20 drop-shadow-[0_3px_6px_rgb(255_95_162/0.35)] ${className}`}
      animate={reduce ? undefined : { y: [0, -7, 0], rotate: [-8, 8, -8] }}
      transition={
        reduce
          ? undefined
          : { duration: 3.6, delay, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {children}
    </motion.span>
  );
}

function VintageTitle() {
  return (
    <p className="font-display text-3xl text-ink sm:text-4xl">
      Step in, look alive
    </p>
  );
}

function PolaroidTitle() {
  return (
    <p className="font-display text-4xl text-ink sm:text-5xl">Hold still…</p>
  );
}

function PurikuraTitle() {
  return (
    <p className="flex items-center gap-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
      Say cheese
      <Heart weight="fill" size={26} className="text-accent" />
    </p>
  );
}

function Pill({
  children,
  onClick,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex h-11 items-center gap-1.5 rounded-vibe px-3 transition-transform active:scale-[0.95] ${
        active
          ? "bg-accent text-accent-ink"
          : "bg-surface text-ink ring-1 ring-line"
      }`}
    >
      {children}
    </button>
  );
}

/* ---- Countdown timer: a visible segmented control (Off / 3s / 5s) -------- */
function TimerSegment({
  value,
  onChange,
}: {
  value: CountdownSec;
  onChange: (s: CountdownSec) => void;
}) {
  const options: { v: CountdownSec; label: string }[] = [
    { v: 0, label: "Off" },
    { v: 3, label: "3s" },
    { v: 5, label: "5s" },
  ];
  return (
    <div
      role="group"
      aria-label="Countdown timer"
      className="inline-flex h-11 items-center gap-0.5 rounded-vibe bg-surface p-1 ring-1 ring-line"
    >
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            aria-pressed={active}
            aria-label={o.v === 0 ? "Countdown off" : `${o.v} second countdown`}
            className={`rounded-[calc(var(--radius)-2px)] px-2.5 py-1.5 font-num text-[11px] transition-colors ${
              active
                ? "bg-accent text-accent-ink"
                : "text-ink-dim hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

