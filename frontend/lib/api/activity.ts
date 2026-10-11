import type { StreakSummary } from "@/types";
import { tzOffset } from "@/lib/time";
import { request } from "./client";

export const activityApi = {
  streak: (days = 84) => request<StreakSummary>("/api/activity/streak", { query: { days, tz_offset: tzOffset() } }),
};
