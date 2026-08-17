import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AiBadge, EmptyState, PageHeader, ResponsibleNotice } from "@/components/ai-bits";
import { Button } from "@/components/ui/button";
import { actions, addDaysISO, prettyDate, todayISO, useAppState, weekDates } from "@/lib/store";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Aura" },
      { name: "description", content: "A mobile-friendly week view of your confirmed schedule." },
      { property: "og:title", content: "Calendar — Aura" },
      {
        property: "og:description",
        content: "A mobile-friendly week view of your confirmed schedule.",
      },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const [start, setStart] = useState(todayISO());
  const schedule = useAppState((s) => s.schedule);
  const tasks = useAppState((s) => s.tasks);
  const days = weekDates(start);

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Only blocks you confirmed appear here. Nothing is added automatically."
        action={
          <div className="flex shrink-0 gap-2">
            <Button size="icon" variant="outline" aria-label="Previous week" onClick={() => setStart(addDaysISO(start, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setStart(todayISO())}>
              Today
            </Button>
            <Button size="icon" variant="outline" aria-label="Next week" onClick={() => setStart(addDaysISO(start, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />
      <ResponsibleNotice kind="planning" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {days.map((d) => {
          const blocks = schedule
            .filter((b) => b.date === d)
            .sort((a, b) => a.start.localeCompare(b.start));
          const due = tasks.filter((t) => t.due === d && !t.done);
          return (
            <section key={d} className="surface-card min-w-0 space-y-2 p-3">
              <h2 className="text-sm font-semibold">{prettyDate(d)}</h2>
              {blocks.length === 0 && due.length === 0 && (
                <p className="text-xs text-muted-foreground">Nothing scheduled.</p>
              )}
              {blocks.map((b) => (
                <div key={b.id} className="rounded-lg bg-muted/60 p-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-medium">{b.title}</p>
                    <button
                      aria-label="Remove block"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => actions.deleteBlock(b.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {b.start}–{b.end}
                  </p>
                  {b.aiGenerated && <AiBadge className="mt-1" />}
                </div>
              ))}
              {due.map((t) => (
                <p key={t.id} className="truncate text-xs text-destructive">
                  Due: {t.title}
                </p>
              ))}
            </section>
          );
        })}
      </div>

      {schedule.length === 0 && (
        <EmptyState
          title="Your calendar is empty"
          hint="Use the daily or weekly planner to build a schedule, then confirm it."
        />
      )}
    </>
  );
}
