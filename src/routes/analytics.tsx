import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader, ResponsibleNotice } from "@/components/ai-bits";
import { addDaysISO, prettyDate, todayISO, useAppState } from "@/lib/store";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Aura" },
      { name: "description", content: "Track completion rate, focus time and weekly progress." },
      { property: "og:title", content: "Analytics — Aura" },
      { property: "og:description", content: "Track completion rate, focus time and weekly progress." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const tasks = useAppState((s) => s.tasks);
  const schedule = useAppState((s) => s.schedule);
  const emails = useAppState((s) => s.emails);
  const research = useAppState((s) => s.research);

  const done = tasks.filter((t) => t.done).length;
  const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const start = addDaysISO(todayISO(), -6);
  const data = Array.from({ length: 7 }, (_, i) => {
    const d = addDaysISO(start, i);
    return {
      day: prettyDate(d).split(",")[0],
      scheduled: schedule.filter((b) => b.date === d).length,
      due: tasks.filter((t) => t.due === d).length,
    };
  });

  const plannedMinutes = schedule.reduce((sum, b) => {
    const [sh, sm] = b.start.split(":").map(Number);
    const [eh, em] = b.end.split(":").map(Number);
    const mins = (eh ?? 0) * 60 + (em ?? 0) - ((sh ?? 0) * 60 + (sm ?? 0));
    return sum + (Number.isFinite(mins) && mins > 0 ? mins : 0);
  }, 0);

  const stats = [
    { label: "Tasks created", value: tasks.length },
    { label: "Completed", value: done },
    { label: "Planned focus time", value: `${Math.round(plannedMinutes / 60)}h` },
    { label: "Emails + research saved", value: emails.length + research.length },
  ];

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Everything here is measured from your own activity — no estimates or invented numbers."
      />
      <ResponsibleNotice kind="general" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface-card p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="surface-card space-y-3 p-4 sm:p-5">
        <h2 className="text-base font-semibold">Completion rate</h2>
        <Progress value={rate} />
        <p className="text-sm text-muted-foreground">
          {done} of {tasks.length} tasks completed ({rate}%).
        </p>
      </section>

      <section className="surface-card space-y-3 p-4 sm:p-5">
        <h2 className="text-base font-semibold">Last 7 days</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="scheduled" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="due" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}
