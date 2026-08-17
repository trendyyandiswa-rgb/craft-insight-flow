import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ai-bits";
import { Planner } from "@/components/Planner";

export const Route = createFileRoute("/weekly")({
  head: () => ({
    meta: [
      { title: "Weekly Planner — Aura" },
      {
        name: "description",
        content: "Spread your workload across the week with an editable AI-suggested plan.",
      },
      { property: "og:title", content: "Weekly Planner — Aura" },
      {
        property: "og:description",
        content: "Spread your workload across the week with an editable AI-suggested plan.",
      },
    ],
  }),
  component: () => (
    <>
      <PageHeader
        title="Weekly Planner"
        description="A seven-day view built from your open tasks, deadlines and working hours."
      />
      <Planner range="week" />
    </>
  ),
});
