"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "./ui";

/**
 * Icon button that flips light/dark. Both icons are always rendered and swapped with CSS (`dark:`),
 * so the markup is identical on server and client - no hydration mismatch, no icon flash.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, mounted, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Dark mode"
      aria-pressed={mounted ? theme === "dark" : undefined}
      title={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
      className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-surface", className)}
    >
      <Moon className="h-[18px] w-[18px] dark:hidden" aria-hidden />
      <Sun className="hidden h-[18px] w-[18px] dark:block" aria-hidden />
    </button>
  );
}

/** Two-option control for the Settings page. */
export function ThemeSwitch() {
  const { theme, mounted, setTheme } = useTheme();
  const options = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
  ];
  return (
    <div role="group" aria-label="Colour theme" className="inline-flex rounded-xl border border-line bg-surface p-1">
      {options.map((o) => {
        const active = mounted && theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            aria-pressed={mounted ? active : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              active ? "bg-card text-ink shadow-card dark:shadow-none dark:ring-1 dark:ring-line" : "text-muted hover:text-ink"
            )}
          >
            <o.icon className="h-4 w-4" aria-hidden /> {o.label}
          </button>
        );
      })}
    </div>
  );
}
