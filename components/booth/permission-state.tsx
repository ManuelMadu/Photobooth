"use client";

import { ArrowClockwise, WarningCircle, VideoCameraSlash } from "@phosphor-icons/react";
import type { CameraStatus } from "@/hooks/use-camera";

const COPY: Record<
  Exclude<CameraStatus, "ready" | "idle" | "requesting">,
  { title: string; body: string }
> = {
  denied: {
    title: "Camera access is blocked",
    body: "Tap the camera icon in your browser's address bar, allow access, then retry. On iOS, check Settings → Safari → Camera.",
  },
  notfound: {
    title: "No camera found",
    body: "This device doesn't seem to have a camera available. Try another device, or close apps that might be using it.",
  },
  inuse: {
    title: "Camera is in use",
    body: "Another app or tab is using the camera. Close it and retry.",
  },
  insecure: {
    title: "Secure connection required",
    body: "Cameras only work over HTTPS (or localhost). Open the booth on its secure address and retry.",
  },
  error: {
    title: "Something went wrong",
    body: "We couldn't start the camera. Retry, or reload the page.",
  },
};

export function PermissionState({
  status,
  onRetry,
}: {
  status: Exclude<CameraStatus, "ready">;
  onRetry: () => void;
}) {
  if (status === "requesting" || status === "idle") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
        <p className="font-num text-sm text-ink-dim">Starting camera…</p>
      </div>
    );
  }

  const copy = COPY[status];
  const Icon = status === "notfound" ? VideoCameraSlash : WarningCircle;

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-5 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-accent ring-1 ring-line">
        <Icon size={28} weight="duotone" />
      </span>
      <div>
        <h2 className="font-display text-xl text-ink">{copy.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-dim">{copy.body}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-vibe bg-accent px-5 py-2.5 font-num text-sm font-medium text-accent-ink transition-transform active:scale-[0.97]"
      >
        <ArrowClockwise size={16} weight="bold" />
        Retry
      </button>
    </div>
  );
}
