import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CalendarRange,
  ListPlus,
  Mail,
  Search,
  Clock,
  AlertTriangle,
} from "lucide-react";

import { AiBadge, EmptyState, PageHeader, ResponsibleNotice } from "@/components/ai-bits";
import { addDaysISO, prettyDate, todayISO, useAppState } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aura AI Productivity Assistant" },
      {
        name: "description",
        content:
          "One workspace to research topics, draft emails, plan your day and track your progress.",
      },
      { property: "og:title", content: "Dashboard — Aura AI Productivity Assistant" },
      {
        property: "og:description",
        content:
          "One workspace to research topics, draft emails, plan your day and track your progress.",
      },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  { to: "/email", label: "Generate Email", icon: Mail },
  { to: "/tasks", label: "Add Task", icon: ListPlus },
  { to: "/planner", label: "Plan My Day", icon: CalendarDays },
  { to: "/weekly", label: "Plan My Week", icon: CalendarRange },
  { to: "/research", label: "Research Topic", icon: Search },
] as const;

function Dashboard() {
  const tasks = useAppState((s) => s.tasks);
  const schedule = useAppState((s) => s.schedule);
  const emails = useAppState((s) => s.emails);
  const research = useAppState((s) => s.research);
  const name = useAppState((s) => s.settings.name);

  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const today = todayISO();
  const todaysTasks = tasks.filter((t) => !t.done && t.due === today);
  const priorityTasks = tasks.filter((t) => !t.done && t.priority === "high");
  const soon = tasks
    .filter((t) => !t.done && t.due && t.due <= addDaysISO(today, 7) && t.due >= today)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 5);
  const todaysBlocks = schedule
    .filter((b) => b.date === today)
    .sort((a, b) => a.start.localeCompare(b.start));
  const weekTasks = tasks.filter((t) => t.due >= addDaysISO(today, -6) && t.due <= today);
  const weekProgress = weekTasks.length
    ? Math.round((weekTasks.filter((t) => t.done).length / weekTasks.length) * 100)
    : 0;

  const recommendations = [
    priorityTasks.length > 0
      ? `You have ${priorityTasks.length} high-priority task${priorityTasks.length > 1 ? "s" : ""} open — start with "${priorityTasks[0]!.title}".`
      : null,
    todaysBlocks.length === 0 && tasks.some((t) => !t.done)
      ? "No time blocks today. Run Plan My Day to draft a schedule you can review."
      : null,
    tasks.length === 0 ? "Add your first task, or start from a research topic." : null,
    research.length > 0 ? "Turn your latest research into a follow-up task to keep momentum." : null,
  ].filter(Boolean) as string[];

  return (
    <>
      <section className="gradient-hero rounded-2xl p-5 text-primary-foreground sm:p-7">
        <p className="text-sm opacity-90">{now || "\u00a0"}</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Welcome back, {name || "there"}</h1>
        <p className="mt-2 max-w-xl text-sm opacity-90">
          Research → create tasks → prioritise → schedule → communicate → complete → analyse. One
          assistant for all of it.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-background/25"
            >
              <a.icon className="h-4 w-4" />
              {a.label}
            </Link>
          ))}
        </div>
      </section>

      <ResponsibleNotice kind="general" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Open tasks", value: tasks.filter((t) => !t.done).length },
          { label: "Due today", value: todaysTasks.length },
          { label: "High priority", value: priorityTasks.length },
          { label: "Blocks today", value: todaysBlocks.length },
        ].map((s) => (
          <div key={s.label} className="surface-card p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card space-y-3 p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Clock className="h-4 w-4" /> Today's schedule
          </h2>
          {todaysBlocks.length === 0 ? (
            <EmptyState title="No blocks today" hint="Use Plan My Day to draft one." />
          ) : (
            <ul className="space-y-2">
              {todaysBlocks.map((b) => (
                <li key={b.id} className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
                  <span className="shrink-0 text-sm font-semibold">{b.start}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{b.title}</span>
                    <span className="text-xs text-muted-foreground">until {b.end}</span>
                  </span>
                  {b.aiGenerated && <AiBadge />}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card space-y-3 p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-4 w-4" /> Upcoming deadlines
          </h2>
          {soon.length === 0 ? (
            <EmptyState title="Nothing due this week" hint="Add deadlines in My Tasks." />
          ) : (
            <ul className="space-y-2">
              {soon.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm">{t.title}</span>
                  <Badge variant="secondary" className="shrink-0">
                    {prettyDate(t.due)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-border pt-3">
            <p className="text-sm font-medium">Weekly progress</p>
            <Progress className="mt-2" value={weekProgress} />
            <p className="mt-1 text-xs text-muted-foreground">{weekProgress}% of this week's tasks done</p>
          </div>
        </section>

        <section className="surface-card space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">AI recommendations</h2>
            <AiBadge label="AI Suggestion" />
          </div>
          {recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">You're on track — nothing to flag.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {recommendations.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card space-y-4 p-4 sm:p-5">
          <div>
            <h2 className="text-base font-semibold">Recent emails</h2>
            {emails.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">No drafts saved yet.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {emails.slice(0, 3).map((e) => (
                  <li key={e.id} className="truncate">
                    <Link to="/saved-emails" className="hover:underline">
                      {e.subject || "(no subject)"}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold">Recent research</h2>
            {research.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">No research saved yet.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {research.slice(0, 3).map((r) => (
                  <li key={r.id} className="truncate">
                    <Link to="/saved-research" className="hover:underline">
                      {r.topic}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <PageHeader
        title="Your workflow"
        description="Every AI output is a suggestion: review, edit, then confirm before it touches your data."
      />
    </>
  );
}
