import { ArrowRight, Check, Clock, Leaf } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { Badge, LinkButton } from "@/components/ui";
import { FEATURES, STEPS } from "@/lib/content";

const HERO_POINTS = [
  "Calorie and macro targets from your own body metrics and goal",
  "A daily meal plan you can mark as eaten, with undo",
  "Water tracking and a daily consistency streak",
];

export default function Landing() {
  const live = FEATURES.filter((f) => f.status === "live");
  const soon = FEATURES.filter((f) => f.status === "soon");

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-fg">
            <Leaf className="h-4 w-4" aria-hidden /> Personalized nutrition &amp; fitness management
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            Eat to your goal.<span className="block text-brand-fg">Stay consistent.</span>
          </h1>
          <p className="mt-4 text-xl font-medium sm:text-2xl">NutriGuide AI: Your AI-Powered Personal Nutrition &amp; Fitness Guide</p>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            NutriGuide AI turns your age, body metrics and fitness goal into a daily calorie target, a meal plan to follow, and simple tracking for meals and hydration.
          </p>
          <ul className="mt-6 space-y-2.5">
            {HERO_POINTS.map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <Check className="mt-1 h-4 w-4 shrink-0 text-brand-accent" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/signup" className="group">
              Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </LinkButton>
            <LinkButton href="/how-it-works" variant="secondary">See How It Works</LinkButton>
          </div>
          <p className="mt-4 text-sm text-muted">AI food recognition and recommendations are on the roadmap, not built yet. <a href="#roadmap" className="font-semibold text-brand-fg hover:underline">See the roadmap</a>.</p>
        </div>

        {/* "What works today" panel: real capabilities only, no sample numbers */}
        <div className="rounded-2xl border border-line bg-card p-5 shadow-card dark:shadow-none sm:p-6" aria-label="What works today">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <LogoMark className="h-10 w-10" />
            <div>
              <p className="font-semibold leading-tight">Your day with NutriGuide AI</p>
              <p className="text-sm text-muted">What you can do today</p>
            </div>
          </div>
          <ul className="mt-2 divide-y divide-line">
            {live.slice(0, 5).map((f) => (
              <li key={f.title} className="flex items-start gap-3 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-accent">
                  <f.icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">{f.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{f.short ?? f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Available now */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl"><Check className="h-6 w-6 text-brand-accent" aria-hidden /> Available now</h2>
            <p className="mt-2 text-muted">Everything here works today and is backed by a real database.</p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((f) => (
              <li key={f.title} className="rounded-2xl border border-line bg-card p-5 transition duration-200 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-lift dark:hover:shadow-none">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-accent">
                  <f.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">From sign-up to your first plan in minutes</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([title, body], i) => (
            <li key={title}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="scroll-mt-20 border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl"><Clock className="h-6 w-6 text-muted" aria-hidden /> Coming soon</h2>
            <p className="mt-2 text-muted">On the roadmap and <strong className="font-semibold text-ink">not implemented yet</strong>. No model is trained or integrated today, and no accuracy is claimed.</p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {soon.map((f) => (
              <li key={f.title} className="flex gap-4 rounded-2xl border border-dashed border-line bg-card p-5">
                <f.icon className="mt-0.5 h-6 w-6 shrink-0 text-muted" aria-hidden />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{f.title}</h3>
                    <Badge>Coming soon</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final call to action */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-brand-600 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight">Start with your own numbers</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/85">Create an account, answer five short questions, and get calorie and macro targets in under two minutes.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <LinkButton href="/signup" variant="inverse">Create your account</LinkButton>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted">NutriGuide AI is a nutrition and fitness management app, not a medical diagnosis system. Targets are estimates for general wellness.</p>
      </section>
    </>
  );
}
