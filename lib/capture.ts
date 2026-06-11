// Canvas capture + export helpers. The live selfie preview is mirrored for
// comfort, so we mirror the front-camera capture to match it — what you see is
// what you get. The back camera is captured as-is.

export type Ratio = "1:1" | "4:3";

/** width / height for a given ratio in portrait-friendly booth orientation. */
export function ratioValue(ratio: Ratio): number {
  return ratio === "1:1" ? 1 : 4 / 3;
}

/**
 * Grab the current video frame, center-cropped to the target ratio, and return
 * it as a canvas (so callers can composite a frame onto it before export).
 * Pass `mirror` to flip horizontally (front camera) so the saved photo matches
 * the mirrored live preview. Returns null if the video has no frame yet.
 */
export function cropFrame(
  video: HTMLVideoElement,
  ratio: Ratio,
  mirror = false,
): HTMLCanvasElement | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const target = ratioValue(ratio);
  const sourceAr = vw / vh;

  let cw = vw;
  let ch = vh;
  if (sourceAr > target) {
    cw = vh * target;
    ch = vh;
  } else {
    cw = vw;
    ch = vw / target;
  }
  const sx = (vw - cw) / 2;
  const sy = (vh - ch) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(cw);
  canvas.height = Math.round(ch);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, sx, sy, cw, ch, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Trigger a browser download for a data-URL image. Returns false if the browser
 * refused the synthetic click so callers can offer a manual save fallback
 * (notably iOS Safari, which ignores the `download` attribute).
 */
export function downloadImage(dataUrl: string, filename: string): boolean {
  try {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch {
    return false;
  }
}

/** booth-YYYYMMDD-HHMMSS.jpg */
export function photoFilename(prefix = "booth"): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(
    d.getHours(),
  )}${p(d.getMinutes())}${p(d.getSeconds())}`;
  return `${prefix}-${stamp}.jpg`;
}

/** Short shutter click via WebAudio. No asset needed; safe to call freely. */
export function playShutter() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
    osc.onended = () => ctx.close();
  } catch {
    /* audio unavailable; non-fatal */
  }
}
