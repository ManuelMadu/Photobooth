"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "notfound"
  | "inuse"
  | "insecure"
  | "error";

export type Facing = "user" | "environment";

/**
 * Wraps getUserMedia with the failure modes a live event actually hits:
 * permission denied, no camera, camera-in-use, insecure context. Cleans up
 * tracks on unmount and on every re-acquire (camera flip).
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [facing, setFacing] = useState<Facing>("user");
  const [hasMultiple, setHasMultiple] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(
    async (mode: Facing) => {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        // No secure context (camera requires HTTPS or localhost) or unsupported.
        setStatus(window.isSecureContext === false ? "insecure" : "notfound");
        return;
      }
      setStatus("requesting");
      stop();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          // Some browsers reject play() until the element is visible; ignore.
          await video.play().catch(() => {});
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        setHasMultiple(devices.filter((d) => d.kind === "videoinput").length > 1);
        setStatus("ready");
      } catch (err) {
        const name = (err as DOMException)?.name;
        if (name === "NotAllowedError" || name === "SecurityError") setStatus("denied");
        else if (name === "NotFoundError" || name === "OverconstrainedError")
          setStatus("notfound");
        else if (name === "NotReadableError" || name === "AbortError")
          setStatus("inuse");
        else setStatus("error");
      }
    },
    [stop],
  );

  useEffect(() => {
    start("user");
    return stop;
    // Run once on mount; flip/retry drive re-acquisition explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flip = useCallback(() => {
    setFacing((prev) => {
      const next: Facing = prev === "user" ? "environment" : "user";
      void start(next);
      return next;
    });
  }, [start]);

  const retry = useCallback(() => void start(facing), [start, facing]);

  return { videoRef, status, facing, hasMultiple, flip, retry, stop };
}
