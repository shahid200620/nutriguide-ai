"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LogoMark } from "./Logo";
import { Alert, Button, Field } from "./ui";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm_password: "" });
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const signup = mode === "signup";

  function validate() {
    const e: Record<string, string> = {};
    if (signup && !f.name.trim()) e.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address.";
    if (signup && f.password.length < 8) e.password = "Use at least 8 characters.";
    if (!signup && !f.password) e.password = "Enter your password.";
    if (signup && f.confirm_password !== f.password) e.confirm_password = "Passwords do not match.";
    setFieldErr(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    if (!validate()) return;
    setBusy(true);
    try {
      if (signup) {
        await register({ name: f.name.trim(), email: f.email.trim(), password: f.password, confirm_password: f.confirm_password });
        router.replace("/onboarding");
      } else {
        const user = await login(f.email.trim(), f.password);
        router.replace(user.profile_complete ? "/dashboard" : "/onboarding");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <LogoMark className="mb-5 h-12 w-12" />
      <h1 className="text-3xl font-bold tracking-tight">{signup ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-2 text-muted">{signup ? "It takes about two minutes to get your personal targets." : "Log in to see your dashboard."}</p>
      <form onSubmit={submit} noValidate className="mt-8 space-y-4">
        {error && <Alert>{error}</Alert>}
        {signup && <Field id="name" label="Name" autoComplete="name" value={f.name} onChange={set("name")} error={fieldErr.name} />}
        <Field id="email" label="Email" type="email" autoComplete="email" value={f.email} onChange={set("email")} error={fieldErr.email} />
        <Field id="password" label="Password" type="password" autoComplete={signup ? "new-password" : "current-password"} value={f.password} onChange={set("password")} error={fieldErr.password} hint={signup ? "At least 8 characters." : undefined} />
        {signup && <Field id="confirm" label="Confirm password" type="password" autoComplete="new-password" value={f.confirm_password} onChange={set("confirm_password")} error={fieldErr.confirm_password} />}
        <Button type="submit" loading={busy} className="w-full">{signup ? "Create account" : "Log in"}</Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        {signup ? "Already have an account? " : "New to NutriGuide AI? "}
        <Link href={signup ? "/login" : "/signup"} className="font-semibold text-brand-fg hover:underline">{signup ? "Log in" : "Create an account"}</Link>
      </p>
    </div>
  );
}
