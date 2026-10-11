import Link from "next/link";
import { cn } from "./ui";

// One mark, used everywhere (navbar, sidebar, auth pages, footer). Same artwork as app/icon.svg.
// A leaf (food) over a heartbeat baseline (fitness). Brand tile, white glyph - readable in both themes.
const LEAF = "M9.5 18.5C9.5 10.5 15 5.5 23.5 5.5C23.5 13.5 18 18.5 9.5 18.5Z";
const PULSE = "M5 24.5H11.2C12.4 24.5 12.8 21.2 14.4 21.2C16 21.2 16.4 27.4 18 27.4C19.4 27.4 19.6 24.5 20.9 24.5H27";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("shrink-0", className ?? "h-8 w-8")} aria-hidden focusable="false">
      <rect width="32" height="32" rx="8" className="fill-brand-600 dark:fill-brand-500" />
      <path d={LEAF} fill="#fff" />
      <path d={PULSE} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-bold tracking-tight", className)} aria-label="NutriGuide AI home">
      <LogoMark />
      <span className="text-lg">
        NutriGuide <span className="text-brand-accent">AI</span>
      </span>
    </Link>
  );
}
