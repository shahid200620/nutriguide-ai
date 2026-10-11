import type { NutritionSummary, NutritionTargets } from "@/types";
import { localDate, tzOffset } from "@/lib/time";
import { request } from "./client";

export const nutritionApi = {
  summary: () => request<NutritionSummary>("/api/nutrition/summary", { query: { date: localDate(), tz_offset: tzOffset() } }),
  calculate: () => request<NutritionTargets>("/api/nutrition/calculate", { method: "POST" }),
};
