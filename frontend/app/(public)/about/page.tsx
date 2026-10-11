export const metadata = { title: "About — NutriGuide AI" };

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About NutriGuide AI</h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
        <p>NutriGuide AI is a final-year project: “A Deep Learning Based Food Recognition and Personalized Nutrition Recommendation System”.</p>
        <p>The long-term goal is to combine computer vision, machine learning and nutrition science. This first milestone builds the full-stack foundation: accounts, profiles, nutrition calculations, a dashboard, a meal planner and hydration tracking, all backed by a real database.</p>
      </div>
      <h2 className="mt-10 text-2xl font-bold">What is and is not AI today</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
        <li>Nutrition targets come from standard published formulas, not a learned model.</li>
        <li>The meal planner is rule-based. It is not a machine-learning model.</li>
        <li>Food recognition (YOLO), label scanning (OCR) and ML recommendations are planned. No model is trained or integrated yet, and no accuracy is claimed.</li>
      </ul>
      <h2 className="mt-10 text-2xl font-bold">Built with</h2>
      <p className="mt-3 text-muted">Next.js, TypeScript, Tailwind CSS and Recharts on the front end; FastAPI, SQLAlchemy and PostgreSQL on the back end.</p>
      <p className="mt-10 rounded-xl bg-surface p-4 text-sm text-muted">NutriGuide AI is a nutrition and fitness management application, not a medical diagnosis system.</p>
    </div>
  );
}
