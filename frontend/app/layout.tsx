import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

const font = Figtree({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "NutriGuide AI — Your AI-Powered Personal Nutrition & Fitness Guide",
  description: "Personalized calorie and macro targets, meal planning, meal tracking and hydration tracking. AI food recognition is on the roadmap.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: THEME_INIT_SCRIPT adds the "dark" class before React hydrates.
    <html lang="en" className={font.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
