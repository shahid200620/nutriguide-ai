"use client";

import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/AppShell";
import { BRAND_RING, MacroDonut, MACRO_COLORS, ProgressRing } from "@/components/charts";
import { StreakCard } from "@/components/StreakCard";
import { Badge, Card, EmptyState, ErrorState, LinkButton, MiniProgress, Skeleton, Stat } from "@/components/ui";
import { useAsync } from "@/hooks/useAsync";
import { nutritionApi } from "@/lib/api";
import { ACTIVITY_LEVELS, DISCLAIMER, GOALS, MEAL_LABELS, MEAL_ORDER, labelOf } from "@/lib/constants";
import { useTheme } from "@/lib/theme";
import { greeting } from "@/lib/time";

function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading dashboard">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-5 md:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
      <Skeleton className="h-56" />
      <div className="grid gap-5 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
      <Skeleton className="h-48" />
    </div>
  );
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const { data, error, loading, reload } = useAsync(() => nutritionApi.summary(), []);
  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <ErrorState message={error ?? "Something went wrong. Please try again."} onRetry={() => reload()} />;

  const { targets: t, calories: c, consumed: eaten, hydration: h, meal_plan: plan, profile } = data;
  const over = c.remaining < 0;
  const firstName = data.user_name.split(" ")[0];

  return (
    <>
      <PageHeader title={`${greeting()}, ${firstName}`} subtitle="Here is your nutrition overview for today." />

      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Daily calories">
          <ProgressRing value={c.consumed} max={c.target} color={BRAND_RING[theme]} label="Calories consumed">
            <span className="text-3xl font-bold tabular-nums">{c.consumed}</span>
            <span className="text-sm text-muted">of {c.target} kcal</span>
          </ProgressRing>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <Stat label="Target" value={c.target} unit="kcal" />
            <Stat label="Consumed" value={c.consumed} unit="kcal" />
            <Stat label={over ? "Over target" : "Remaining"} value={Math.abs(c.remaining)} unit="kcal" />
          </div>
          {c.consumed === 0 && (
            <p className="mt-4 text-center text-sm text-muted">
              0 kcal consumed. {plan ? "Mark meals as consumed in your" : "Generate a plan, then mark meals as consumed in the"}{" "}
              <Link href="/meal-planner" className="font-semibold text-brand-fg hover:underline">meal planner</Link> to see your progress here.
            </p>
          )}
        </Card>

        <Card title="Macros today">
          <MacroDonut protein={t.protein_target} carbs={t.carbs_target} fat={t.fat_target} />
          <div className="mt-5 grid grid-cols-3 gap-3">
            {([
              { key: "Protein", eaten: eaten.protein, target: t.protein_target, color: MACRO_COLORS.protein },
              { key: "Carbohydrates", eaten: eaten.carbs, target: t.carbs_target, color: MACRO_COLORS.carbs },
              { key: "Fat", eaten: eaten.fat, target: t.fat_target, color: MACRO_COLORS.fat },
            ]).map((m) => (
              <div key={m.key}>
                <p className="flex items-center gap-1.5 text-sm text-muted"><span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} aria-hidden />{m.key}</p>
                <p className="text-xl font-bold tabular-nums">{m.eaten} <span className="text-sm font-medium text-muted">/ {m.target} g</span></p>
                <div className="mt-1.5"><MiniProgress value={m.eaten} max={m.target} color={m.color} label={`${m.key} consumed`} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5"><StreakCard /></div>

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <Card><Stat label="BMI" value={t.bmi} sub={t.bmi_category} /></Card>
        <Card><Stat label="BMR" value={Math.round(t.bmr)} unit="kcal" sub="Calories at rest" /></Card>
        <Card><Stat label="TDEE" value={Math.round(t.tdee)} unit="kcal" sub="With your activity level" /></Card>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card title="Your plan">
          <dl className="grid grid-cols-2 gap-4">
            <div><dt className="text-sm text-muted">Fitness goal</dt><dd className="font-semibold">{labelOf(GOALS, profile.fitness_goal)}</dd></div>
            <div><dt className="text-sm text-muted">Activity level</dt><dd className="font-semibold">{labelOf(ACTIVITY_LEVELS, profile.activity_level)}</dd></div>
          </dl>
          <Link href="/profile" className="mt-4 inline-block text-sm font-semibold text-brand-fg hover:underline">Edit profile</Link>
        </Card>

        <Card title="Hydration" action={<Link href="/hydration" className="text-sm font-semibold text-brand-fg hover:underline">Open</Link>}>
          <div className="flex items-center gap-5">
            <ProgressRing value={h.consumed_ml} max={h.target_ml} color="#2F80ED" size={110} label="Hydration progress">
              <span className="text-xl font-bold tabular-nums">{h.percent}%</span>
            </ProgressRing>
            <div>
              {h.consumed_ml === 0 ? <p className="font-semibold">No water logged today.</p> : <p className="font-semibold">{h.consumed_ml} ml logged</p>}
              <p className="text-sm text-muted">Estimated target {h.target_ml} ml · {h.remaining_ml} ml to go</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Today's meal plan" className="mt-5" action={<Link href="/meal-planner" className="text-sm font-semibold text-brand-fg hover:underline">Open planner</Link>}>
        {plan ? (
          <div className="grid gap-3 sm:grid-cols-4">
            {MEAL_ORDER.map((m) => {
              const items = plan.items.filter((i) => i.meal_type === m);
              const eatenCount = items.filter((i) => i.consumption).length;
              return (
                <div key={m} className="rounded-xl bg-surface p-4">
                  <p className="flex items-center justify-between gap-2 text-sm font-semibold">
                    {MEAL_LABELS[m]}
                    {items.length > 0 && eatenCount === items.length ? <Badge tone="live">Eaten</Badge> : eatenCount > 0 ? <Badge tone="live">{eatenCount} of {items.length}</Badge> : null}
                  </p>
                  <p className="text-lg font-bold tabular-nums">{Math.round(items.reduce((s, i) => s + i.calories, 0))} kcal</p>
                  <p className="mt-1 text-sm text-muted">{items.map((i) => i.food_name).join(", ")}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={<UtensilsCrossed className="h-6 w-6" />} title="No meal plan for today" body="Generate a rule-based plan that fits your calorie target and diet." action={<LinkButton href="/meal-planner">Generate meal plan</LinkButton>} />
        )}
      </Card>

      <p className="mt-6 text-sm text-muted">{DISCLAIMER}</p>
    </>
  );
}
