import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { actions, useAppState } from "@/lib/store";
import { PageHeader, ResponsibleNotice } from "@/components/ai-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Aura" },
      { name: "description", content: "Set your name, working hours and focus block length." },
      { property: "og:title", content: "Settings — Aura" },
      { property: "og:description", content: "Set your name, working hours and focus block length." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useAppState((s) => s.settings);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your data stays on this device. The planner respects the working hours you set here."
      />
      <ResponsibleNotice kind="general" />

      <section className="surface-card grid gap-4 p-4 sm:max-w-xl sm:p-5">
        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            value={settings.name}
            onChange={(e) => actions.updateSettings({ name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="ws">Work starts</Label>
            <Input
              id="ws"
              type="time"
              value={settings.workStart}
              onChange={(e) => actions.updateSettings({ workStart: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="we">Work ends</Label>
            <Input
              id="we"
              type="time"
              value={settings.workEnd}
              onChange={(e) => actions.updateSettings({ workEnd: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fm">Preferred focus block (minutes)</Label>
          <Input
            id="fm"
            type="number"
            min={15}
            step={5}
            value={settings.focusMinutes}
            onChange={(e) => actions.updateSettings({ focusMinutes: Number(e.target.value) })}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (confirm("Delete all tasks, schedule, emails and research on this device?")) {
              actions.reset();
              toast.success("Workspace cleared.");
            }
          }}
        >
          Clear all my data
        </Button>
      </section>
    </>
  );
}
