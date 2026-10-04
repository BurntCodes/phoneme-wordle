import type { ActivityTypeKey } from "@/lib/dashboardTypes";

const EMPTY = "—";

export function formatDuration(ms: number | null): string {
  if (ms === null) return EMPTY;
  if (ms < 1000) return `${ms} ms`;
  if (ms < 59_950) return `${(ms / 1000).toFixed(1)} s`;
  const totalSeconds = Math.round(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}m ${String(totalSeconds % 60).padStart(2, "0")}s`;
}

export function formatPercent(rate: number | null): string {
  return rate === null ? EMPTY : `${Math.round(rate * 100)}%`;
}

export function activityTypeLabel(type: ActivityTypeKey | null): string {
  if (type === null) return EMPTY;
  return type === "WORDLE" ? "Wordle" : "Word Search";
}
