import type { ActivityTypeKey, DashboardStats } from "@/lib/dashboardTypes";
import { activityTypeLabel, formatPercent } from "@/lib/format";
import StatusIcon from "./StatusIcon";

const TYPES: ActivityTypeKey[] = ["WORDLE", "WORD_SEARCH"];

function OutcomeBar({ type, successful, failed }: { type: ActivityTypeKey; successful: number; failed: number }) {
  const label = `${activityTypeLabel(type)}: ${successful} successful, ${failed} failed`;
  const total = successful + failed;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-zinc-800 dark:text-zinc-200">{activityTypeLabel(type)}</span>
      <div role="img" aria-label={label} className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        {successful > 0 && <div className="bg-(--status-good)" style={{ flexGrow: successful }} />}
        {failed > 0 && <div className="bg-(--status-critical)" style={{ flexGrow: failed }} />}
        {total === 0 && <div className="flex-1" />}
      </div>
    </div>
  );
}

export default function GenerationBreakdown({ generation }: { generation: DashboardStats["generation"] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {TYPES.map((type) => (
          <OutcomeBar key={type} type={type} {...generation.byType[type]} />
        ))}
      </div>

      <ul className="flex flex-wrap gap-4 text-sm text-zinc-700 dark:text-zinc-300">
        <li className="flex items-center gap-1.5">
          <StatusIcon kind="good" />
          Successful
        </li>
        <li className="flex items-center gap-1.5">
          <StatusIcon kind="critical" />
          Failed
        </li>
      </ul>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-800 dark:text-zinc-200">
          <caption className="sr-only">Generation outcomes by activity type</caption>
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              <th scope="col" className="py-2 pr-4 font-medium">Activity</th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">Successful</th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">Failed</th>
              <th scope="col" className="py-2 text-right font-medium">Success rate</th>
            </tr>
          </thead>
          <tbody>
            {TYPES.map((type) => {
              const { successful, failed } = generation.byType[type];
              const total = successful + failed;
              return (
                <tr key={type} className="border-b border-zinc-100 dark:border-zinc-900">
                  <th scope="row" className="py-2 pr-4 font-normal">{activityTypeLabel(type)}</th>
                  <td className="py-2 pr-4 text-right tabular-nums">{successful}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{failed}</td>
                  <td className="py-2 text-right tabular-nums">{formatPercent(total > 0 ? successful / total : null)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
