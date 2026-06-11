// Canvas-side frame compositing. The React VintageFrame / PurikuraFrame draw
// the *live* preview chrome; this draws the same identity into the exported
// pixels so the saved JPG is a real framed print, not a bare crop.
//
// Colors mirror the vibe tokens in globals.css (canvas can't read CSS vars
// without fragile getComputedStyle hacks). The doodad hexes match the ones the
// React frames hardcode. Fonts ARE read from the DOM, since next/font generates
// hashed family names that aren't knowable as literals.

import type { VibeId } from "./vibes";

const JPEG_QUALITY = 0.92;

/**
 * Composite the vibe frame around an already-cropped photo canvas and return a
 * JPEG data URL. The output aspect differs from the photo (the frame adds
 * padding + caption / doodad margin), so callers should display it at its
 * natural size rather than re-cropping it.
 */
export function frameToDataURL(
  photo: HTMLCanvasElement,
  vibe: VibeId,
  caption?: string,
): string {
  if (vibe === "purikura") return purikura(photo);
  if (vibe === "polaroid") return polaroid(photo, caption);
  return vintage(photo, caption);
}

/* ---- Vintage: paper print with a typewriter caption strip ---------------- */
function vintage(photo: HTMLCanvasElement, caption?: string): string {
  const iw = photo.width;
  const ih = photo.height;
  const pad = Math.round(iw * 0.055);
  const captionH = Math.round(iw * 0.13);
  const w = iw + pad * 2;
  const h = ih + pad * 2 + captionH;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return photo.toDataURL("image/jpeg", JPEG_QUALITY);

  // Aged paper with a faint top light-leak and a soft red wash at the corner,
  // echoing .vibe-paper.
  ctx.fillStyle = "#f7f0e1";
  ctx.fillRect(0, 0, w, h);
  radialBloom(ctx, w * 0.5, -h * 0.1, Math.max(w, h) * 0.7, "rgba(255,250,235,0.6)");
  radialBloom(ctx, w * 1.05, h * 1.05, Math.max(w, h) * 0.6, "rgba(155,34,38,0.06)");

  // Photo + hairline edge.
  ctx.drawImage(photo, pad, pad, iw, ih);
  ctx.strokeStyle = "rgba(43,32,24,0.18)";
  ctx.lineWidth = Math.max(1, Math.round(iw * 0.003));
  ctx.strokeRect(pad + 0.5, pad + 0.5, iw - 1, ih - 1);

  // Caption strip: right-aligned stars are a fixed flourish; the left label is
  // the user's caption, falling back to the booth's name when left blank.
  const fs = Math.round(iw * 0.032);
  const cy = ih + pad + captionH / 2 + pad * 0.15;
  ctx.fillStyle = "#7a6a55";
  ctx.font = `${fs}px ${resolveFontFamily("vintage", "--font-num")}`;
  ctx.textBaseline = "middle";
  setLetterSpacing(ctx, Math.round(fs * 0.2));

  const stars = "★ ★ ★";
  ctx.textAlign = "right";
  ctx.fillText(stars, w - pad, cy);

  const label = ((caption ?? "").trim() || "PHOTO BOOTH").toUpperCase();
  const maxLabel = w - pad * 2 - ctx.measureText(stars).width - fs; // keep a gap
  ctx.textAlign = "left";
  ctx.fillText(fitText(ctx, label, maxLabel), pad, cy);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

/* ---- Polaroid: bright white film border with a handwritten caption ------- */
function polaroid(photo: HTMLCanvasElement, caption?: string): string {
  const iw = photo.width;
  const ih = photo.height;
  const side = Math.round(iw * 0.068);
  const top = side;
  const bottom = Math.round(iw * 0.25); // the thick scrawl-on-me bottom border
  const w = iw + side * 2;
  const h = ih + top + bottom;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return photo.toDataURL("image/jpeg", JPEG_QUALITY);

  // Bright film white with a faint top sheen and a soft warmth pooling at the
  // bottom, so the flat white reads as a physical print.
  ctx.fillStyle = "#fdfdfb";
  ctx.fillRect(0, 0, w, h);
  radialBloom(ctx, w * 0.5, -h * 0.05, Math.max(w, h) * 0.6, "rgba(255,255,255,0.7)");
  radialBloom(ctx, w * 0.5, h * 1.04, Math.max(w, h) * 0.45, "rgba(20,22,24,0.05)");

  // Photo, dropped slightly into the window with a soft shadow line.
  ctx.save();
  ctx.shadowColor = "rgba(20,22,24,0.3)";
  ctx.shadowBlur = Math.round(iw * 0.02);
  ctx.shadowOffsetY = Math.round(iw * 0.007);
  ctx.fillStyle = "#000";
  ctx.fillRect(side, top, iw, ih);
  ctx.restore();
  ctx.drawImage(photo, side, top, iw, ih);
  ctx.strokeStyle = "rgba(20,22,24,0.12)";
  ctx.lineWidth = Math.max(1, Math.round(iw * 0.003));
  ctx.strokeRect(side + 0.5, top + 0.5, iw - 1, ih - 1);

  // Handwritten caption in the bottom border. Optional — left blank, the white
  // film border stays clean, ready to be written on.
  const text = (caption ?? "").trim();
  if (text) {
    const fs = Math.round(iw * 0.085);
    ctx.fillStyle = "#3a3b3d";
    ctx.font = `400 ${fs}px ${resolveFontFamily("polaroid", "--font-display")}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setLetterSpacing(ctx, 0);
    ctx.save();
    ctx.translate(w / 2, top + ih + bottom / 2 + fs * 0.04);
    ctx.rotate(-0.02); // a touch off-level, like a real scrawl
    ctx.fillText(fitText(ctx, text, w - side * 2), 0, 0);
    ctx.restore();
  }

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

/** Trim a caption with an ellipsis so it never spills past the border width. */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) {
    t = t.slice(0, -1);
  }
  return `${t.trimEnd()}…`;
}

/* ---- Purikura: candy card ringed with floating sticker doodads ----------- */
function purikura(photo: HTMLCanvasElement): string {
  const iw = photo.width;
  const ih = photo.height;
  const cardPad = Math.round(iw * 0.045);
  const margin = Math.round(iw * 0.11); // room for the doodads around the card
  const ring = Math.round(iw * 0.022);
  const cardW = iw + cardPad * 2;
  const cardH = ih + cardPad * 2;
  const w = cardW + margin * 2;
  const h = cardH + margin * 2;
  const cardX = margin;
  const cardY = margin;
  const cardR = Math.round(iw * 0.06);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return photo.toDataURL("image/jpeg", JPEG_QUALITY);

  // Candy gradient sky with pink / mint / lilac blooms, echoing .vibe-candy.
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#fff0f6");
  sky.addColorStop(1, "#fdeaf3");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  radialBloom(ctx, w * 0.15, h * 0.08, Math.max(w, h) * 0.55, "rgba(255,175,204,0.5)");
  radialBloom(ctx, w * 0.9, h * 0.14, Math.max(w, h) * 0.5, "rgba(178,235,242,0.45)");
  radialBloom(ctx, w * 0.72, h * 1.02, Math.max(w, h) * 0.55, "rgba(216,191,255,0.4)");

  // White card with a soft drop shadow.
  ctx.save();
  ctx.shadowColor = "rgba(255,95,162,0.28)";
  ctx.shadowBlur = Math.round(iw * 0.06);
  ctx.shadowOffsetY = Math.round(iw * 0.03);
  roundRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  // Accent ring just inside the card edge.
  ctx.lineWidth = ring;
  ctx.strokeStyle = "rgba(255,95,162,0.25)";
  roundRectPath(ctx, cardX + ring / 2, cardY + ring / 2, cardW - ring, cardH - ring, cardR - ring / 2);
  ctx.stroke();

  // Photo, clipped to a rounded rect.
  const photoR = Math.round(iw * 0.045);
  ctx.save();
  roundRectPath(ctx, cardX + cardPad, cardY + cardPad, iw, ih, photoR);
  ctx.clip();
  ctx.drawImage(photo, cardX + cardPad, cardY + cardPad, iw, ih);
  ctx.restore();

  // Floating doodads at the card corners (positions mirror PurikuraFrame).
  const u = iw;
  doodad(ctx, () => heartPath(ctx, cardX, cardY, u * 0.13), "#ff5fa2");
  doodad(ctx, () => starPath(ctx, cardX + cardW, cardY, u * 0.06, 5), "#7cd6d6");
  doodad(ctx, () => sparklePath(ctx, cardX, cardY + cardH, u * 0.075), "#b794f6");
  doodad(ctx, () => starPath(ctx, cardX + cardW, cardY + cardH, u * 0.05, 5), "#ff5fa2");

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

/* ---- canvas helpers ------------------------------------------------------ */

function radialBloom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function doodad(
  ctx: CanvasRenderingContext2D,
  path: () => void,
  color: string,
) {
  const scale = ctx.canvas.width / 600;
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = "rgba(255,95,162,0.35)";
  ctx.shadowBlur = 8 * scale;
  ctx.shadowOffsetY = 3 * scale;
  path();
  ctx.fill();
  ctx.restore();
}

function heartPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
) {
  const k = size / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + k * 0.75);
  ctx.bezierCurveTo(cx + k, cy + k * 0.1, cx + k, cy - k * 0.7, cx, cy - k * 0.25);
  ctx.bezierCurveTo(cx - k, cy - k * 0.7, cx - k, cy + k * 0.1, cx, cy + k * 0.75);
  ctx.closePath();
}

function starPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outer: number,
  points: number,
) {
  const inner = outer * (points === 4 ? 0.3 : 0.42);
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function sparklePath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outer: number,
) {
  starPath(ctx, cx, cy, outer, 4);
}

// next/font emits hashed family names exposed only via CSS vars, so read the
// resolved font-family off a throwaway element scoped to the vibe.
function resolveFontFamily(vibe: VibeId, cssVar: string): string {
  const fallback = "ui-monospace, monospace";
  if (typeof document === "undefined") return fallback;
  const el = document.createElement("span");
  el.setAttribute("data-vibe", vibe);
  el.style.cssText = `position:absolute;visibility:hidden;font-family:var(${cssVar})`;
  document.body.appendChild(el);
  const family = getComputedStyle(el).fontFamily;
  el.remove();
  return family || fallback;
}

// letterSpacing on the 2D context is well-supported but still untyped in some
// lib.dom versions; set it defensively.
function setLetterSpacing(ctx: CanvasRenderingContext2D, px: number) {
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      `${px}px`;
  } catch {
    /* unsupported; render without tracking */
  }
}
