import { Clock } from "lucide-react";
import { Card } from "./ui";
import { PageHeader } from "./AppShell";

export function ComingSoon({ title, phase, description }: { title: string; phase: string; description: string }) {
  return (
    <>
      <PageHeader title={title} />
      <Card>
        <div className="flex flex-col items-center py-8 text-center">
          <Clock className="mb-3 h-8 w-8 text-muted" aria-hidden />
          <p className="text-lg font-semibold">Coming soon</p>
          <p className="mt-1 max-w-md text-muted">{description}</p>
          <p className="mt-4 rounded-full bg-surface px-3 py-1 text-sm font-medium text-muted">Planned for {phase}</p>
        </div>
      </Card>
    </>
  );
}
