import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Check } from "lucide-react";

import { actions, todayISO, useAppState, type Priority, type Task } from "@/lib/store";
import { EmptyState, PageHeader, ResponsibleNotice } from "@/components/ai-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks — Aura" },
      {
        name: "description",
        content: "Create, prioritise and categorise tasks with deadlines and time estimates.",
      },
      { property: "og:title", content: "My Tasks — Aura" },
      {
        property: "og:description",
        content: "Create, prioritise and categorise tasks with deadlines and time estimates.",
      },
    ],
  }),
  component: TasksPage,
});

export function priorityTone(p: string) {
  return p === "high"
    ? "bg-destructive/10 text-destructive"
    : p === "medium"
      ? "bg-warning/20 text-warning-foreground"
      : "bg-muted text-muted-foreground";
}

function TasksPage() {
  const tasks = useAppState((s) => s.tasks);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState<Priority>("medium");
  const [due, setDue] = useState(todayISO());
  const [estimate, setEstimate] = useState(45);
  const [editing, setEditing] = useState<Task | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "done">("open");

  const visible = tasks.filter((t) =>
    filter === "all" ? true : filter === "open" ? !t.done : t.done,
  );

  function submit() {
    if (!title.trim()) {
      toast.error("Give the task a title.");
      return;
    }
    if (editing) {
      actions.updateTask(editing.id, {
        title,
        notes,
        category,
        priority,
        due,
        estimateMinutes: estimate,
      });
      toast.success("Task updated.");
      setEditing(null);
    } else {
      actions.addTask({
        title,
        notes,
        category,
        priority,
        due,
        estimateMinutes: estimate,
      });
      toast.success("Task added.");
    }
    setTitle("");
    setNotes("");
  }

  return (
    <>
      <PageHeader
        title="My Tasks"
        description="Everything you plan and schedule starts here. Tasks you create are yours — AI never edits them without confirmation."
      />
      <ResponsibleNotice kind="general" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <section className="surface-card space-y-4 p-4 sm:p-5">
          <h2 className="text-base font-semibold">{editing ? "Edit task" : "New task"}</h2>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cat">Category</Label>
              <Input id="cat" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
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
            <div className="space-y-2">
              <Label htmlFor="due">Deadline</Label>
              <Input id="due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="est">Estimate (min)</Label>
              <Input
                id="est"
                type="number"
                min={5}
                step={5}
                value={estimate}
                onChange={(e) => setEstimate(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={submit}>
              {editing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editing ? "Save changes" : "Add task"}
            </Button>
            {editing && (
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(["open", "done", "all"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
              >
                {f === "open" ? "Open" : f === "done" ? "Completed" : "All"}
              </Button>
            ))}
          </div>

          {visible.length === 0 ? (
            <EmptyState title="No tasks here yet" hint="Add your first task on the left." />
          ) : (
            <ul className="space-y-2">
              {visible.map((t) => (
                <li key={t.id} className="surface-card p-3 sm:p-4">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                    <Checkbox
                      checked={t.done}
                      className="mt-1"
                      onCheckedChange={(c) => actions.updateTask(t.id, { done: Boolean(c) })}
                    />
                    <div className="min-w-0">
                      <p
                        className={`truncate font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}
                      >
                        {t.title}
                      </p>
                      {t.notes && (
                        <p className="mt-1 text-sm text-muted-foreground">{t.notes}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge className={priorityTone(t.priority)} variant="secondary">
                          {t.priority}
                        </Badge>
                        <span>{t.category}</span>
                        <span>· due {t.due || "—"}</span>
                        <span>· {t.estimateMinutes} min</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Edit task"
                        onClick={() => {
                          setEditing(t);
                          setTitle(t.title);
                          setNotes(t.notes);
                          setCategory(t.category);
                          setPriority(t.priority);
                          setDue(t.due);
                          setEstimate(t.estimateMinutes);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete task"
                        onClick={() => {
                          actions.deleteTask(t.id);
                          toast.success("Task deleted.");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
