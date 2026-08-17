import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ai-bits";
import { Planner } from "@/components/Planner";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Daily Planner — Aura" },
      {
        name: "description",
        content: "Turn today's tasks into a realistic, editable daily schedule you confirm.",
      },
      { property: "og:title", content: "Daily Planner — Aura" },
      {
        property: "og:description",
        content: "Turn today's tasks into a realistic, editable daily schedule you confirm.",
      },
    ],
  }),
  component: () => (
    <>
      <PageHeader
        title="Daily Planner"
        description="AI suggests time blocks from your open tasks. You review, edit and confirm before anything is applied."
      />
      <Planner range="day" />
    </>
  ),
});
