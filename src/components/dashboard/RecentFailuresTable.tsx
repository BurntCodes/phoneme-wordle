import type { RecentFailure } from "@/lib/dashboardTypes";
import { activityTypeLabel } from "@/lib/format";

export default function RecentFailuresTable({ failures }: { failures: RecentFailure[] }) {
  if (failures.length === 0) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">No failed generations recorded.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-zinc-800 dark:text-zinc-200">
        <caption className="sr-only">Most recent failed generations</caption>
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            <th scope="col" className="py-2 pr-4 font-medium">When</th>
            <th scope="col" className="py-2 pr-4 font-medium">Activity</th>
            <th scope="col" className="py-2 font-medium">Reason</th>
          </tr>
        </thead>
        <tbody>
          {failures.map((failure) => (
            <tr key={`${failure.createdAt}-${failure.activityType}`} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2 pr-4 whitespace-nowrap">{new Date(failure.createdAt).toLocaleString()}</td>
              <td className="py-2 pr-4 whitespace-nowrap">{activityTypeLabel(failure.activityType)}</td>
              <td className="py-2">{failure.failureReason ?? "No reason recorded"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
