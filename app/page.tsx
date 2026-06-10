"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Aperture, Heart, Star } from "@phosphor-icons/react";
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
  if (id === "purikura") {
    return (
      <div className="relative grid aspect-[5/3] place-items-center overflow-hidden rounded-vibe bg-surface ring-2 ring-accent/30">
        <span className="font-display text-3xl font-semibold text-ink">
          {sample}
        </span>
        <Heart
          weight="fill"
          size={18}
          className="absolute right-3 top-3 text-accent"
        />
        <Star
          weight="fill"
          size={16}
          className="absolute bottom-3 left-3 text-[#7cd6d6]"
        />
        <Star
          weight="fill"
          size={12}
          className="absolute right-5 bottom-4 text-[#b794f6]"
        />
      </div>
    );
  }

  // vintage: a framed paper print with a typewriter caption strip
  return (
    <div className="aspect-[5/3] rounded-vibe bg-surface p-2.5 pb-6 ring-1 ring-line shadow-[0_14px_40px_rgb(43_32_24/0.18)]">
      <div className="relative flex h-full w-full items-center justify-center rounded-[2px] bg-surface-2">
        <span className="font-display text-3xl text-ink">{sample}</span>
        <span className="absolute -bottom-5 left-1 font-num text-[10px] uppercase tracking-[0.2em] text-ink-dim">
          Photo Booth
        </span>
      </div>
    </div>
  );
}
