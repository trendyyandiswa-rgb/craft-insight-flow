import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Pencil, Trash2, Check } from "lucide-react";

import { actions, useAppState } from "@/lib/store";
import { AiBadge, EmptyState, PageHeader, ResponsibleNotice } from "@/components/ai-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/saved-emails")({
  head: () => ({
    meta: [
      { title: "Saved Emails — Aura" },
      { name: "description", content: "Your saved email drafts, editable and ready to copy." },
      { property: "og:title", content: "Saved Emails — Aura" },
      { property: "og:description", content: "Your saved email drafts, editable and ready to copy." },
    ],
  }),
  component: SavedEmails,
});

function SavedEmails() {
  const emails = useAppState((s) => s.emails);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  return (
    <>
      <PageHeader title="Saved Emails" description="Drafts only — nothing here has been sent." />
      <ResponsibleNotice kind="email" />

      {emails.length === 0 ? (
        <EmptyState title="No saved emails" hint="Generate one in Smart Email and save it." />
      ) : (
        <ul className="space-y-3">
          {emails.map((e) => (
            <li key={e.id} className="surface-card space-y-3 p-4">
              {editingId === e.id ? (
                <>
                  <Input value={subject} onChange={(ev) => setSubject(ev.target.value)} />
                  <Textarea rows={10} value={body} onChange={(ev) => setBody(ev.target.value)} />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        actions.updateEmail(e.id, { subject, body });
                        setEditingId(null);
                        toast.success("Email updated.");
                      }}
                    >
                      <Check className="h-4 w-4" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="min-w-0 truncate font-medium">{e.subject || "(no subject)"}</p>
                    {e.aiGenerated && <AiBadge />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {e.tone} · {e.recipient || "no recipient"} ·{" "}
                    {new Date(e.createdAt).toLocaleString()}
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{e.body}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(e.id);
                        setSubject(e.subject);
                        setBody(e.body);
                      }}
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        void navigator.clipboard.writeText(`Subject: ${e.subject}\n\n${e.body}`);
                        toast.success("Copied.");
                      }}
                    >
                      <Copy className="h-4 w-4" /> Copy
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => actions.deleteEmail(e.id)}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
