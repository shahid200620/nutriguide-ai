import type { Config } from "tailwindcss";

// Design tokens: clean, airy, Airbnb-style surfaces with a nutrition-green brand colour.
// Surface/text colours are CSS variables (see app/globals.css) so light and dark mode share one set of class names.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: token("brand-50"),
          100: token("brand-100"),
          500: "#2E9468",
          600: "#1F7A5A",
          700: "#17614A",
          fg: token("brand-fg"),         // brand-coloured TEXT (700 in light, a light green in dark)
          accent: token("brand-accent"), // brand-coloured icons / small accents (600 in light)
        },
        ink: token("ink"),
        muted: token("muted"),
        line: token("line"),
        surface: token("surface"), // tiles and bands
        canvas: token("canvas"),   // page background on public pages
        page: token("page"),       // page background behind cards in the app
        card: token("card"),
        track: token("track"),     // empty part of progress rings
        protein: "#E0693B",
        carbs: "#E3A82B",
        fat: "#4C7BD9",
        water: "#2F80ED",
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      boxShadow: { card: "0 1px 2px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", lift: "0 2px 4px rgba(0,0,0,0.06), 0 10px 28px rgba(0,0,0,0.08)" },
      keyframes: { "fade-down": { from: { opacity: "0", transform: "translateY(-6px)" }, to: { opacity: "1", transform: "none" } } },
      animation: { "fade-down": "fade-down 160ms ease-out" },
    },
  },
  plugins: [],
};
export default config;
