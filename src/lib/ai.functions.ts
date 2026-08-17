import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.6-flash";

async function callAI(system: string, user: string): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured (missing key).");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
  if (res.status === 402) throw new Error("AI credits are exhausted. Add credits to continue.");
  if (!res.ok) throw new Error(`AI request failed (${res.status}). Please try again.`);

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("The AI returned an empty response. Try rephrasing your request.");
  return text;
}

function extractJson(raw: string): unknown {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.search(/[[{]/);
  const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  try {
    return JSON.parse(slice);
  } catch {
    throw new Error("The AI response could not be read. Please regenerate.");
  }
}

const NO_FABRICATION = `CONSTRAINTS
- Never fabricate facts, sources, citations, statistics, names, dates or commitments.
- Where a detail is unknown, use an explicit placeholder in square brackets, e.g. [date].
- Present everything as a reviewable suggestion, never as a completed action.
- Output ONLY the requested JSON. No prose, no markdown fences.`;

/* ---------------------------------- Email --------------------------------- */

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        purpose: z.string().min(1),
        context: z.string().default(""),
        recipient: z.string().default(""),
        tone: z.string().default("Professional"),
        length: z.enum(["Short", "Medium", "Long"]).default("Medium"),
        existing: z.string().default(""),
        mode: z.enum(["generate", "rewrite", "improve", "shorten", "lengthen"]).default("generate"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const system = `ROLE
You are an expert business communication writer.

CONTEXT
The user needs an email they can review, edit and send themselves. The email is only drafted, never sent.

OBJECTIVE
Produce one email draft plus three alternative subject lines.

REQUIREMENTS
- Tone: ${data.tone}. Length: ${data.length}.
- Natural, human, no filler, no clichés, no emoji unless the tone is Casual.
- Keep any factual detail the user supplied; never add facts they did not give.

${NO_FABRICATION}

OUTPUT FORMAT
{"subject":string,"alternativeSubjects":[string,string,string],"body":string,"notes":string}`;

    const user = [
      `Mode: ${data.mode}`,
      `Purpose: ${data.purpose}`,
      data.recipient && `Recipient: ${data.recipient}`,
      data.context && `Context: ${data.context}`,
      data.existing && `Existing draft to work from:\n${data.existing}`,
    ]
      .filter(Boolean)
      .join("\n");

    const parsed = extractJson(await callAI(system, user));
    return z
      .object({
        subject: z.string(),
        alternativeSubjects: z.array(z.string()).default([]),
        body: z.string(),
        notes: z.string().default(""),
      })
      .parse(parsed);
  });

/* --------------------------------- Planner -------------------------------- */

export const generateSchedule = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        range: z.enum(["day", "week"]).default("day"),
        startDate: z.string(),
        workingHours: z.string().default("09:00-17:00"),
        notes: z.string().default(""),
        tasks: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            priority: z.string().default("medium"),
            category: z.string().default("General"),
            due: z.string().default(""),
            estimateMinutes: z.number().default(30),
          }),
        ),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const system = `ROLE
You are an expert productivity coach and scheduler.

CONTEXT
The user has a task list and limited available time. Your schedule is a suggestion the user will review and edit before it is applied.

OBJECTIVE
Build a realistic ${data.range === "day" ? "daily" : "7-day weekly"} schedule from the given tasks only.

REQUIREMENTS
- Only schedule tasks from the provided list; never invent tasks, meetings or deadlines.
- Never create overlapping time slots and never exceed the available working hours.
- Respect deadlines and priority ordering; leave short breaks between long blocks.
- If not everything fits, leave the rest out and explain in "unscheduled".
- Times are 24h "HH:MM". Dates are "YYYY-MM-DD".

${NO_FABRICATION}

OUTPUT FORMAT
{"blocks":[{"taskId":string,"title":string,"date":string,"start":string,"end":string,"priority":"low"|"medium"|"high","reason":string}],"unscheduled":[string],"summary":string}`;

    const user = JSON.stringify(data);
    const parsed = extractJson(await callAI(system, user));
    return z
      .object({
        blocks: z
          .array(
            z.object({
              taskId: z.string().default(""),
              title: z.string(),
              date: z.string(),
              start: z.string(),
              end: z.string(),
              priority: z.string().default("medium"),
              reason: z.string().default(""),
            }),
          )
          .default([]),
        unscheduled: z.array(z.string()).default([]),
        summary: z.string().default(""),
      })
      .parse(parsed);
  });

/* --------------------------------- Research -------------------------------- */

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        topic: z.string().min(1),
        sourceText: z.string().default(""),
        depth: z.enum(["Quick", "Standard", "Deep"]).default("Standard"),
        question: z.string().default(""),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const system = `ROLE
You are a rigorous research assistant.

CONTEXT
The user is researching a topic and may supply source text. You have no browsing access and no live sources.

OBJECTIVE
Summarise the topic, extract key points and insights, and suggest next steps.

REQUIREMENTS
- Depth: ${data.depth}.
- If source text is supplied, ground everything in it and mark anything beyond it as interpretation.
- Separate widely-established background from your own interpretation.
- Never invent citations, URLs, studies, authors or numbers. If a claim needs verification, list it under "verify".

${NO_FABRICATION}

OUTPUT FORMAT
{"summary":string,"keyPoints":[string],"insights":[string],"recommendations":[string],"verify":[string],"followUpQuestions":[string]}`;

    const user = [
      `Topic: ${data.topic}`,
      data.question && `Specific question: ${data.question}`,
      data.sourceText && `Source text:\n${data.sourceText.slice(0, 12000)}`,
    ]
      .filter(Boolean)
      .join("\n");

    const parsed = extractJson(await callAI(system, user));
    return z
      .object({
        summary: z.string().default(""),
        keyPoints: z.array(z.string()).default([]),
        insights: z.array(z.string()).default([]),
        recommendations: z.array(z.string()).default([]),
        verify: z.array(z.string()).default([]),
        followUpQuestions: z.array(z.string()).default([]),
      })
      .parse(parsed);
  });
