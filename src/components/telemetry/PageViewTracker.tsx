"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const MIN_VIEW_MS = 500;

function activityTypeFor(path: string): "WORDLE" | "WORD_SEARCH" | null {
  if (path.startsWith("/wordle")) return "WORDLE";
  if (path.startsWith("/word-search")) return "WORD_SEARCH";
  return null;
}

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let visibleSince: number | null = document.visibilityState === "visible" ? performance.now() : null;
    let accumulatedMs = 0;

    function pause() {
      if (visibleSince === null) return;
      accumulatedMs += performance.now() - visibleSince;
      visibleSince = null;
    }

    // Sub-threshold views are dropped so dev double-mounts and instant
    // bounces don't drag the average toward zero.
    function flush() {
      pause();
      const durationMs = accumulatedMs;
      accumulatedMs = 0;
      if (durationMs < MIN_VIEW_MS) return;
      fetch("/api/telemetry/page-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname, activityType: activityTypeFor(pathname), durationMs }),
        keepalive: true,
      }).catch(() => {});
    }

    // Mobile browsers often fire only visibilitychange (not pagehide) when a
    // tab is closed or backgrounded, so hidden is the reliable moment to send.
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") flush();
      else visibleSince = performance.now();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [pathname]);

  return null;
}
