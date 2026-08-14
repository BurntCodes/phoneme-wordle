import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Settings
      </h2>
      <p className="text-zinc-600 dark:text-zinc-400">
        Light/dark theme controls, persisted via cookies, land here in the
        next build.
      </p>
    </div>
  );
}
