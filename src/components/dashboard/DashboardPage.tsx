"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  fetchAllActivities,
  fetchDashboardStats,
  fetchWordLists,
  type ApiActivity,
  type ApiWordListSummary,
} from "@/lib/api/client";
import type { DashboardResult, DashboardStats } from "@/lib/dashboardTypes";
import { activityTypeLabel, formatDuration, formatPercent } from "@/lib/format";
import AlertList from "./AlertList";
import GenerationBreakdown from "./GenerationBreakdown";
import HealthIndicator from "./HealthIndicator";
import RecentFailuresTable from "./RecentFailuresTable";
import StatTile from "./StatTile";
import StoredContentSummary from "./StoredContentSummary";

const REFRESH_INTERVAL_MS = 10_000;

interface StoredContent {
  wordLists: ApiWordListSummary[];
  activities: ApiActivity[];
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h3 id={id} className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      {children}
    </section>
  );
}

function KeyMetrics({ stats }: { stats: DashboardStats }) {
  const { generation, totals, pageViews, mostUsedActivityType } = stats;
  const mostUsedCount = mostUsedActivityType
    ? generation.byType[mostUsedActivityType].successful + generation.byType[mostUsedActivityType].failed
    : 0;

  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <StatTile label="Total generated outputs" value={generation.total} detail="Successful and failed attempts" />
      <StatTile label="Successful generations" value={generation.successful} detail={`${formatPercent(generation.successRate)} success rate`} />
      <StatTile
        label="Failed generations"
        value={generation.failed}
        status={
          generation.failed > 0
            ? { kind: "warning", text: "Needs attention" }
            : { kind: "good", text: "No failures" }
        }
      />
      <StatTile
        label="Activities created"
        value={totals.activities}
        detail={`${totals.activitiesByType.WORDLE} Wordle · ${totals.activitiesByType.WORD_SEARCH} Word Search`}
      />
      <StatTile label="Average time on page" value={formatDuration(pageViews.averageDurationMs)} detail={`${pageViews.total} page views`} />
      <StatTile
        label="Most-used activity type"
        value={activityTypeLabel(mostUsedActivityType)}
        detail={mostUsedActivityType ? `${mostUsedCount} generations` : "No usage yet"}
      />
    </dl>
  );
}

export default function DashboardPage() {
  const [result, setResult] = useState<DashboardResult | null>(null);
  const [content, setContent] = useState<StoredContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchDashboardStats();
        const stored = next.available
          ? await Promise.all([fetchWordLists(), fetchAllActivities()])
          : null;
        if (cancelled) return;
        setResult(next);
        setContent(stored ? { wordLists: stored[0], activities: stored[1] } : null);
        setError(null);
        setUpdatedAt(new Date());
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load dashboard");
      }
    }

    load();
    const timer = setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [refreshCount]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Live usage, health and data summaries for the Wordle and Word Search builder.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          {updatedAt && <span>Updated {updatedAt.toLocaleTimeString()}</span>}
          <button
            type="button"
            onClick={() => setRefreshCount((count) => count + 1)}
            className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <p role="alert" className="text-red-600 dark:text-red-400">{error}</p>}
      {!result && !error && <p className="text-zinc-500 dark:text-zinc-400">Loading dashboard…</p>}

      {result && !result.available && (
        <>
          <HealthIndicator healthy={false} />
          <Section id="alerts-heading" title="Alerts">
            <AlertList alerts={result.unavailable.alerts} />
          </Section>
        </>
      )}

      {result?.available && (
        <>
          <HealthIndicator healthy />
          <Section id="alerts-heading" title="Alerts">
            <AlertList alerts={result.stats.alerts} />
          </Section>
          <Section id="metrics-heading" title="Key metrics">
            <KeyMetrics stats={result.stats} />
          </Section>
          <Section id="outcomes-heading" title="Generation outcomes">
            <GenerationBreakdown generation={result.stats.generation} />
          </Section>
          <Section id="failures-heading" title="Recent failures">
            <RecentFailuresTable failures={result.stats.recentFailures} />
          </Section>
          <Section id="stored-heading" title="Stored data">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatTile label="Word lists" value={result.stats.totals.wordLists} />
              <StatTile label="Words" value={result.stats.totals.words} />
              <StatTile label="Phonemes" value={result.stats.totals.phonemes} />
            </dl>
            {content && <StoredContentSummary wordLists={content.wordLists} activities={content.activities} />}
          </Section>
        </>
      )}
    </div>
  );
}
