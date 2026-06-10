// The design languages the booth can wear.
// Each vibe is a token set bound at runtime via [data-vibe] in globals.css.
// This module is the single source of truth for vibe identity + copy.
//
// We're intentionally running a small, opinionated set (two for now) rather
// than a wide menu of mild variations. More can be added later by appending a
// VibeId, a VIBES entry, and a [data-vibe] token block.

export type VibeId = "vintage" | "purikura";

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
    id: "vintage",
    name: "Vintage",
    tagline: "Analog photo strip",
    blurb:
      "Warm paper, sepia ink, curtain-red. Your shot framed like a classic booth print.",
    sample: "1952",
    flash: "#fdf0d5",
  },
  {
    id: "purikura",
    name: "Purikura",
    tagline: "Sticker-booth cute",
    blurb:
      "Candy pastels, bubbly type, hearts and sparkles. Tokyo arcade energy, maximum fun.",
    sample: "cheese",
    flash: "#ffffff",
  },
];

export const VIBE_IDS = VIBES.map((v) => v.id) as VibeId[];

export const DEFAULT_VIBE: VibeId = "vintage";

export function getVibe(id: VibeId): Vibe {
  return VIBES.find((v) => v.id === id) ?? VIBES[0];
}

export function isVibeId(value: unknown): value is VibeId {
  return typeof value === "string" && (VIBE_IDS as string[]).includes(value);
}
