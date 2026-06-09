"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVibe } from "@/components/vibe-provider";
import { CameraBooth } from "@/components/booth/camera-booth";

export default function BoothPage() {
  const { vibe, ready } = useVibe();
  const router = useRouter();

  useEffect(() => {
    if (ready && !vibe) router.replace("/");
  }, [ready, vibe, router]);

  // Wait for localStorage read before deciding; avoids a redirect flash.
  if (!ready || !vibe) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-[#08090b]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
      </div>
    );
  }

  return <CameraBooth vibe={vibe} />;
}
