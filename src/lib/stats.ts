import { db } from "@/lib/db";
import type { ActivityTypeKey, DashboardStats, GenerationCounts, RecentFailure } from "@/lib/dashboardTypes";

const RECENT_FAILURE_LIMIT = 5;

const ACTIVITY_TYPES: ActivityTypeKey[] = ["WORDLE", "WORD_SEARCH"];

function emptyByType<T>(make: () => T): Record<ActivityTypeKey, T> {
  return { WORDLE: make(), WORD_SEARCH: make() };
}

export type StoredStats = Omit<DashboardStats, "health" | "alerts">;

export async function loadStoredStats(): Promise<StoredStats> {
  const [wordLists, words, phonemes, activityGroups, generationGroups, pageViewAgg, failureRows] =
    await Promise.all([
      db.wordList.count(),
      db.word.count(),
      db.phoneme.count(),
      db.activity.groupBy({ by: ["type"], _count: { _all: true } }),
      db.generationEvent.groupBy({ by: ["activityType", "success"], _count: { _all: true } }),
      db.pageView.aggregate({ _count: { _all: true }, _avg: { durationMs: true } }),
      db.generationEvent.findMany({
        where: { success: false },
        orderBy: { createdAt: "desc" },
        take: RECENT_FAILURE_LIMIT,
        select: { activityType: true, failureReason: true, createdAt: true },
      }),
    ]);

  const activitiesByType = emptyByType(() => 0);
  for (const group of activityGroups) activitiesByType[group.type] = group._count._all;

  const byType = emptyByType<GenerationCounts>(() => ({ successful: 0, failed: 0 }));
  for (const group of generationGroups) {
    byType[group.activityType][group.success ? "successful" : "failed"] = group._count._all;
  }

  const successful = ACTIVITY_TYPES.reduce((sum, t) => sum + byType[t].successful, 0);
  const failed = ACTIVITY_TYPES.reduce((sum, t) => sum + byType[t].failed, 0);
  const total = successful + failed;

  const usage = ACTIVITY_TYPES.map((type) => ({ type, count: byType[type].successful + byType[type].failed }));
  // Array.sort is stable, so a tie resolves to the earlier type and the
  // field is only null when there is no usage at all.
  const [top] = [...usage].sort((a, b) => b.count - a.count);
  const mostUsedActivityType = top.count > 0 ? top.type : null;

  const recentFailures: RecentFailure[] = failureRows.map((row) => ({
    activityType: row.activityType,
    failureReason: row.failureReason,
    createdAt: row.createdAt.toISOString(),
  }));

  return {
    totals: {
      wordLists,
      words,
      phonemes,
      activities: activitiesByType.WORDLE + activitiesByType.WORD_SEARCH,
      activitiesByType,
    },
    generation: { total, successful, failed, successRate: total > 0 ? successful / total : null, byType },
    pageViews: {
      total: pageViewAgg._count._all,
      averageDurationMs: pageViewAgg._avg.durationMs === null ? null : Math.round(pageViewAgg._avg.durationMs),
    },
    mostUsedActivityType,
    recentFailures,
  };
}
