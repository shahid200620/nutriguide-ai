"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, tokenStore } from "@/lib/api";
import type { TokenResponse, User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (b: { name: string; email: string; password: string; confirm_password: string }) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      return;
    }
    try {
      setUser(await authApi.me());
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const accept = (res: TokenResponse) => {
    tokenStore.set(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const value: AuthState = {
    user,
    loading,
    login: async (email, password) => accept(await authApi.login({ email, password })),
    register: async (b) => accept(await authApi.register(b)),
    logout: () => {
      tokenStore.clear();
      setUser(null);
    },
    refresh,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
