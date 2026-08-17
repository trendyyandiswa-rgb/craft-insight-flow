import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ListPlus, Save, Search, Wand2 } from "lucide-react";

import { runResearch } from "@/lib/ai.functions";
import { actions, todayISO } from "@/lib/store";
import { AiBadge, PageHeader, ResponsibleNotice } from "@/components/ai-bits";
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

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Aura" },
      {
        name: "description",
        content: "Summarise topics and articles, extract key points and flag what to verify.",
      },
      { property: "og:title", content: "AI Research Assistant — Aura" },
      {
        property: "og:description",
        content: "Summarise topics and articles, extract key points and flag what to verify.",
      },
    ],
  }),
  component: ResearchPage,
});

type Result = {
  summary: string;
  keyPoints: string[];
  insights: string[];
  recommendations: string[];
  verify: string[];
  followUpQuestions: string[];
};

function ListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {items.map((it, i) => (
        <Textarea
          key={i}
          rows={2}
          value={it}
          onChange={(e) => onChange(items.map((x, idx) => (idx === i ? e.target.value : x)))}
        />
      ))}
    </div>
  );
}

function ResearchPage() {
  const run = useServerFn(runResearch);
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [depth, setDepth] = useState<"Quick" | "Standard" | "Deep">("Standard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [notes, setNotes] = useState("");

  async function go() {
    if (!topic.trim()) {
      toast.error("Enter a topic or paste an article first.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { topic, question, sourceText, depth } });
      setResult(res);
      toast.success("Research draft ready — verify before relying on it.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Research failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="AI Research Assistant"
        description="Summarise a topic or an article you paste in. Everything is a draft you can edit."
      />
      <ResponsibleNotice kind="research" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <section className="surface-card space-y-4 p-4 sm:p-5">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="How solar micro-grids work"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q">Specific question (optional)</Label>
            <Input id="q" value={question} onChange={(e) => setQuestion(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="src">Paste an article or notes (optional)</Label>
            <Textarea
              id="src"
              rows={8}
              placeholder="Paste source text so the summary is grounded in it."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Depth</Label>
            <Select value={depth} onValueChange={(v) => setDepth(v as typeof depth)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Quick">Quick</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Deep">Deep</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" disabled={loading} onClick={go}>
            {loading ? <Wand2 className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            {loading ? "Researching…" : "Research topic"}
          </Button>
        </section>

        <section className="surface-card space-y-5 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Editable findings</h2>
            {result && <AiBadge />}
          </div>

          {!result ? (
            <p className="text-sm text-muted-foreground">
              Results appear here. The assistant has no live web access — it never invents sources
              or citations, and lists anything that needs verification.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea
                  rows={6}
                  value={result.summary}
                  onChange={(e) => setResult({ ...result, summary: e.target.value })}
                />
              </div>
              <ListEditor
                label="Key points"
                items={result.keyPoints}
                onChange={(v) => setResult({ ...result, keyPoints: v })}
              />
              <ListEditor
                label="Insights (AI interpretation)"
                items={result.insights}
                onChange={(v) => setResult({ ...result, insights: v })}
              />
              <ListEditor
                label="Recommendations"
                items={result.recommendations}
                onChange={(v) => setResult({ ...result, recommendations: v })}
              />
              {result.verify.length > 0 && (
                <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
                  <p className="font-medium">Verify independently</p>
                  <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                    {result.verify.map((v) => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.followUpQuestions.length > 0 && (
                <div className="space-y-2">
                  <Label>Follow-up questions</Label>
                  <div className="flex flex-wrap gap-2">
                    {result.followUpQuestions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setQuestion(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="mynotes">Your notes</Label>
                <Textarea
                  id="mynotes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button
                  onClick={() => {
                    actions.saveResearch({ topic, ...result, notes, aiGenerated: true });
                    toast.success("Saved to your research library.");
                  }}
                >
                  <Save className="h-4 w-4" /> Save research
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    actions.addTask({
                      title: `Follow up: ${topic}`,
                      notes: result.summary.slice(0, 240),
                      category: "Research",
                      priority: "medium",
                      due: todayISO(),
                      estimateMinutes: 45,
                      aiGenerated: true,
                    });
                    toast.success("Task created from this research.");
                  }}
                >
                  <ListPlus className="h-4 w-4" /> Create task
                </Button>
                <Button variant="outline" disabled={loading} onClick={go}>
                  Regenerate
                </Button>
                <Button variant="ghost" onClick={() => setResult(null)}>
                  Discard
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
