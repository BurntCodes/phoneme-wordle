import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { evaluateAlerts } from "@/lib/alerts";
import type { DashboardStats } from "@/lib/dashboardTypes";
import { checkDatabaseHealth } from "@/lib/health";
import { loadDataIssues, loadStoredStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    if (!health.ok) {
      const alerts = evaluateAlerts(
        { health: health.status, generation: { total: 0, failed: 0 } },
        { emptyWordLists: [], unplayableWordleActivities: [] },
      );
      return NextResponse.json({ health: health.status, alerts }, { status: 503 });
    }

    const [stored, issues] = await Promise.all([loadStoredStats(), loadDataIssues()]);
    const stats: DashboardStats = {
      health: { status: "ok", database: "up" },
      ...stored,
      alerts: evaluateAlerts({ health: { database: "up" }, generation: stored.generation }, issues),
    };
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
