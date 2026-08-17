import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Check, Trash2, Wand2 } from "lucide-react";

import { generateSchedule } from "@/lib/ai.functions";
import {
  actions,
  prettyDate,
  todayISO,
  useAppState,
  weekDates,
  type Priority,
  type ScheduleBlock,
} from "@/lib/store";
import { AiBadge, EmptyState, ResponsibleNotice } from "@/components/ai-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Draft = Omit<ScheduleBlock, "id">;

export function Planner({ range }: { range: "day" | "week" }) {
  const runPlan = useServerFn(generateSchedule);
  const tasks = useAppState((s) => s.tasks);
  const schedule = useAppState((s) => s.schedule);
  const settings = useAppState((s) => s.settings);

  const [startDate, setStartDate] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Draft[] | null>(null);
  const [unscheduled, setUnscheduled] = useState<string[]>([]);
  const [summary, setSummary] = useState("");

  const dates = range === "day" ? [startDate] : weekDates(startDate);
  const applied = schedule
    .filter((b) => dates.includes(b.date))
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

  async function plan() {
    const open = tasks.filter((t) => !t.done);
    if (open.length === 0) {
      toast.error("Add some open tasks first — the AI won't invent any.");
      return;
    }
    setLoading(true);
    try {
      const res = await runPlan({
        data: {
          range,
          startDate,
          workingHours: `${settings.workStart}-${settings.workEnd}`,
          notes,
          tasks: open.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            category: t.category,
            due: t.due,
            estimateMinutes: t.estimateMinutes,
          })),
        },
      });
      setDraft(
        res.blocks.map((b) => ({
          taskId: b.taskId,
          title: b.title,
          date: b.date,
          start: b.start,
          end: b.end,
          priority: (["low", "medium", "high"].includes(b.priority)
            ? b.priority
            : "medium") as Priority,
          reason: b.reason,
          aiGenerated: true,
        })),
      );
      setUnscheduled(res.unscheduled);
      setSummary(res.summary);
      toast.success("Suggested schedule ready — review before applying.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not build a schedule.");
    } finally {
      setLoading(false);
    }
  }

  function patchDraft(i: number, patch: Partial<Draft>) {
    setDraft((d) => d?.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) ?? d);
  }

  return (
    <>
      <ResponsibleNotice kind="planning" />

      <section className="surface-card grid gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="start">{range === "day" ? "Day" : "Week starting"}</Label>
          <Input
            id="start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Availability notes (optional)</Label>
          <Textarea
            id="notes"
            rows={2}
            placeholder="Lecture 10:00–12:00, gym after 18:00"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <Button disabled={loading} onClick={plan}>
          <Wand2 className="h-4 w-4" />
          {loading ? "Planning…" : range === "day" ? "Plan my day" : "Plan my week"}
        </Button>
      </section>

      {draft && (
        <section className="surface-card space-y-4 border-ai/30 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Suggested schedule</h2>
            <AiBadge label="AI Suggestion" />
          </div>
          {summary && <p className="text-sm text-muted-foreground">{summary}</p>}

          <ul className="space-y-2">
            {draft.map((b, i) => (
              <li key={i} className="rounded-lg border border-border p-3">
                <Input
                  className="mb-2"
                  value={b.title}
                  onChange={(e) => patchDraft(i, { title: e.target.value })}
                />
                <div className="grid gap-2 sm:grid-cols-4">
                  <Input
                    type="date"
                    value={b.date}
                    onChange={(e) => patchDraft(i, { date: e.target.value })}
                  />
                  <Input
                    type="time"
                    value={b.start}
                    onChange={(e) => patchDraft(i, { start: e.target.value })}
                  />
                  <Input
                    type="time"
                    value={b.end}
                    onChange={(e) => patchDraft(i, { end: e.target.value })}
                  />
                  <Select
                    value={b.priority}
                    onValueChange={(v) => patchDraft(i, { priority: v as Priority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {b.reason && <p className="mt-2 text-xs text-muted-foreground">{b.reason}</p>}
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2"
                  onClick={() => setDraft((d) => d?.filter((_, idx) => idx !== i) ?? d)}
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </Button>
              </li>
            ))}
          </ul>

          {unscheduled.length > 0 && (
            <div className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Didn't fit in your available time</p>
              <ul className="mt-1 list-disc pl-5">
                {unscheduled.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button
              onClick={() => {
                actions.applySchedule(draft, dates);
                setDraft(null);
                toast.success("Schedule applied to your calendar.");
              }}
            >
              <Check className="h-4 w-4" /> Confirm & apply
            </Button>
            <Button variant="outline" disabled={loading} onClick={plan}>
              <Wand2 className="h-4 w-4" /> Regenerate
            </Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Discard
            </Button>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <CalendarClock className="h-4 w-4" /> Your confirmed schedule
        </h2>
        {applied.length === 0 ? (
          <EmptyState
            title="Nothing scheduled yet"
            hint="Generate a suggestion above, review it, then confirm to apply."
          />
        ) : (
          <ul className="space-y-2">
            {applied.map((b) => (
              <li key={b.id} className="surface-card grid gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate font-medium">{b.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {prettyDate(b.date)} · {b.start}–{b.end} · {b.priority}
                  </p>
                </div>
                <div className="flex gap-2 sm:justify-end">
                  {b.aiGenerated && <AiBadge />}
                  <Button size="icon" variant="ghost" aria-label="Remove block" onClick={() => actions.deleteBlock(b.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
