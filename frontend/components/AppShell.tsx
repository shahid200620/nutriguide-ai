"use client";

import { Apple, Camera, Dumbbell, Droplets, LayoutDashboard, LineChart, LogOut, Menu, Salad, Settings, Sparkles, User, UtensilsCrossed, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "./ui";

const NOW = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/meal-planner", label: "Meal planner", icon: UtensilsCrossed },
  { href: "/hydration", label: "Hydration", icon: Droplets },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];
const SOON = [
  { href: "/scan", label: "Food scanner", icon: Camera },
  { href: "/food-log", label: "Food diary", icon: Apple },
  { href: "/nutrition", label: "Nutrition", icon: Salad },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/recommendations", label: "Recommendations", icon: Sparkles },
  { href: "/progress", label: "Progress", icon: LineChart },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const item = (l: (typeof NOW)[number], soon = false) => {
    const active = pathname === l.href;
    return (
      <Link
        key={l.href}
        href={l.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active ? "bg-brand-50 text-brand-fg" : soon ? "text-muted hover:bg-surface" : "hover:bg-surface"
        )}
      >
        <l.icon className="h-[18px] w-[18px]" aria-hidden />
        {l.label}
        {soon && <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-muted">Soon</span>}
      </Link>
    );
  };
  return (
    <nav className="space-y-1" aria-label="App">
      {NOW.map((l) => item(l))}
      <p className="px-3 pb-1 pt-5 text-xs font-semibold text-muted">Coming later</p>
      {SOON.map((l) => item(l, true))}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const signOut = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-page">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-card p-4 lg:flex">
        <div className="px-2 pb-6 pt-1"><Logo href="/dashboard" /></div>
        <div className="flex-1 overflow-y-auto"><NavList /></div>
        <div className="mt-3 border-t border-line pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate px-3 text-sm font-semibold">{user?.name}</p>
              <p className="truncate px-3 pb-2 text-xs text-muted">{user?.email}</p>
            </div>
            <ThemeToggle className="shrink-0" />
          </div>
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface">
            <LogOut className="h-[18px] w-[18px]" aria-hidden /> Log out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-card px-4 lg:hidden">
        <Logo href="/dashboard" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => setOpen(true)} className="rounded-lg p-2" aria-label="Open navigation" aria-expanded={open}>
            <Menu />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <Logo href="/dashboard" />
              <button onClick={() => setOpen(false)} className="rounded-lg p-2" aria-label="Close navigation"><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto"><NavList onNavigate={() => setOpen(false)} /></div>
            <button onClick={signOut} className="mt-3 flex items-center gap-3 rounded-xl border-t border-line px-3 pb-2 pt-4 text-sm font-medium">
              <LogOut className="h-[18px] w-[18px]" aria-hidden /> Log out
            </button>
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
    </div>
  );
}
