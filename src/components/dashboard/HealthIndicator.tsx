import StatusIcon from "./StatusIcon";

export default function HealthIndicator({ healthy }: { healthy: boolean }) {
  return (
    <p className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
      <StatusIcon kind={healthy ? "good" : "critical"} />
      {healthy ? "System healthy — database connected" : "System unavailable — database unreachable"}
    </p>
  );
}
