// The four design languages the booth can wear.
// Each vibe is a token set bound at runtime via [data-vibe] in globals.css.
// This module is the single source of truth for vibe identity + copy.

export type VibeId = "cinematic" | "gallery" | "pop" | "glass";

export interface Vibe {
  id: VibeId;
  /** Display name on the picker card. */
  name: string;
  /** One-line attitude, shown under the name. */
  tagline: string;
  /** Short blurb on the picker card. */
  blurb: string;
  /** Word stamped on the picker mini-mock so the type personality reads. */
  sample: string;
  /** Color of the capture flash for this vibe. */
  flash: string;
}

export const VIBES: Vibe[] = [
  {
    id: "cinematic",
    name: "Cinematic",
    tagline: "Pro camera HUD",
    blurb: "Near-black, mono readouts, focus brackets. Feels like a film-set monitor.",
    sample: "REC",
    flash: "#fff7e6",
  },
  {
    id: "gallery",
    name: "Gallery",
    tagline: "Print-studio calm",
    blurb: "Warm paper, big grotesk type, your shot framed like an artwork.",
    sample: "Studio",
    flash: "#ffffff",
  },
  {
    id: "pop",
    name: "Pop",
    tagline: "Loud and playful",
    blurb: "Chunky type, hot rose accent, a little grain. Party energy, done right.",
    sample: "CHEESE",
    flash: "#ffe3ee",
  },
  {
    id: "glass",
    name: "Glass",
    tagline: "Frosted & full-bleed",
    blurb: "Your face fills the screen; controls float as frosted glass pods.",
    sample: "live",
    flash: "#ffffff",
  },
];

export const VIBE_IDS = VIBES.map((v) => v.id) as VibeId[];

export const DEFAULT_VIBE: VibeId = "cinematic";

export function getVibe(id: VibeId): Vibe {
  return VIBES.find((v) => v.id === id) ?? VIBES[0];
}

export function isVibeId(value: unknown): value is VibeId {
  return typeof value === "string" && (VIBE_IDS as string[]).includes(value);
}
