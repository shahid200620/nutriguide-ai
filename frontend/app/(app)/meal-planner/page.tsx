"use client";

import { Check, RefreshCw, Trash2, Undo2, UtensilsCrossed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { MACRO_COLORS } from "@/components/charts";
import { Alert, Button, Card, EmptyState, ErrorState, MiniProgress, Skeleton, Stat, cn } from "@/components/ui";
import { useAsync } from "@/hooks/useAsync";
import { mealConsumptionApi, mealPlannerApi, nutritionApi } from "@/lib/api";
import { DIETS, MEAL_LABELS, MEAL_ORDER, labelOf } from "@/lib/constants";
import { localDate } from "@/lib/time";
import type { ConsumptionRecord, MealPlanItem } from "@/types";

const PORTIONS = [0.5, 0.75, 1, 1.5, 2];
const BRAND = "#2E9468";

const prettyDay = (iso: string) => {
  if (iso === localDate()) return "today";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

function Macros({ calories, protein, carbs, fat }: { calories: number; protein: number; carbs: number; fat: number }) {
  const dot = (c: string) => <span className="h-2 w-2 rounded-full" style={{ background: c }} aria-hidden />;
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
      <span className="font-semibold tabular-nums text-ink">{Math.round(calories)} kcal</span>
      <span className="inline-flex items-center gap-1.5">{dot(MACRO_COLORS.protein)}Protein {protein} g</span>
      <span className="inline-flex items-center gap-1.5">{dot(MACRO_COLORS.carbs)}Carbs {carbs} g</span>
      <span className="inline-flex items-center gap-1.5">{dot(MACRO_COLORS.fat)}Fat {fat} g</span>
    </p>
  );
}

export default function MealPlannerPage() {
  const [date, setDate] = useState(localDate());
  const [busy, setBusy] = useState<"generate" | "delete" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [portions, setPortions] = useState<Record<number, number>>({});
  // key "i<itemId>" for plan items, "r<recordId>" for log entries without a plan item
  const [pending, setPending] = useState<Record<string, "consume" | "undo">>({});
  // What we just did locally, so the row flips instantly. The reload that follows is the source of truth.
  const [local, setLocal] = useState<Record<number, ConsumptionRecord | null>>({});
  const inFlight = useRef(new Set<string>()); // blocks a second click before React re-renders

  const { data, error, loading, reload } = useAsync(async () => {
    const [plan, summary, day] = await Promise.all([mealPlannerApi.forDate(date), nutritionApi.summary(), mealConsumptionApi.forDay(date)]);
    return { plan, targets: summary.targets, diet: summary.profile.dietary_preference, day };
  }, [date]);

  useEffect(() => {
    setLocal({});
    setNotice(null);
    setActionError(null);
  }, [date]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  async function runPlanAction(kind: "generate" | "delete", fn: () => Promise<unknown>, failure: string) {
    setBusy(kind);
    setActionError(null);
    setNotice(null);
    try {
      await fn();
      setLocal({});
      reload(true);
    } catch (e) {
      setActionError(e instanceof Error && e.message ? e.message : failure);
    } finally {
      setBusy(null);
    }
  }

  async function mark(key: string, kind: "consume" | "undo", fn: () => Promise<void>, failure: string) {
    if (inFlight.current.has(key)) return; // repeated clicks do nothing while a request is running
    inFlight.current.add(key);
    setPending((p) => ({ ...p, [key]: kind }));
    setActionError(null);
    setNotice(null);
    try {
      await fn();
      reload(true);
    } catch (e) {
      setActionError(e instanceof Error && e.message ? e.message : failure);
    } finally {
      inFlight.current.delete(key);
      setPending((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
    }
  }

  const consume = (item: MealPlanItem) =>
    mark(`i${item.id}`, "consume", async () => {
      const rec = await mealConsumptionApi.consume(item.id, portions[item.id] ?? 1);
      setLocal((l) => ({ ...l, [item.id]: rec }));
      setNotice(`Marked ${rec.food_name} as consumed (${Math.round(rec.calories)} kcal).`);
    }, "Unable to save this meal. Please try again.");

  const undo = (rec: ConsumptionRecord, itemId?: number) =>
    mark(itemId !== undefined ? `i${itemId}` : `r${rec.id}`, "undo", async () => {
      await mealConsumptionApi.undo(rec.id);
      if (itemId !== undefined) setLocal((l) => ({ ...l, [itemId]: null }));
      setNotice(`Removed ${rec.food_name} from your log.`);
    }, "Unable to undo that. Please try again.");

  const plan = data?.plan ?? null;
  const isFuture = date > localDate();
  const consumptionOf = (i: MealPlanItem) => (i.id in local ? local[i.id] : i.consumption);
  const orphans = data?.day.entries.filter((e) => e.meal_plan_item_id === null) ?? [];
  const anyConsumed = !!plan?.items.some((i) => consumptionOf(i));

  return (
    <>
      <PageHeader title="Meal planner" subtitle="A rule-based daily plan that approximates your calorie target. Mark meals as consumed to track your day." />
      <div className="mb-5"><Alert tone="info">This is a <strong>rule-based meal planner</strong>, not a machine-learning model. Nutrition values are approximate estimates from a small built-in food list, not verified database values.</Alert></div>

      <div className={cn("flex flex-wrap items-end gap-3", anyConsumed ? "mb-2" : "mb-5")}>
        <div>
          <label htmlFor="plan-date" className="mb-1.5 block text-sm font-medium">Date</label>
          <input id="plan-date" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="rounded-xl border border-line bg-card px-4 py-2.5 text-ink" />
        </div>
        <Button onClick={() => runPlanAction("generate", () => mealPlannerApi.generate(date), "Unable to generate your meal plan.")} loading={busy === "generate"} disabled={loading || !!error}>
          <RefreshCw className="h-4 w-4" aria-hidden /> {plan ? "Regenerate meal plan" : "Generate meal plan"}
        </Button>
        {plan && <Button variant="danger" onClick={() => runPlanAction("delete", () => mealPlannerApi.remove(plan.id), "Unable to delete this meal plan.")} loading={busy === "delete"}><Trash2 className="h-4 w-4" aria-hidden /> Delete</Button>}
      </div>
      {anyConsumed && <p className="mb-5 text-sm text-muted">Regenerating or deleting the plan keeps the meals you already marked as consumed in your log.</p>}
      {actionError && <div className="mb-5"><Alert>{actionError}</Alert></div>}
      {notice && <div className="mb-5"><Alert tone="success">{notice}</Alert></div>}

      {loading ? (
        <div className="space-y-4" aria-busy="true"><Skeleton className="h-32" /><Skeleton className="h-24" /><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
      ) : error || !data ? (
        <ErrorState message={error ?? "Something went wrong. Please try again."} onRetry={() => reload()} />
      ) : (
        <div className="space-y-5">
          {(plan || data.day.entries.length > 0) && (() => {
            const t = data.targets, c = data.day.totals;
            const left = t.daily_calorie_target - c.calories;
            return (
              <Card title={`Consumed ${prettyDay(date)}`}>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                  {([
                    { label: "Calories", value: c.calories, unit: "kcal", target: t.daily_calorie_target, color: BRAND, sub: left >= 0 ? `${left} kcal left of ${t.daily_calorie_target}` : `${-left} kcal over ${t.daily_calorie_target}` },
                    { label: "Protein", value: c.protein, unit: "g", target: t.protein_target, color: MACRO_COLORS.protein, sub: `of ${t.protein_target} g` },
                    { label: "Carbohydrates", value: c.carbs, unit: "g", target: t.carbs_target, color: MACRO_COLORS.carbs, sub: `of ${t.carbs_target} g` },
                    { label: "Fat", value: c.fat, unit: "g", target: t.fat_target, color: MACRO_COLORS.fat, sub: `of ${t.fat_target} g` },
                  ]).map((m) => (
                    <div key={m.label}>
                      <Stat label={m.label} value={m.value} unit={m.unit} sub={m.sub} />
                      <div className="mt-2"><MiniProgress value={m.value} max={m.target} color={m.color} label={`${m.label} consumed`} /></div>
                    </div>
                  ))}
                </div>
                {c.meals === 0 && <p className="mt-4 text-sm text-muted">Nothing marked as consumed yet. Use “Mark as consumed” on a meal below.</p>}
              </Card>
            );
          })()}

          {!plan ? (
            <EmptyState icon={<UtensilsCrossed className="h-7 w-7" />} title="No meal plan for this date" body={`We will build one around your ${data.targets.daily_calorie_target} kcal target and ${labelOf(DIETS, data.diet).toLowerCase()} diet.`} />
          ) : (
            <>
              <Card title="Plan totals">
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                  <Stat label="Calories" value={plan.total_calories} unit="kcal" sub={`Target ${data.targets.daily_calorie_target}`} />
                  <Stat label="Protein" value={plan.total_protein} unit="g" sub={`Target ${data.targets.protein_target} g`} />
                  <Stat label="Carbohydrates" value={plan.total_carbs} unit="g" sub={`Target ${data.targets.carbs_target} g`} />
                  <Stat label="Fat" value={plan.total_fat} unit="g" sub={`Target ${data.targets.fat_target} g`} />
                </div>
              </Card>

              {MEAL_ORDER.map((m) => {
                const items = plan.items.filter((i) => i.meal_type === m);
                if (!items.length) return null;
                return (
                  <Card key={m} title={MEAL_LABELS[m]} action={<span className="text-sm font-semibold tabular-nums text-muted">{Math.round(items.reduce((s, i) => s + i.calories, 0))} kcal</span>}>
                    <ul className="divide-y divide-line">
                      {items.map((i) => {
                        const rec = consumptionOf(i);
                        const state = pending[`i${i.id}`];
                        return (
                          <li key={i.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="font-medium">{i.food_name}</p>
                              <p className="text-sm text-muted">Serving: {i.serving_size}</p>
                              <Macros calories={i.calories} protein={i.protein} carbs={i.carbs} fat={i.fat} />
                              {rec && rec.portion !== 1 && <p className="mt-1 text-sm text-brand-fg">You logged {rec.portion}× of this serving: {Math.round(rec.calories)} kcal.</p>}
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              {rec ? (
                                <>
                                  <Button variant="secondary" disabled className="!opacity-100 border-brand-accent text-brand-fg" aria-label={`${i.food_name} is consumed`}>
                                    <Check className="h-4 w-4" aria-hidden /> Consumed
                                  </Button>
                                  <Button variant="ghost" onClick={() => undo(rec, i.id)} loading={state === "undo"} disabled={!!state} aria-label={`Undo consumed ${i.food_name}`}>
                                    {state !== "undo" && <Undo2 className="h-4 w-4" aria-hidden />} Undo
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <select
                                    aria-label={`Portion of ${i.food_name} you ate`}
                                    value={portions[i.id] ?? 1}
                                    onChange={(e) => setPortions((p) => ({ ...p, [i.id]: Number(e.target.value) }))}
                                    disabled={!!state || isFuture}
                                    className="rounded-xl border border-line bg-card px-3 py-3 text-sm text-ink disabled:opacity-60"
                                  >
                                    {PORTIONS.map((p) => <option key={p} value={p}>{p === 1 ? "1× serving" : `${p}×`}</option>)}
                                  </select>
                                  <Button onClick={() => consume(i)} loading={state === "consume"} disabled={!!state || isFuture} title={isFuture ? "You can mark meals as consumed on the day they are planned for." : undefined}>
                                    {state !== "consume" && <Check className="h-4 w-4" aria-hidden />} Mark as consumed
                                  </Button>
                                </>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                );
              })}
              {isFuture && <p className="text-sm text-muted">Meals can be marked as consumed on the day they are planned for, or afterwards.</p>}
            </>
          )}

          {orphans.length > 0 && (
            <Card title="Logged from an earlier version of this plan">
              <p className="mb-3 text-sm text-muted">You marked these as consumed before the plan changed. They still count toward your totals for {prettyDay(date)}.</p>
              <ul className="divide-y divide-line">
                {orphans.map((e) => (
                  <li key={e.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium">{e.food_name} <span className="text-sm font-normal text-muted">· {MEAL_LABELS[e.meal_type]}</span></p>
                      <Macros calories={e.calories} protein={e.protein} carbs={e.carbs} fat={e.fat} />
                    </div>
                    <Button variant="ghost" onClick={() => undo(e)} loading={pending[`r${e.id}`] === "undo"} disabled={!!pending[`r${e.id}`]} aria-label={`Remove ${e.food_name} from log`}>
                      {pending[`r${e.id}`] !== "undo" && <Undo2 className="h-4 w-4" aria-hidden />} Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
