"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowsClockwise,
  SpeakerSimpleHigh,
  SpeakerSimpleX,
  Lightning,
  LightningSlash,
  Timer,
} from "@phosphor-icons/react";
import { useCamera } from "@/hooks/use-camera";
import {
  captureFrame,
  downloadImage,
  photoFilename,
  playShutter,
  type Ratio,
} from "@/lib/capture";
import { useVibe } from "@/components/vibe-provider";
import { getVibe, VIBES, type VibeId } from "@/lib/vibes";
import { PermissionState } from "./permission-state";
import { Countdown } from "./countdown";
import { Review } from "./review";

type Phase = "live" | "counting" | "review";
type CountdownSec = 0 | 3 | 5;

export function CameraBooth({ vibe }: { vibe: VibeId }) {
  const router = useRouter();
  const { setVibe } = useVibe();
  const { videoRef, status, facing, hasMultiple, flip, retry } = useCamera();

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
    const data = video ? captureFrame(video, ratio) : "";
    if (!data) {
      setPhase("live");
      return;
    }
    setPhoto(data);
    schedule(() => setPhase("review"), flashOn ? 150 : 0);
  }, [clearTimers, schedule, flashOn, sound, ratio, videoRef]);

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

  const keep = useCallback(() => {
    if (photo) downloadImage(photo, photoFilename());
    retake();
  }, [photo, retake]);

  // keyboard: space/enter captures while live
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "Enter") && phase === "live") {
        e.preventDefault();
        capture();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [capture, phase]);

  const meta = getVibe(vibe);
  const aspect = ratio === "1:1" ? "1 / 1" : "4 / 3";
  const isGlass = vibe === "glass";
  const cycleCountdown = () =>
    setCountdownSec((c) => (c === 0 ? 3 : c === 3 ? 5 : 0));

  const stageInner = (
    <>
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`h-full w-full object-cover ${facing === "user" ? "mirror" : ""} ${
          status === "ready" ? "opacity-100" : "opacity-0"
        } transition-opacity duration-500`}
      />

      {/* cinematic focus brackets + readout */}
      {vibe === "cinematic" && status === "ready" && phase !== "review" && (
        <>
          <Bracket className="left-3 top-3 border-l-2 border-t-2" />
          <Bracket className="right-3 top-3 border-r-2 border-t-2" />
          <Bracket className="bottom-3 left-3 border-b-2 border-l-2" />
          <Bracket className="bottom-3 right-3 border-b-2 border-r-2" />
          <div className="absolute left-4 top-4 flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            <span className="font-num text-[11px] tracking-widest text-white/90">
              REC
            </span>
          </div>
          <div className="absolute inset-x-4 bottom-3 flex justify-between font-num text-[11px] tracking-widest text-white/70">
            <span>{ratio}</span>
            <span>{facing === "user" ? "FRONT" : "BACK"}</span>
            <span>READY</span>
          </div>
        </>
      )}

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
      className={`relative flex min-h-[100dvh] flex-col bg-bg text-ink ${
        vibe === "pop" ? "vibe-grain" : ""
      } ${isGlass ? "vibe-aurora" : ""}`}
    >
      {/* ---- Top bar ---- */}
      <header
        className={`relative z-20 flex items-center justify-between gap-3 px-4 py-3 sm:px-6 ${
          isGlass ? "" : "border-b border-line"
        }`}
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          className={`inline-flex items-center gap-2 rounded-vibe px-3 py-2 font-num text-sm text-ink transition-transform active:scale-[0.97] ${
            isGlass ? "vibe-glass" : "bg-surface ring-1 ring-line"
          }`}
        >
          <ArrowLeft size={16} weight="bold" />
          <span className="hidden sm:inline">Change look</span>
        </button>

        <VibeSwitch current={vibe} onPick={setVibe} glass={isGlass} />
      </header>

      {/* ---- Stage ---- */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6">
        {phase === "review" && photo ? (
          <Review src={photo} ratio={ratio} onRetake={retake} onKeep={keep} />
        ) : isGlass ? (
          // full-bleed video lives behind everything for glass
          <div className="flex w-full flex-1 items-center justify-center">
            <div className="fixed inset-0 -z-10">
              {stageInner}
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-5">
            {vibe === "gallery" && (
              <p className="font-display text-3xl text-ink sm:text-4xl">The Studio</p>
            )}
            {vibe === "pop" && (
              <p className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Say cheese.
              </p>
            )}
            <div
              className={`relative w-full max-w-[min(72vh,540px)] overflow-hidden rounded-vibe ${
                vibe === "gallery"
                  ? "bg-surface-2 p-3 ring-1 ring-line"
                  : "bg-surface ring-1 ring-line"
              }`}
            >
              <div
                className="relative w-full overflow-hidden rounded-[calc(var(--radius)-2px)]"
                style={{ aspectRatio: aspect }}
              >
                {stageInner}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ---- Controls ---- */}
      {phase !== "review" && (
        <footer
          className={`relative z-20 px-4 pb-6 pt-3 sm:px-6 ${
            isGlass ? "pointer-events-none" : ""
          }`}
        >
          <div
            className={`mx-auto flex max-w-2xl items-center justify-between gap-3 ${
              isGlass
                ? "vibe-glass pointer-events-auto rounded-full px-3 py-3"
                : ""
            }`}
          >
            {/* left settings cluster */}
            <div className="flex items-center gap-2">
              <Pill onClick={() => setRatio((r) => (r === "1:1" ? "4:3" : "1:1"))} glass={isGlass} label={ratio}>
                <span className="font-num text-xs">{ratio}</span>
              </Pill>
              <Pill
                onClick={cycleCountdown}
                glass={isGlass}
                active={countdownSec !== 0}
                label="Countdown"
              >
                <Timer size={18} weight="bold" />
                <span className="font-num text-xs">
                  {countdownSec === 0 ? "Off" : `${countdownSec}s`}
                </span>
              </Pill>
            </div>

            {/* shutter */}
            <button
              type="button"
              onClick={capture}
              disabled={status !== "ready" || phase !== "live"}
              aria-label="Take photo"
              className="group relative grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full ring-2 ring-accent transition-transform active:scale-95 disabled:opacity-40 sm:h-[76px] sm:w-[76px]"
            >
              <span className="h-[52px] w-[52px] rounded-full bg-accent transition-transform duration-150 group-active:scale-90 sm:h-[58px] sm:w-[58px]" />
            </button>

            {/* right cluster */}
            <div className="flex items-center gap-2">
              <Pill onClick={() => setFlashOn((f) => !f)} glass={isGlass} active={flashOn} label="Flash">
                {flashOn ? <Lightning size={18} weight="fill" /> : <LightningSlash size={18} weight="bold" />}
              </Pill>
              <Pill onClick={() => setSound((s) => !s)} glass={isGlass} active={sound} label="Sound">
                {sound ? <SpeakerSimpleHigh size={18} weight="bold" /> : <SpeakerSimpleX size={18} weight="bold" />}
              </Pill>
              {hasMultiple && (
                <Pill onClick={flip} glass={isGlass} label="Flip camera">
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

function Bracket({ className }: { className: string }) {
  return <span aria-hidden className={`absolute z-30 h-7 w-7 border-accent ${className}`} />;
}

function Pill({
  children,
  onClick,
  glass,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  glass?: boolean;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex h-11 items-center gap-1.5 rounded-vibe px-3 text-ink transition-transform active:scale-[0.95] ${
        active
          ? "bg-accent text-accent-ink"
          : glass
            ? "vibe-glass"
            : "bg-surface ring-1 ring-line"
      }`}
    >
      {children}
    </button>
  );
}

function VibeSwitch({
  current,
  onPick,
  glass,
}: {
  current: VibeId;
  onPick: (v: VibeId) => void;
  glass?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1 rounded-full p-1 ${
        glass ? "vibe-glass" : "bg-surface ring-1 ring-line"
      }`}
      role="group"
      aria-label="Switch booth look"
    >
      {VIBES.map((v) => {
        const isCurrent = v.id === current;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onPick(v.id)}
            aria-pressed={isCurrent}
            className={`rounded-full px-2.5 py-1.5 font-num text-[11px] tracking-wide transition-colors sm:px-3 ${
              isCurrent ? "bg-accent text-accent-ink" : "text-ink-dim hover:text-ink"
            }`}
          >
            {v.name}
          </button>
        );
      })}
    </div>
  );
}
