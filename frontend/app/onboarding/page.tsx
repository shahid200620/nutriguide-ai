"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Logo } from "@/components/Logo";
import { Alert, Button, Card, Choice, Field, LinkButton, Spinner, Stat } from "@/components/ui";
import { MacroDonut } from "@/components/charts";
import { nutritionApi, profileApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ACTIVITY_LEVELS, DIETS, DISCLAIMER, GENDERS, GOALS } from "@/lib/constants";
import type { NutritionSummary, UserProfileInput } from "@/types";

const TOTAL = 5;
type Form = { age: string; gender: UserProfileInput["gender"] | ""; height: string; weight: string; activity: UserProfileInput["activity_level"] | ""; diet: UserProfileInput["dietary_preference"] | ""; goal: UserProfileInput["fitness_goal"] | "" };
const EMPTY: Form = { age: "", gender: "", height: "", weight: "", activity: "", diet: "", goal: "" };

function validate(step: number, f: Form): string | null {
  const num = (s: string) => (s.trim() === "" ? NaN : Number(s));
  switch (step) {
    case 0: {
      const age = num(f.age);
      if (!Number.isInteger(age) || age < 13 || age > 100) return "Enter an age between 13 and 100.";
      return f.gender ? null : "Choose a gender.";
    }
    case 1: {
      const h = num(f.height), w = num(f.weight);
      if (!(h >= 100 && h <= 250)) return "Enter a height between 100 and 250 cm.";
      if (!(w >= 25 && w <= 300)) return "Enter a weight between 25 and 300 kg.";
      return null;
    }
    case 2: return f.activity ? null : "Choose your activity level.";
    case 3: return f.diet ? null : "Choose a diet preference.";
    default: return f.goal ? null : "Choose a fitness goal.";
  }
}

function Wizard() {
  const { user, refresh } = useAuth();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<NutritionSummary | null>(null);

  const next = async () => {
    const problem = validate(step, f);
    if (problem) return setError(problem);
    setError(null);
    if (step < TOTAL - 1) return setStep(step + 1);

    setBusy(true);
    const body: UserProfileInput = {
      age: Number(f.age), gender: f.gender as UserProfileInput["gender"], height_cm: Number(f.height), weight_kg: Number(f.weight),
      activity_level: f.activity as UserProfileInput["activity_level"], dietary_preference: f.diet as UserProfileInput["dietary_preference"], fitness_goal: f.goal as UserProfileInput["fitness_goal"],
    };
    try {
      await (user?.profile_complete ? profileApi.update(body) : profileApi.create(body));
      await refresh();
      setResult(await nutritionApi.summary());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (busy && !result) return <Spinner label="Calculating your targets" />;

  if (result) {
    const t = result.targets;
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Your daily targets</h1>
        <p className="mt-2 text-muted">Calculated from your profile and saved to your account.</p>
        <Card className="mt-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat label="BMI" value={t.bmi} sub={t.bmi_category} />
            <Stat label="BMR" value={Math.round(t.bmr)} unit="kcal" />
            <Stat label="TDEE" value={Math.round(t.tdee)} unit="kcal" />
            <Stat label="Daily target" value={t.daily_calorie_target} unit="kcal" />
          </div>
          <div className="mt-6 border-t border-line pt-6">
            <MacroDonut protein={t.protein_target} carbs={t.carbs_target} fat={t.fat_target} />
            <p className="mt-4 text-sm text-muted">Protein {t.protein_target} g · Carbohydrates {t.carbs_target} g · Fat {t.fat_target} g</p>
          </div>
        </Card>
        <p className="mt-4 text-sm text-muted">{DISCLAIMER}</p>
        <div className="mt-6"><LinkButton href="/dashboard">Go to dashboard</LinkButton></div>
      </div>
    );
  }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF({ ...f, [k]: v }); setError(null); };
  const titles = ["The basics", "Your body", "Your lifestyle", "Your diet", "Your goal"];

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between"><Logo href="/" /><span className="text-sm font-medium text-muted">Step {step + 1} of {TOTAL}</span></div>
      <div className="mb-8 h-1.5 rounded-full bg-surface" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step + 1} aria-label="Onboarding progress">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
      </div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{titles[step]}</h1>

      <div className="mt-6 space-y-4">
        {error && <Alert>{error}</Alert>}
        {step === 0 && (<>
          <Field id="age" label="Age" type="number" inputMode="numeric" min={13} max={100} value={f.age} onChange={(e) => set("age", e.target.value)} />
          <div role="radiogroup" aria-label="Gender" className="grid grid-cols-2 gap-3">
            {GENDERS.map((g) => <Choice key={g.value} label={g.label} selected={f.gender === g.value} onClick={() => set("gender", g.value)} />)}
          </div>
          <p className="text-sm text-muted">We use the sex-specific Mifflin-St Jeor equation, which needs one of these two options.</p>
        </>)}
        {step === 1 && (<>
          <Field id="height" label="Height (cm)" type="number" inputMode="decimal" min={100} max={250} value={f.height} onChange={(e) => set("height", e.target.value)} />
          <Field id="weight" label="Weight (kg)" type="number" inputMode="decimal" min={25} max={300} value={f.weight} onChange={(e) => set("weight", e.target.value)} />
        </>)}
        {step === 2 && <div role="radiogroup" aria-label="Activity level" className="space-y-3">{ACTIVITY_LEVELS.map((o) => <Choice key={o.value} label={o.label} hint={o.hint} selected={f.activity === o.value} onClick={() => set("activity", o.value)} />)}</div>}
        {step === 3 && <div role="radiogroup" aria-label="Diet preference" className="grid gap-3 sm:grid-cols-2">{DIETS.map((o) => <Choice key={o.value} label={o.label} selected={f.diet === o.value} onClick={() => set("diet", o.value)} />)}</div>}
        {step === 4 && <div role="radiogroup" aria-label="Fitness goal" className="space-y-3">{GOALS.map((o) => <Choice key={o.value} label={o.label} hint={o.hint} selected={f.goal === o.value} onClick={() => set("goal", o.value)} />)}</div>}
      </div>

      <div className="mt-8 flex items-center justify-between">
        {step > 0 ? <Button variant="ghost" onClick={() => { setError(null); setStep(step - 1); }}><ArrowLeft className="h-4 w-4" aria-hidden /> Back</Button> : <Link href="/" className="text-sm text-muted hover:text-ink">Cancel</Link>}
        <Button onClick={next} loading={busy}>{step === TOTAL - 1 ? "Calculate my targets" : "Continue"} {step < TOTAL - 1 && <ArrowRight className="h-4 w-4" aria-hidden />}</Button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AuthGuard mode="onboarding">
      <Wizard />
    </AuthGuard>
  );
}
