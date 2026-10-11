"use client";

import type { ReactNode } from "react";
import { Cell, Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { useTheme } from "@/lib/theme";

// Chart colours that need a lighter variant on dark backgrounds (macro/water colours already work on both).
export const RING_TRACK = { light: "#EFEFEF", dark: "#2C3430" };
export const BRAND_RING = { light: "#1F7A5A", dark: "#3DB383" };

/** Circular progress ring. `value` and `max` are in the same unit. */
export function ProgressRing({ value, max, color, size = 170, children, label }: { value: number; max: number; color: string; size?: number; children?: ReactNode; label: string }) {
  const { theme } = useTheme();
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${Math.round(pct)}%`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="80%" outerRadius="100%" data={[{ name: label, value: pct }]} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />
          <RadialBar dataKey="value" angleAxisId={0} background={{ fill: RING_TRACK[theme] }} fill={color} cornerRadius={20} isAnimationActive={false} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export const MACRO_COLORS = { protein: "#E0693B", carbs: "#E3A82B", fat: "#4C7BD9" };

/** Donut showing how a calorie budget is split between macros (grams -> kcal share). */
export function MacroDonut({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const data = [
    { name: "Protein", kcal: protein * 4, color: MACRO_COLORS.protein },
    { name: "Carbs", kcal: carbs * 4, color: MACRO_COLORS.carbs },
    { name: "Fat", kcal: fat * 9, color: MACRO_COLORS.fat },
  ];
  const total = data.reduce((s, d) => s + d.kcal, 0) || 1;
  return (
    <div className="flex items-center gap-5">
      <div className="h-36 w-36 shrink-0" role="img" aria-label="Macronutrient calorie split">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="kcal" innerRadius="62%" outerRadius="100%" paddingAngle={2} stroke="none" isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: d.color }} aria-hidden />
            <span className="font-medium">{d.name}</span>
            <span className="text-muted">{Math.round((d.kcal / total) * 100)}% of calories</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
