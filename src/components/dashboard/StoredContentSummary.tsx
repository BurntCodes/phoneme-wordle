import type { ApiActivity, ApiWordListSummary } from "@/lib/api/client";
import { activityTypeLabel } from "@/lib/format";

function settingsSummary(activity: ApiActivity): string {
  if (activity.type === "WORDLE") {
    return `${activity.difficulty ?? "?"} phonemes, ${activity.maxGuesses ?? "?"} guesses`;
  }
  return `${activity.gridRows ?? "?"} × ${activity.gridCols ?? "?"} grid`;
}

const HEAD = "border-b border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400";
const ROW = "border-b border-zinc-100 dark:border-zinc-900";

export default function StoredContentSummary({
  wordLists,
  activities,
}: {
  wordLists: ApiWordListSummary[];
  activities: ApiActivity[];
}) {
  const listNames = new Map(wordLists.map((list) => [list.id, list.name]));

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-800 dark:text-zinc-200">
          <caption className="pb-2 text-left font-medium text-zinc-900 dark:text-zinc-50">Word lists</caption>
          <thead>
            <tr className={HEAD}>
              <th scope="col" className="py-2 pr-4 font-medium">Name</th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">Words</th>
              <th scope="col" className="py-2 text-right font-medium">Activities</th>
            </tr>
          </thead>
          <tbody>
            {wordLists.map((list) => (
              <tr key={list.id} className={ROW}>
                <th scope="row" className="py-2 pr-4 font-normal">{list.name}</th>
                <td className="py-2 pr-4 text-right tabular-nums">{list._count.words}</td>
                <td className="py-2 text-right tabular-nums">{list._count.activities}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-800 dark:text-zinc-200">
          <caption className="pb-2 text-left font-medium text-zinc-900 dark:text-zinc-50">Activity configurations</caption>
          <thead>
            <tr className={HEAD}>
              <th scope="col" className="py-2 pr-4 font-medium">Name</th>
              <th scope="col" className="py-2 pr-4 font-medium">Type</th>
              <th scope="col" className="py-2 pr-4 font-medium">Word list</th>
              <th scope="col" className="py-2 font-medium">Settings</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className={ROW}>
                <th scope="row" className="py-2 pr-4 font-normal">{activity.name}</th>
                <td className="py-2 pr-4 whitespace-nowrap">{activityTypeLabel(activity.type)}</td>
                <td className="py-2 pr-4">{listNames.get(activity.wordListId) ?? "Unknown"}</td>
                <td className="py-2 whitespace-nowrap">{settingsSummary(activity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
