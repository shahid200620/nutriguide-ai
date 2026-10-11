import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard mode="app">
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
