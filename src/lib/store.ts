import { useCallback, useSyncExternalStore } from "react";

export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  notes: string;
  category: string;
  priority: Priority;
  due: string; // YYYY-MM-DD
  estimateMinutes: number;
  done: boolean;
  createdAt: string;
  aiGenerated?: boolean;
};

export type ScheduleBlock = {
  id: string;
  taskId: string;
  title: string;
  date: string;
  start: string;
  end: string;
  priority: Priority;
  reason?: string;
  aiGenerated?: boolean;
};

export type SavedEmail = {
  id: string;
  subject: string;
  body: string;
  tone: string;
  recipient: string;
  createdAt: string;
  aiGenerated?: boolean;
};

export type SavedResearch = {
  id: string;
  topic: string;
  summary: string;
  keyPoints: string[];
  insights: string[];
  recommendations: string[];
  verify: string[];
  followUpQuestions: string[];
  notes: string;
  createdAt: string;
  aiGenerated?: boolean;
};

export type Settings = {
  name: string;
  workStart: string;
  workEnd: string;
  focusMinutes: number;
};

export type AppState = {
  tasks: Task[];
  schedule: ScheduleBlock[];
  emails: SavedEmail[];
  research: SavedResearch[];
  settings: Settings;
};

const KEY = "aura-productivity-state-v1";

const initialState: AppState = {
  tasks: [],
  schedule: [],
  emails: [],
  research: [],
  settings: { name: "there", workStart: "09:00", workEnd: "17:00", focusMinutes: 50 },
};

let state: AppState = initialState;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...initialState, ...(JSON.parse(raw) as Partial<AppState>) };
  } catch {
    /* ignore corrupt state */
  }
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  hydrate();
  return () => listeners.delete(cb);
}

export function setState(updater: (prev: AppState) => AppState) {
  state = updater(state);
  persist();
  emit();
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function useAppState<T>(selector: (s: AppState) => T): T {
  const getSnapshot = useCallback(() => selector(state), [selector]);
  const getServerSnapshot = useCallback(() => selector(initialState), [selector]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ------------------------------- mutations -------------------------------- */

export const actions = {
  addTask(task: Omit<Task, "id" | "createdAt" | "done">) {
    const t: Task = { ...task, id: uid(), createdAt: new Date().toISOString(), done: false };
    setState((s) => ({ ...s, tasks: [t, ...s.tasks] }));
    return t;
  },
  updateTask(id: string, patch: Partial<Task>) {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  },
  deleteTask(id: string) {
    setState((s) => ({
      ...s,
      tasks: s.tasks.filter((t) => t.id !== id),
      schedule: s.schedule.filter((b) => b.taskId !== id),
    }));
  },
  applySchedule(blocks: Omit<ScheduleBlock, "id">[], dates: string[]) {
    setState((s) => ({
      ...s,
      schedule: [
        ...s.schedule.filter((b) => !dates.includes(b.date)),
        ...blocks.map((b) => ({ ...b, id: uid() })),
      ],
    }));
  },
  updateBlock(id: string, patch: Partial<ScheduleBlock>) {
    setState((s) => ({
      ...s,
      schedule: s.schedule.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  },
  deleteBlock(id: string) {
    setState((s) => ({ ...s, schedule: s.schedule.filter((b) => b.id !== id) }));
  },
  saveEmail(email: Omit<SavedEmail, "id" | "createdAt">) {
    setState((s) => ({
      ...s,
      emails: [{ ...email, id: uid(), createdAt: new Date().toISOString() }, ...s.emails],
    }));
  },
  updateEmail(id: string, patch: Partial<SavedEmail>) {
    setState((s) => ({
      ...s,
      emails: s.emails.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  },
  deleteEmail(id: string) {
    setState((s) => ({ ...s, emails: s.emails.filter((e) => e.id !== id) }));
  },
  saveResearch(entry: Omit<SavedResearch, "id" | "createdAt">) {
    setState((s) => ({
      ...s,
      research: [{ ...entry, id: uid(), createdAt: new Date().toISOString() }, ...s.research],
    }));
  },
  updateResearch(id: string, patch: Partial<SavedResearch>) {
    setState((s) => ({
      ...s,
      research: s.research.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  },
  deleteResearch(id: string) {
    setState((s) => ({ ...s, research: s.research.filter((r) => r.id !== id) }));
  },
  updateSettings(patch: Partial<Settings>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },
  reset() {
    setState(() => initialState);
  },
};

/* --------------------------------- helpers -------------------------------- */

export function todayISO(d = new Date()) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export function addDaysISO(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return todayISO(d);
}

export function weekDates(startISO: string) {
  return Array.from({ length: 7 }, (_, i) => addDaysISO(startISO, i));
}

export function prettyDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
