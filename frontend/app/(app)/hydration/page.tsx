"use client";

import { Droplets, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { ProgressRing } from "@/components/charts";
import { Alert, Button, Card, EmptyState, ErrorState, Field, Skeleton, Stat } from "@/components/ui";
import { useAsync } from "@/hooks/useAsync";
import { hydrationApi } from "@/lib/api";
import { QUICK_ADD_ML } from "@/lib/constants";

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function HydrationPage() {
  const { data, error, loading, reload } = useAsync(() => hydrationApi.today(), []);
  const [custom, setCustom] = useState("");
  const [customErr, setCustomErr] = useState<string | undefined>();
  const [busy, setBusy] = useState<number | "custom" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function add(amount: number, key: number | "custom") {
    setBusy(key);
    setActionError(null);
    try {
      await hydrationApi.add(amount);
      if (key === "custom") setCustom("");
      reload(true);
    } catch {
      setActionError("Unable to save hydration entry.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: number) {
    setActionError(null);
    try {
      await hydrationApi.remove(id);
      reload(true);
    } catch {
      setActionError("Unable to remove that entry. Please try again.");
    }
  }

  function submitCustom(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(custom);
    if (!Number.isInteger(n) || n < 1 || n > 5000) return setCustomErr("Enter a whole number between 1 and 5000 ml.");
    setCustomErr(undefined);
    add(n, "custom");
  }

  return (
    <>
      <PageHeader title="Hydration" subtitle="Log water through the day." />
      {loading ? (
        <div className="space-y-5" aria-busy="true"><Skeleton className="h-72" /><Skeleton className="h-40" /></div>
      ) : error || !data ? (
        <ErrorState message={error ?? "Something went wrong. Please try again."} onRetry={() => reload()} />
      ) : (
        <div className="space-y-5">
          <Card>
            <div className="grid items-center gap-6 sm:grid-cols-[200px_1fr]">
              <ProgressRing value={data.consumed_ml} max={data.target_ml} color="#2F80ED" size={180} label="Hydration progress">
                <span className="text-4xl font-bold tabular-nums">{data.percent}%</span>
                <span className="text-sm text-muted">of daily target</span>
              </ProgressRing>
              <div className="grid grid-cols-3 gap-4">
                <Stat label="Daily target" value={data.target_ml} unit="ml" sub="Estimate" />
                <Stat label="Consumed" value={data.consumed_ml} unit="ml" />
                <Stat label="Remaining" value={data.remaining_ml} unit="ml" />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted">The target is an estimate based on your body weight. Your needs vary with activity, climate and health.</p>
          </Card>

          <Card title="Add water">
            {actionError && <div className="mb-4"><Alert>{actionError}</Alert></div>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {QUICK_ADD_ML.map((ml) => (
                <Button key={ml} variant="secondary" onClick={() => add(ml, ml)} loading={busy === ml} disabled={busy !== null}>
                  <Droplets className="h-4 w-4 text-water" aria-hidden /> {ml} ml
                </Button>
              ))}
            </div>
            <form onSubmit={submitCustom} className="mt-4 flex items-start gap-3" noValidate>
              <div className="flex-1"><Field id="custom-ml" label="Custom amount (ml)" type="number" inputMode="numeric" min={1} max={5000} value={custom} onChange={(e) => setCustom(e.target.value)} error={customErr} /></div>
              <Button type="submit" className="mt-[30px]" loading={busy === "custom"} disabled={busy !== null}>Add</Button>
            </form>
          </Card>

          <Card title="Today's log">
            {data.entries.length === 0 ? (
              <EmptyState icon={<Droplets className="h-6 w-6" />} title="No water logged today." body="Use the buttons above to add your first glass." />
            ) : (
              <ul className="divide-y divide-line">
                {data.entries.map((e) => (
                  <li key={e.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold tabular-nums">{e.amount_ml} ml</p>
                      <p className="text-sm text-muted">{time(e.logged_at)}</p>
                    </div>
                    <Button variant="ghost" onClick={() => remove(e.id)} aria-label={`Delete ${e.amount_ml} ml entry`}><Trash2 className="h-4 w-4" aria-hidden /></Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
