import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted">Your AI-Powered Personal Nutrition &amp; Fitness Guide.</p>
        </div>
        <div className="text-sm text-muted md:text-right">
          <nav className="mb-3 flex gap-5 md:justify-end" aria-label="Footer">
            <Link href="/features" className="hover:text-ink">Features</Link>
            <Link href="/how-it-works" className="hover:text-ink">How it works</Link>
            <Link href="/about" className="hover:text-ink">About</Link>
          </nav>
          <p>NutriGuide AI is a nutrition and fitness management app. It is not a medical diagnosis system and does not replace professional medical or dietary advice.</p>
        </div>
      </div>
    </footer>
  );
}
