import type { HydrationLog, HydrationToday } from "@/types";
import { tzOffset } from "@/lib/time";
import { request } from "./client";

export const hydrationApi = {
  today: () => request<HydrationToday>("/api/hydration/today", { query: { tz_offset: tzOffset() } }),
  add: (amount_ml: number) => request<HydrationLog>("/api/hydration", { method: "POST", body: { amount_ml } }),
  remove: (id: number) => request<void>(`/api/hydration/${id}`, { method: "DELETE" }),
};
