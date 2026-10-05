export type StatusKind = "good" | "warning" | "critical" | "info";

const COLOR: Record<StatusKind, string> = {
  good: "text-(--status-good)",
  warning: "text-(--status-warning)",
  critical: "text-(--status-critical)",
  info: "text-zinc-500 dark:text-zinc-400",
};

const PATHS: Record<StatusKind, string> = {
  good: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z",
  warning: "M8.3 3.4a2 2 0 013.4 0l6 10.5A2 2 0 0116 17H4a2 2 0 01-1.7-3.1l6-10.5zM10 7a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1zm0 7.5a1.1 1.1 0 100-2.2 1.1 1.1 0 000 2.2z",
  critical: "M10 18a8 8 0 100-16 8 8 0 000 16zm2.7-10.7a1 1 0 00-1.4 0L10 8.6 8.7 7.3a1 1 0 00-1.4 1.4L8.6 10l-1.3 1.3a1 1 0 101.4 1.4L10 11.4l1.3 1.3a1 1 0 001.4-1.4L11.4 10l1.3-1.3a1 1 0 000-1.4z",
  info: "M10 18a8 8 0 100-16 8 8 0 000 16zm0-11a1.1 1.1 0 100 2.2A1.1 1.1 0 0010 7zm-1 3.5a1 1 0 112 0V14a1 1 0 11-2 0v-3.5z",
};

export default function StatusIcon({ kind }: { kind: StatusKind }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`h-4 w-4 shrink-0 ${COLOR[kind]}`}>
      <path fillRule="evenodd" clipRule="evenodd" d={PATHS[kind]} />
    </svg>
  );
}
