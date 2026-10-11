import { LinkButton } from "@/components/ui";
import { STEPS } from "@/lib/content";

export const metadata = { title: "How it works — NutriGuide AI" };

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h1>
      <ol className="mt-8 space-y-6">
        {STEPS.map(([t, b], i) => (
          <li key={t} className="flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{i + 1}</span>
            <div>
              <h2 className="font-semibold">{t}</h2>
              <p className="text-muted">{b}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 text-2xl font-bold">The maths behind your targets</h2>
      <div className="mt-4 space-y-3 rounded-2xl bg-surface p-6 text-[15px] leading-relaxed">
        <p><strong>BMI</strong> = weight (kg) ÷ height (m)²</p>
        <p><strong>BMR</strong> (Mifflin-St Jeor) = 10 × weight + 6.25 × height (cm) − 5 × age, then + 5 for men or − 161 for women</p>
        <p><strong>TDEE</strong> = BMR × an activity multiplier (1.2 to 1.9)</p>
        <p><strong>Calorie target</strong> = TDEE adjusted for your goal: a modest deficit for fat loss, a modest surplus for muscle gain</p>
        <p><strong>Macros</strong> = protein from body weight, fat as a share of calories, carbohydrates from what remains</p>
      </div>
      <p className="mt-4 text-sm text-muted">Nutrition targets are estimates for general wellness and should not replace professional medical or dietary advice.</p>
      <div className="mt-8"><LinkButton href="/signup">Get Started</LinkButton></div>
    </div>
  );
}
