import type { TokenResponse, User } from "@/types";
import { request } from "./client";

export const authApi = {
  register: (b: { name: string; email: string; password: string; confirm_password: string }) =>
    request<TokenResponse>("/api/auth/register", { method: "POST", body: b, auth: false }),
  login: (b: { email: string; password: string }) =>
    request<TokenResponse>("/api/auth/login", { method: "POST", body: b, auth: false }),
  me: () => request<User>("/api/auth/me"),
};
