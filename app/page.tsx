"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Aperture } from "@phosphor-icons/react";
import { VIBES, type VibeId } from "@/lib/vibes";
import { useVibe } from "@/components/vibe-provider";

export default function WelcomePage() {
  const router = useRouter();
  const { setVibe } = useVibe();
  const reduce = useReducedMotion();

  function choose(id: VibeId) {
    setVibe(id);
    router.push("/booth");
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#08090b] px-5 py-12 text-white sm:px-8 sm:py-16">
      {/* faint neutral glow, no AI-purple */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(50% 40% at 15% 0%, rgb(255 255 255 / 0.06), transparent 60%), radial-gradient(45% 45% at 100% 100%, rgb(255 255 255 / 0.05), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <header className="max-w-2xl">
          <div className="flex items-center gap-2 text-white/55">
            <Aperture size={18} weight="duotone" />
            <span className="font-mono text-xs uppercase tracking-[0.3em]">
              Booth
            </span>
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Pick your booth.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            One photobooth, four personalities. Choose a look and start shooting.
            You can switch it any time.
          </p>
        </header>

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2">
          {VIBES.map((v, i) => (
            <motion.li
              key={v.id}
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                onClick={() => choose(v.id)}
                data-vibe={v.id}
                className="group relative block w-full overflow-hidden rounded-2xl bg-bg text-left ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgb(0_0_0_/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <div className="flex flex-col gap-5 p-5 sm:p-6">
                  <VibeMock id={v.id} sample={v.sample} />
                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="font-display text-2xl text-ink">{v.name}</h2>
                      <span className="font-num text-[11px] uppercase tracking-[0.18em] text-ink-dim">
                        {v.tagline}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                      {v.blurb}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 font-num text-sm text-accent">
                    Use this look
                    <ArrowRight
                      size={16}
                      weight="bold"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </main>
  );
}

/* A small, vibe-true preview rendered inside each picker card. The data-vibe
   wrapper on the card already binds the tokens; this just stages each vibe's
   signature flourish. */
function VibeMock({ id, sample }: { id: VibeId; sample: string }) {
  if (id === "glass") {
    return (
      <div className="vibe-aurora relative aspect-[5/3] overflow-hidden rounded-vibe">
        <div className="vibe-glass absolute inset-x-3 bottom-3 flex h-10 items-center gap-2 rounded-full px-3">
          <span className="h-5 w-5 rounded-full bg-white shadow" />
          <span className="font-num text-xs text-white/85">{sample}</span>
        </div>
      </div>
    );
  }

  if (id === "gallery") {
    return (
      <div className="aspect-[5/3] rounded-vibe bg-surface-2 p-3">
        <div className="flex h-full w-full items-center justify-center border border-line bg-surface">
          <span className="font-display text-3xl text-ink">{sample}</span>
        </div>
      </div>
    );
  }

  if (id === "pop") {
    return (
      <div className="relative flex aspect-[5/3] items-center justify-center overflow-hidden rounded-vibe bg-surface">
        <span className="font-display text-3xl font-extrabold tracking-tight text-ink">
          {sample}.
        </span>
        <span className="absolute bottom-3 right-3 h-6 w-6 rounded-full bg-accent" />
      </div>
    );
  }

  // cinematic: focus brackets + REC dot + mono readout
  return (
    <div className="relative aspect-[5/3] overflow-hidden rounded-vibe border border-line bg-surface">
      <Bracket className="left-2 top-2 border-l border-t" />
      <Bracket className="right-2 top-2 border-r border-t" />
      <Bracket className="bottom-6 left-2 border-b border-l" />
      <Bracket className="bottom-6 right-2 border-b border-r" />
      <div className="absolute left-3 top-2.5 flex items-center gap-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        <span className="font-num text-[10px] tracking-widest text-ink">{sample}</span>
      </div>
      <div className="absolute inset-x-3 bottom-2 font-num text-[10px] tracking-widest text-ink-dim">
        1:1 · FRONT · READY
      </div>
    </div>
  );
}

function Bracket({ className }: { className: string }) {
  return (
    <span aria-hidden className={`absolute h-4 w-4 border-accent ${className}`} />
  );
}
