import { Sparkles, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AiBadge({ label = "AI Generated", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-ai-surface px-2 py-0.5 text-[11px] font-semibold text-ai",
        className,
      )}
    >
      <Sparkles className="h-3 w-3" />
      {label}
    </span>
  );
}

export function ResponsibleNotice({ kind }: { kind: "general" | "email" | "planning" | "research" }) {
  const text = {
    general:
      "Responsible AI Notice: AI-generated content may contain errors or incomplete information. Review and verify important information before relying on it or taking action.",
    email:
      "Email Notice: Review AI-generated emails before sending to verify names, dates, attachments, facts and commitments. Nothing is sent from this app.",
    planning:
      "Planning Notice: AI-generated schedules are suggestions. Review and adjust them according to your actual availability and priorities.",
    research:
      "Research Notice: AI-generated summaries, insights and recommendations should be independently verified, especially when making important decisions.",
  }[kind];

  return (
    <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <span>{text}</span>
    </p>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
