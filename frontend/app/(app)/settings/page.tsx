"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/AppShell";
import { ThemeSwitch } from "@/components/ThemeToggle";
import { Button, Card } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { DISCLAIMER } from "@/lib/constants";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <>
      <PageHeader title="Settings" />
      <div className="space-y-5">
        <Card title="Account">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div><dt className="text-sm text-muted">Name</dt><dd className="font-semibold">{user?.name}</dd></div>
            <div><dt className="text-sm text-muted">Email</dt><dd className="font-semibold">{user?.email}</dd></div>
          </dl>
          <Button variant="secondary" className="mt-5" onClick={() => { logout(); router.replace("/"); }}>Log out</Button>
        </Card>
        <Card title="Appearance">
          <p className="mb-4 text-muted">Choose how NutriGuide AI looks. Your choice is remembered on this device.</p>
          <ThemeSwitch />
        </Card>
        <Card title="About your targets">
          <p className="text-muted">{DISCLAIMER}</p>
          <p className="mt-3 text-muted">Targets use the Mifflin-St Jeor equation, standard activity multipliers and a modest goal-based calorie adjustment. The water target is estimated from body weight. More preferences, units and notification options will arrive in later phases.</p>
        </Card>
      </div>
    </>
  );
}
