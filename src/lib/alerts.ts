import type { DashboardAlert } from "@/lib/dashboardTypes";

export interface AlertInputs {
  health: { database: "up" | "down" };
  generation: { total: number; failed: number; failedLast24h: number };
}

export interface DataIssues {
  emptyWordLists: string[];
  unplayableWordleActivities: string[];
}

const MIN_EVENTS_FOR_RATE_ALERT = 10;
const FAILURE_WARNING_RATE = 0.2;
const FAILURE_ERROR_RATE = 0.5;

function quotedList(names: string[]): string {
  return names.map((name) => `"${name}"`).join(", ");
}

// The rate alerts need a minimum sample: a single early failure is 100%
// and would raise a false alarm on a fresh install. With the database down a
// zero count means "unknown", not "unused", so the no-activity notice is withheld.
export function evaluateAlerts(stats: AlertInputs, issues: DataIssues): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  if (stats.health.database === "down") {
    alerts.push({ severity: "error", code: "DATABASE_DOWN", message: "The database is unreachable." });
  }

  const { total, failed } = stats.generation;
  if (total >= MIN_EVENTS_FOR_RATE_ALERT) {
    const failureRate = failed / total;
    if (failureRate >= FAILURE_WARNING_RATE) {
      const percent = Math.round(failureRate * 100);
      alerts.push({
        severity: failureRate >= FAILURE_ERROR_RATE ? "error" : "warning",
        code: "HIGH_FAILURE_RATE",
        message: `${percent}% of generation attempts have failed (${failed} of ${total}).`,
      });
    }
  }

  if (stats.generation.failedLast24h > 0) {
    const count = stats.generation.failedLast24h;
    alerts.push({
      severity: "warning",
      code: "RECENT_FAILURES",
      message: `${count} generation ${count === 1 ? "failure" : "failures"} in the last 24 hours.`,
    });
  }

  if (issues.emptyWordLists.length > 0) {
    alerts.push({
      severity: "warning",
      code: "EMPTY_WORD_LIST",
      message: `Word lists with no words: ${quotedList(issues.emptyWordLists)}.`,
    });
  }

  if (issues.unplayableWordleActivities.length > 0) {
    alerts.push({
      severity: "warning",
      code: "WORDLE_NO_MATCHING_WORDS",
      message: `Wordle activities with no word matching their phoneme count: ${quotedList(issues.unplayableWordleActivities)}.`,
    });
  }

  if (total === 0 && stats.health.database === "up") {
    alerts.push({
      severity: "info",
      code: "NO_GENERATION_ACTIVITY",
      message: "No activities have been generated yet.",
    });
  }

  return alerts;
}
