"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { isVibeId, type VibeId } from "@/lib/vibes";

const STORAGE_KEY = "booth.vibe";

interface VibeContextValue {
  /** The chosen vibe, or null before the guest has picked one. */
  vibe: VibeId | null;
  /** True once localStorage has been read on the client (avoids SSR flash). */
  ready: boolean;
  setVibe: (vibe: VibeId) => void;
  clearVibe: () => void;
}

const VibeContext = createContext<VibeContextValue | null>(null);

export function VibeProvider({ children }: { children: React.ReactNode }) {
  const [vibe, setVibeState] = useState<VibeId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydration-safe read of the persisted choice from an external store
    // (localStorage), then flag ready so consumers can act.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isVibeId(stored)) setVibeState(stored);
    } catch {
      // localStorage can throw in private mode; non-fatal.
    }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const setVibe = (next: VibeId) => {
    setVibeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* non-fatal */
    }
  };

  const clearVibe = () => {
    setVibeState(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* non-fatal */
    }
  };

  return (
    <VibeContext.Provider value={{ vibe, ready, setVibe, clearVibe }}>
      {children}
    </VibeContext.Provider>
  );
}

export function useVibe(): VibeContextValue {
  const ctx = useContext(VibeContext);
  if (!ctx) throw new Error("useVibe must be used within a VibeProvider");
  return ctx;
}
