import type { ConsumptionRecord, DayConsumption } from "@/types";
import { tzOffset } from "@/lib/time";
import { request } from "./client";

export const mealConsumptionApi = {
  forDay: (date: string) => request<DayConsumption>("/api/meal-consumptions", { query: { date, tz_offset: tzOffset() } }),
  /** Safe to call twice: the server returns the existing record instead of creating a duplicate. */
  consume: (meal_plan_item_id: number, portion = 1) =>
    request<ConsumptionRecord>("/api/meal-consumptions", { method: "POST", body: { meal_plan_item_id, portion }, query: { tz_offset: tzOffset() } }),
  undo: (id: number) => request<void>(`/api/meal-consumptions/${id}`, { method: "DELETE" }),
};
