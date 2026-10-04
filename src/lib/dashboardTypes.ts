export type ActivityTypeKey = "WORDLE" | "WORD_SEARCH";

export type AlertSeverity = "error" | "warning" | "info";

export interface DashboardAlert {
  severity: AlertSeverity;
  code: string;
  message: string;
}

export interface GenerationCounts {
  successful: number;
  failed: number;
}

export interface RecentFailure {
  activityType: ActivityTypeKey;
  failureReason: string | null;
  createdAt: string;
}

export interface DashboardStats {
  health: { status: "ok" | "error"; database: "up" | "down" };
  totals: {
    wordLists: number;
    words: number;
    phonemes: number;
    activities: number;
    activitiesByType: Record<ActivityTypeKey, number>;
  };
  generation: {
    total: number;
    successful: number;
    failed: number;
    successRate: number | null;
    byType: Record<ActivityTypeKey, GenerationCounts>;
  };
  pageViews: {
    total: number;
    averageDurationMs: number | null;
  };
  mostUsedActivityType: ActivityTypeKey | null;
  recentFailures: RecentFailure[];
  alerts: DashboardAlert[];
}

export interface DashboardUnavailable {
  health: { status: "error"; database: "down"; message?: string };
  alerts: DashboardAlert[];
}

export type DashboardResult =
  | { available: true; stats: DashboardStats }
  | { available: false; unavailable: DashboardUnavailable };
