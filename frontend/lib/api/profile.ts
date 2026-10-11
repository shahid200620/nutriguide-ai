import type { UserProfile, UserProfileInput } from "@/types";
import { request } from "./client";

export const profileApi = {
  get: () => request<UserProfile>("/api/profile"),
  create: (b: UserProfileInput) => request<UserProfile>("/api/profile", { method: "POST", body: b }),
  update: (b: UserProfileInput) => request<UserProfile>("/api/profile", { method: "PUT", body: b }),
};
