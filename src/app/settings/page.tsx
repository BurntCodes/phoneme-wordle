import type { Metadata } from "next";
import { cookies } from "next/headers";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { THEME_COOKIE, type Theme } from "@/lib/theme";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const initialTheme: Theme =
    cookieStore.get(THEME_COOKIE)?.value === "dark" ? "dark" : "light";

  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Settings
      </h2>
      <section className="space-y-3">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          Theme
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Choice is saved to a cookie and applies across the whole site.
        </p>
        <ThemeToggle initialTheme={initialTheme} />
      </section>
    </div>
  );
}
