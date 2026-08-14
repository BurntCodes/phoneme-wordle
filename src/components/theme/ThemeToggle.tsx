"use client";

import { useEffect, useState } from "react";
import { THEME_COOKIE, type Theme } from "@/lib/theme";

const OPTIONS: Theme[] = ["light", "dark"];

export default function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
  }, [theme]);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex rounded-md border border-zinc-200 p-1 dark:border-zinc-800"
    >
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={theme === option}
          onClick={() => setTheme(option)}
          className={`rounded px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
            theme === option
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
