"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LinkButton, cn } from "./ui";

const LINKS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  // Close the mobile menu after navigating, and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const mobileLinks = [
    ...LINKS,
    user ? { href: "/dashboard", label: "Dashboard" } : { href: "/login", label: "Log in" },
    ...(user ? [] : [{ href: "/signup", label: "Get started" }]),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn("rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-surface hover:text-ink", active ? "text-ink" : "text-muted")}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <LinkButton href="/dashboard">Open dashboard</LinkButton>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface">
                Log in
              </Link>
              <LinkButton href="/signup">Get started</LinkButton>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button className="rounded-xl p-2 transition-colors hover:bg-surface" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-menu" className="animate-fade-down space-y-1 border-t border-line px-4 py-3 md:hidden">
          {mobileLinks.map((l) => (
            <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-surface">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
