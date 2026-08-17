import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { actions, useAppState } from "@/lib/store";
import { AiBadge, EmptyState, PageHeader, ResponsibleNotice } from "@/components/ai-bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/saved-research")({
  head: () => ({
    meta: [
      { title: "Saved Research — Aura" },
      { name: "description", content: "Your saved research summaries, notes and follow-ups." },
      { property: "og:title", content: "Saved Research — Aura" },
      { property: "og:description", content: "Your saved research summaries, notes and follow-ups." },
    ],
  }),
  component: SavedResearch,
});

function SavedResearch() {
  const research = useAppState((s) => s.research);

  return (
    <>
      <PageHeader
        title="Saved Research"
        description="Summaries stay editable — refine them as you verify the details."
      />
      <ResponsibleNotice kind="research" />

      {research.length === 0 ? (
        <EmptyState title="No saved research" hint="Run a topic in AI Research and save it." />
      ) : (
        <ul className="space-y-4">
          {research.map((r) => (
            <li key={r.id} className="surface-card space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="min-w-0 truncate text-base font-semibold">{r.topic}</h2>
                {r.aiGenerated && <AiBadge />}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleString()}
              </p>
              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea
                  rows={5}
                  value={r.summary}
                  onChange={(e) => actions.updateResearch(r.id, { summary: e.target.value })}
                />
              </div>
              {r.keyPoints.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Key points</p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                    {r.keyPoints.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>
              )}
              {r.verify.length > 0 && (
                <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
                  <p className="font-medium">Verify independently</p>
                  <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                    {r.verify.map((v) => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-2">
                <Label>Your notes</Label>
                <Textarea
                  rows={3}
                  value={r.notes}
                  onChange={(e) => actions.updateResearch(r.id, { notes: e.target.value })}
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  actions.deleteResearch(r.id);
                  toast.success("Research deleted.");
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
