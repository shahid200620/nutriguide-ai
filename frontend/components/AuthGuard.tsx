"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "./ui";

/**
 * Client-side route protection.
 * mode="app": needs login AND a completed profile (else -> /onboarding)
 * mode="onboarding": needs login only (completed users may revisit to redo their answers)
 * The backend enforces the same rules on every API call - this is only for navigation.
 */
export function AuthGuard({ mode = "app", children }: { mode?: "app" | "onboarding"; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const redirect = !loading && (!user ? "/login" : mode === "app" && !user.profile_complete ? "/onboarding" : null);

  useEffect(() => {
    if (redirect) router.replace(redirect);
  }, [redirect, router]);

  if (loading || redirect || !user) return <Spinner label="Loading your account" />;
  return <>{children}</>;
}
