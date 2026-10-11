import { Badge } from "@/components/ui";
import { FEATURES } from "@/lib/content";

export const metadata = { title: "Features — NutriGuide AI" };

export default function Features() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Features</h1>
      <p className="mt-3 max-w-xl text-muted">What works today, and what is planned. Features marked “Coming soon” are not implemented yet.</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <article key={f.title} className="rounded-2xl border border-line bg-card p-6 transition duration-200 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-lift dark:hover:shadow-none">
            <div className="mb-3 flex items-center justify-between">
              <f.icon className={f.status === "live" ? "h-7 w-7 text-brand-accent" : "h-7 w-7 text-muted"} aria-hidden />
              <Badge tone={f.status === "live" ? "live" : "soon"}>{f.status === "live" ? "Available now" : "Coming soon"}</Badge>
            </div>
            <h2 className="text-lg font-semibold">{f.title}</h2>
            <p className="mt-1 text-muted">{f.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
