"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { THEME_KEY } from "./theme-script";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  /** false during SSR and the first client render - use it to avoid hydration mismatches. */
  mounted: boolean;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

function apply(t: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", t === "dark");
  root.style.colorScheme = t;
}

/**
 * Theme state. The initial class on <html> is set by THEME_INIT_SCRIPT before paint; this provider
 * only reads it back after mount (so server and first client render match) and handles changes.
 * Preference: saved choice in localStorage, else the OS setting.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light");
    setMounted(true);
    // Keep other open tabs in sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY && (e.newValue === "light" || e.newValue === "dark")) {
        apply(e.newValue);
        setThemeState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    apply(t);
    setThemeState(t);
    try {
      window.localStorage.setItem(THEME_KEY, t);
    } catch {
      /* private mode / storage blocked: the theme still applies for this visit */
    }
  }, []);

  const value = useMemo<ThemeState>(
    () => ({ theme, mounted, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") }),
    [theme, mounted, setTheme]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
