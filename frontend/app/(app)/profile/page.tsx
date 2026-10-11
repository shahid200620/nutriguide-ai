"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Alert, Button, Card, ErrorState, Field, Skeleton } from "@/components/ui";
import { useAsync } from "@/hooks/useAsync";
import { nutritionApi, profileApi } from "@/lib/api";
import { ACTIVITY_LEVELS, DIETS, DISCLAIMER, GENDERS, GOALS } from "@/lib/constants";
import type { UserProfileInput } from "@/types";

function Select<T extends string>({ id, label, value, options, onChange }: { id: string; label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className="w-full rounded-xl border border-line bg-card px-4 py-3 text-base text-ink">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function ProfilePage() {
  const { data, error, loading, reload } = useAsync(() => profileApi.get(), []);
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (data) setForm({ age: String(data.age), gender: data.gender, height_cm: String(data.height_cm), weight_kg: String(data.weight_kg), activity_level: data.activity_level, dietary_preference: data.dietary_preference, fitness_goal: data.fitness_goal });
  }, [data]);

  if (loading || (data && !form)) return <div className="space-y-4" aria-busy="true"><Skeleton className="h-10 w-48" /><Skeleton className="h-96" /></div>;
  if (error || !form) return <ErrorState message={error ?? "Something went wrong. Please try again."} onRetry={() => reload()} />;

  const set = (k: string) => (v: string) => setForm({ ...form, [k]: v });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const age = Number(form.age), h = Number(form.height_cm), w = Number(form.weight_kg);
    if (!Number.isInteger(age) || age < 13 || age > 100) return setMsg({ tone: "error", text: "Enter an age between 13 and 100." });
    if (!(h >= 100 && h <= 250)) return setMsg({ tone: "error", text: "Enter a height between 100 and 250 cm." });
    if (!(w >= 25 && w <= 300)) return setMsg({ tone: "error", text: "Enter a weight between 25 and 300 kg." });
    setSaving(true);
    setMsg(null);
    try {
      await profileApi.update({ age, height_cm: h, weight_kg: w, gender: form.gender, activity_level: form.activity_level, dietary_preference: form.dietary_preference, fitness_goal: form.fitness_goal } as UserProfileInput);
      const s = await nutritionApi.summary();
      setMsg({ tone: "info", text: `Profile saved. Your daily calorie target is now ${s.targets.daily_calorie_target} kcal.` });
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Profile" subtitle="Changing these values recalculates your targets." />
      <Card>
        <form onSubmit={save} className="space-y-4" noValidate>
          {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="age" label="Age" type="number" inputMode="numeric" value={form.age} onChange={(e) => set("age")(e.target.value)} />
            <Select id="gender" label="Gender" value={form.gender} options={GENDERS} onChange={set("gender")} />
            <Field id="height" label="Height (cm)" type="number" inputMode="decimal" value={form.height_cm} onChange={(e) => set("height_cm")(e.target.value)} />
            <Field id="weight" label="Weight (kg)" type="number" inputMode="decimal" value={form.weight_kg} onChange={(e) => set("weight_kg")(e.target.value)} />
            <Select id="activity" label="Activity level" value={form.activity_level} options={ACTIVITY_LEVELS} onChange={set("activity_level")} />
            <Select id="diet" label="Diet preference" value={form.dietary_preference} options={DIETS} onChange={set("dietary_preference")} />
            <div className="sm:col-span-2"><Select id="goal" label="Fitness goal" value={form.fitness_goal} options={GOALS} onChange={set("fitness_goal")} /></div>
          </div>
          <Button type="submit" loading={saving}>Save changes</Button>
        </form>
      </Card>
      <p className="mt-4 text-sm text-muted">{DISCLAIMER}</p>
    </>
  );
}
