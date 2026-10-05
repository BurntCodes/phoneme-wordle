import type { AlertSeverity, DashboardAlert } from "@/lib/dashboardTypes";
import StatusIcon, { type StatusKind } from "./StatusIcon";

const KIND: Record<AlertSeverity, StatusKind> = { error: "critical", warning: "warning", info: "info" };
const LABEL: Record<AlertSeverity, string> = { error: "Error", warning: "Warning", info: "Notice" };

export default function AlertList({ alerts }: { alerts: DashboardAlert[] }) {
  if (alerts.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <StatusIcon kind="good" />
        No active alerts.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {alerts.map((alert) => (
        <li
          key={alert.code}
          className="flex items-start gap-2 rounded-md border border-zinc-200 p-3 text-sm text-zinc-800 dark:border-zinc-800 dark:text-zinc-200"
        >
          <span className="mt-0.5">
            <StatusIcon kind={KIND[alert.severity]} />
          </span>
          <span>
            <strong className="font-semibold">{LABEL[alert.severity]}:</strong> {alert.message}
          </span>
        </li>
      ))}
    </ul>
  );
}
