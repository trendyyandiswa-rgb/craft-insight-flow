import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, RefreshCw, Save, Wand2, X } from "lucide-react";

import { generateEmail } from "@/lib/ai.functions";
import { actions } from "@/lib/store";
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

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Aura" },
      {
        name: "description",
        content: "Draft professional emails in any tone, then edit and save them before sending.",
      },
      { property: "og:title", content: "Smart Email Generator — Aura" },
      {
        property: "og:description",
        content: "Draft professional emails in any tone, then edit and save them before sending.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = [
  "Formal",
  "Friendly",
  "Professional",
  "Persuasive",
  "Polite",
  "Casual",
  "Confident",
];

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState<"Short" | "Medium" | "Long">("Medium");
  const [loading, setLoading] = useState(false);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [alts, setAlts] = useState<string[]>([]);
  const [hasDraft, setHasDraft] = useState(false);

  async function generate(mode: "generate" | "rewrite" | "improve" | "shorten" | "lengthen") {
    if (!purpose.trim() && !body.trim()) {
      toast.error("Describe what the email is about first.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({
        data: {
          purpose: purpose || "Rework the existing draft",
          recipient,
          context,
          tone,
          length,
          mode,
          existing: mode === "generate" ? "" : body,
        },
      });
      setSubject(res.subject);
      setBody(res.body);
      setAlts(res.alternativeSubjects ?? []);
      setHasDraft(true);
      toast.success("Draft ready — review and edit before sending.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate the email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Smart Email Generator"
        description="Describe the email, pick a tone, then edit the draft yourself. Nothing is ever sent from here."
      />
      <ResponsibleNotice kind="email" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <section className="surface-card space-y-4 p-4 sm:p-5">
          <h2 className="text-base font-semibold">Email brief</h2>
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              rows={3}
              placeholder="Ask my lecturer for a two-day extension on the data assignment"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              placeholder="Dr. Naidoo, module coordinator"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Context / facts to include</Label>
            <Textarea
              id="context"
              rows={3}
              placeholder="Only include real details — the AI will not invent facts."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Length</Label>
              <Select value={length} onValueChange={(v) => setLength(v as typeof length)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Short">Short</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full" disabled={loading} onClick={() => generate("generate")}>
            <Wand2 className="h-4 w-4" />
            {loading ? "Generating…" : "Generate email"}
          </Button>
        </section>

        <section className="surface-card space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Editable draft</h2>
            {hasDraft && <AiBadge />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            {alts.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {alts.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setSubject(a)}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              rows={14}
              className="font-sans"
              placeholder="Your email will appear here, fully editable."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={loading || !body}
              onClick={() => generate("improve")}
            >
              <RefreshCw className="h-4 w-4" /> Improve grammar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading || !body}
              onClick={() => generate("rewrite")}
            >
              Rewrite in {tone}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading || !body}
              onClick={() => generate("shorten")}
            >
              Shorten
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading || !body}
              onClick={() => generate("lengthen")}
            >
              Expand
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button
              size="sm"
              disabled={!body}
              onClick={() => {
                actions.saveEmail({ subject, body, tone, recipient, aiGenerated: true });
                toast.success("Saved to your email library.");
              }}
            >
              <Save className="h-4 w-4" /> Save draft
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!body}
              onClick={() => {
                void navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
                toast.success("Copied — the email was not sent.");
              }}
            >
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSubject("");
                setBody("");
                setAlts([]);
                setHasDraft(false);
              }}
            >
              <X className="h-4 w-4" /> Clear
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
