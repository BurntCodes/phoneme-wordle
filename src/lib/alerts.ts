import type { DashboardAlert, DashboardStats } from "@/lib/dashboardTypes";

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
// and would raise a false alarm on a fresh install.
export function evaluateAlerts(
  stats: Pick<DashboardStats, "health" | "generation">,
  issues: DataIssues,
): DashboardAlert[] {
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

  if (total === 0) {
    alerts.push({
      severity: "info",
      code: "NO_GENERATION_ACTIVITY",
      message: "No activities have been generated yet.",
    });
  }

  return alerts;
}
