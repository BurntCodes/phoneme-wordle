import StatusIcon, { type StatusKind } from "./StatusIcon";

export default function StatTile({
  label,
  value,
  detail,
  status,
}: {
  label: string;
  value: string | number;
  detail?: string;
  status?: { kind: StatusKind; text: string };
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <dt className="text-sm text-zinc-600 dark:text-zinc-400">{label}</dt>
      <dd className="m-0 flex flex-col gap-1">
        <span className="text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{value}</span>
        {detail && <span className="text-sm text-zinc-600 dark:text-zinc-400">{detail}</span>}
        {status && (
          <span className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            <StatusIcon kind={status.kind} />
            {status.text}
          </span>
        )}
      </dd>
    </div>
  );
}
