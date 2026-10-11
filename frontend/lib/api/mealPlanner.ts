import type { MealPlan } from "@/types";
import { request } from "./client";

export const mealPlannerApi = {
  forDate: async (date: string): Promise<MealPlan | null> => {
    const plans = await request<MealPlan[]>("/api/meal-planner", { query: { date } });
    return plans[0] ?? null;
  },
  generate: (date: string) => request<MealPlan>("/api/meal-planner/generate", { method: "POST", body: { date } }),
  remove: (id: number) => request<void>(`/api/meal-planner/${id}`, { method: "DELETE" }),
};
