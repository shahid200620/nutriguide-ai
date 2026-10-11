"use client";

import { CalendarCheck, Flame, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { useAsync } from "@/hooks/useAsync";
import { activityApi } from "@/lib/api";
import type { ActivityDay } from "@/types";
import { Card, EmptyState, ErrorState, LinkButton, Skeleton, cn } from "./ui";

const WINDOW_DAYS = 84; // 12 weeks, fetched once; the 4-week view is a slice of the same data
const PERIODS = [
  { days: 28, label: "4 weeks" },
  { days: 84, label: "12 weeks" },
] as const;
const WEEKDAYS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

const parse = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d); // local date from components: no timezone shift
};
const mondayIndex = (d: Date) => (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function describe(d: ActivityDay) {
  const label = parse(d.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  if (!d.active) return `${label}: no activity`;
  const parts = [d.meals ? plural(d.meals, "meal") + " consumed" : "", d.hydration ? plural(d.hydration, "water entry").replace("entrys", "entries") : ""].filter(Boolean);
  return `${label}: active (${parts.join(", ")})`;
}

/** Calendar heatmap: one column per week (Mon-Sun), one square per day. */
function Heatmap({ days }: { days: ActivityDay[] }) {
  const cells = useMemo(() => {
    const lead = mondayIndex(parse(days[0].date));
    const padded: (ActivityDay | null)[] = [...Array(lead).fill(null), ...days];
    while (padded.length % 7 !== 0) padded.push(null); // rest of the current week (future days)
    return padded;
  }, [days]);
  const weeks = cells.length / 7;
  const big = weeks <= 5;
  const today = days[days.length - 1].date;

  return (
    <div className="flex gap-2" role="group" aria-label="Activity calendar">
      <div className="grid shrink-0 grid-rows-7 gap-1 pr-1 text-[11px] leading-none text-muted" aria-hidden>
        {WEEKDAYS.map((w, i) => (
          <span key={i} className={cn("flex items-center", big ? "h-7 sm:h-8" : "h-4 sm:h-5")}>{w}</span>
        ))}
      </div>
      <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ gridTemplateColumns: `repeat(${weeks}, auto)` }}>
        {cells.map((d, i) =>
          d ? (
            <div
              key={d.date}
              role="img"
              aria-label={describe(d)}
              title={describe(d)}
              className={cn(
                "rounded-[5px] transition-colors",
                big ? "h-7 w-7 sm:h-8 sm:w-8" : "h-4 w-4 sm:h-5 sm:w-5",
                d.active ? "bg-brand-600 dark:bg-brand-500" : "bg-line",
                d.date === today && "ring-2 ring-ink/50 ring-offset-1 ring-offset-card"
              )}
            />
          ) : (
            <div key={`pad-${i}`} className={cn(big ? "h-7 w-7 sm:h-8 sm:w-8" : "h-4 w-4 sm:h-5 sm:w-5")} aria-hidden />
          )
        )}
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, value, sub }: { icon: typeof Flame; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-surface p-4">
      <p className="flex items-center gap-1.5 text-sm text-muted"><Icon className="h-4 w-4 text-brand-accent" aria-hidden /> {label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function StreakCard() {
  const { data, error, loading, reload } = useAsync(() => activityApi.streak(WINDOW_DAYS), []);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["days"]>(84);

  const shown = useMemo(() => (data ? data.days.slice(-period) : []), [data, period]);
  const activeInPeriod = shown.filter((d) => d.active).length;

  const toggle = (
    <div role="group" aria-label="Period" className="inline-flex rounded-lg border border-line bg-surface p-0.5 text-xs font-semibold">
      {PERIODS.map((p) => (
        <button
          key={p.days}
          type="button"
          onClick={() => setPeriod(p.days)}
          aria-pressed={period === p.days}
          className={cn("rounded-md px-2.5 py-1 transition-colors", period === p.days ? "bg-card text-ink shadow-card dark:shadow-none dark:ring-1 dark:ring-line" : "text-muted hover:text-ink")}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  return (
    <Card title="Consistency" action={data && data.total_active_days > 0 ? toggle : undefined}>
      {loading ? (
        <div aria-busy="true" className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-40" /></div>
      ) : error || !data ? (
        <ErrorState message={error ?? "Something went wrong. Please try again."} onRetry={() => reload()} />
      ) : data.total_active_days === 0 ? (
        <EmptyState
          icon={<Flame className="h-7 w-7" />}
          title="Start your streak today"
          body="Mark a meal as consumed or log some water, and today lights up on your calendar. Log again tomorrow to build a streak."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <LinkButton href="/meal-planner">Open meal planner</LinkButton>
              <LinkButton href="/hydration" variant="secondary">Log water</LinkButton>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Tile icon={Flame} label="Current streak" value={plural(data.current_streak, "day")} sub={data.current_streak > 0 && !data.today_active ? "Log something today to keep it going" : data.current_streak > 0 ? "Active today" : "Log today to start a new one"} />
            <Tile icon={Trophy} label="Longest streak" value={plural(data.longest_streak, "day")} />
            <Tile icon={CalendarCheck} label="Active days" value={`${activeInPeriod} of ${period}`} sub={`In the last ${period === 28 ? "4 weeks" : "12 weeks"}`} />
          </div>

          <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
            <div className="max-w-full overflow-x-auto pb-1"><Heatmap days={shown} /></div>
            <div className="text-sm text-muted">
              <p className="font-semibold text-ink">How your streak is calculated</p>
              <p className="mt-1 max-w-sm">{data.rule}</p>
              <p className="mt-3 flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-[4px] bg-brand-600 dark:bg-brand-500" aria-hidden /> Active</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-[4px] bg-line" aria-hidden /> No activity</span>
              </p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
