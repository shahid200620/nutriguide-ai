import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "inverse";
  loading?: boolean;
};
const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
const buttonVariants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "border border-ink/20 bg-card text-ink hover:bg-surface",
  ghost: "text-ink hover:bg-surface",
  danger: "border border-red-200 bg-card text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/50",
  inverse: "bg-white text-brand-700 hover:bg-brand-50", // for use on solid brand backgrounds
};

export function Button({ variant = "primary", loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button className={cn(buttonBase, buttonVariants[variant], className)} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function LinkButton({ href, variant = "primary", className, children }: { href: string; variant?: "primary" | "secondary" | "inverse"; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={cn(buttonBase, buttonVariants[variant], className)}>
      {children}
    </Link>
  );
}

export function Card({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-card p-5 shadow-card dark:shadow-none sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export const Skeleton = ({ className }: { className?: string }) => <div className={cn("animate-pulse rounded-xl bg-surface", className)} aria-hidden />;

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-10 text-muted">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function Alert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "info" | "success" }) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200"
          : "border-brand-100 bg-brand-50 text-brand-fg"
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-surface px-6 py-8 text-center">
      {icon && <div className="mb-3 text-muted">{icon}</div>}
      <p className="font-semibold">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="space-y-3">
      <Alert>{message}</Alert>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Field({ label, hint, error, id, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={cn(
          "w-full rounded-xl border bg-card px-4 py-3 text-base outline-none transition-colors focus:border-brand-accent",
          error ? "border-red-400 dark:border-red-500" : "border-line"
        )}
        {...rest}
      />
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Selectable option card used for single-choice questions. */
export function Choice({ selected, onClick, label, hint }: { selected: boolean; onClick: () => void; label: string; hint?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border-2 px-4 py-3.5 text-left transition-colors",
        selected ? "border-brand-accent bg-brand-50" : "border-line bg-card hover:border-ink/30"
      )}
    >
      <span className="block font-semibold">{label}</span>
      {hint && <span className="mt-0.5 block text-sm text-muted">{hint}</span>}
    </button>
  );
}

export function Badge({ children, tone = "soon" }: { children: ReactNode; tone?: "soon" | "live" }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", tone === "live" ? "bg-brand-50 text-brand-fg" : "bg-surface text-muted")}>
      {children}
    </span>
  );
}

export function Stat({ label, value, unit, sub }: { label: string; value: ReactNode; unit?: string; sub?: string }) {
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-muted">{unit}</span>}
      </p>
      {sub && <p className="text-sm text-muted">{sub}</p>}
    </div>
  );
}

/** Thin horizontal progress bar. `value`/`max` share a unit; the fill is capped at 100%. */
export function MiniProgress({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={Math.round(max)} aria-valuenow={Math.round(value)}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
