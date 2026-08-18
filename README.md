# Your AI Assistant

ROLE

You are an expert AI Product Designer, Full-Stack Developer, UI/UX Designer, AI Engineer, and SaaS Application Architect.

Your task is to design and develop a modern, intelligent, responsive AI productivity platform that combines:

Smart Email Generator

AI Task Planner & Scheduler

AI Research Assistant

The platform must be professional, user-friendly, secure, scalable, and suitable for students, professionals, entrepreneurs, researchers, and general users.

CONTEXT

Users need an intelligent assistant that can help them communicate professionally, manage their workload, plan their time, and understand information quickly.

The platform should combine multiple AI capabilities into one unified workspace.

The three main AI tools are:

Smart Email Generator

Generates professional emails based on the user's purpose, context, and preferred tone.

Supported tones:

Formal

Friendly

Professional

Persuasive

Polite

Casual

Confident

AI Task Planner & Scheduler

Helps users create, organize, prioritize, and schedule tasks.

The AI should generate:

Daily schedules

Weekly schedules

Task priorities

Estimated task durations

Suggested time slots

Rescheduling suggestions

AI Research Assistant

Helps users research and understand information.

The AI should:

Summarize topics

Summarize articles

Extract key points

Identify insights

Provide recommendations

Suggest further research questions

The three tools should work together as one AI Productivity Assistant.

OBJECTIVES

Primary Objective

Build a complete AI productivity platform that helps users:

Write → Research → Plan → Prioritize → Execute

Specific Objectives

Objective 1 — Smart Email

Allow users to:

Generate professional emails.

Select different tones.

Rewrite emails.

Improve grammar.

Change email length.

Generate subject lines.

Edit AI-generated emails.

Copy and save emails.

Objective 2 — Task Planning

Allow users to:

Create tasks.

Edit tasks.

Delete tasks.

Set deadlines.

Set priorities.

Categorize tasks.

Estimate task duration.

Generate daily schedules.

Generate weekly schedules.

Reschedule unfinished tasks.

Objective 3 — Research

Allow users to:

Research topics.

Summarize articles.

Extract key information.

Identify important insights.

Compare information.

Generate recommendations.

Ask follow-up questions.

Save research results.

Objective 4 — Unified Dashboard

Create a modern dashboard where users can see:

Today's tasks

Priority tasks

Upcoming deadlines

Daily schedule

Weekly progress

Recent emails

Recent research

AI recommendations

Productivity statistics

REQUIREMENTS

1. Modern Dashboard UI

Create a clean, modern, professional dashboard.

Include:

Welcome message

Date and time

Productivity overview

Task statistics

Upcoming deadlines

Today's schedule

Recent emails

Recent research

AI recommendations

Quick-action buttons

Quick actions:

Generate Email

Add Task

Plan My Day

Plan My Week

Research Topic

2. Sidebar Navigation

Create a responsive sidebar containing:

Dashboard

Smart Email

My Tasks

Daily Planner

Weekly Planner

Calendar

AI Research

Saved Emails

Saved Research

Analytics

Settings

Include:

Active page indicator

Icons

Collapsible sidebar

User profile

Logout

On mobile, convert the sidebar into a responsive navigation drawer.

3. Responsive Design

The application must work on:

Desktop

Laptop

Tablet

Mobile

Use responsive layouts rather than simply shrinking the desktop interface.

Ensure:

Readable text

Accessible buttons

Mobile-friendly forms

Responsive cards

Mobile-friendly calendar

No unnecessary horizontal scrolling

4. Structured AI Prompts

Every AI feature must use structured prompts.

Each AI prompt should contain:

ROLE

CONTEXT

OBJECTIVE

REQUIREMENTS

CONSTRAINTS

OUTPUT FORMAT

The prompts must produce predictable and structured AI responses.

5. Editable AI Output

All AI-generated results must be editable.

Users must be able to:

Edit

Save

Cancel

Regenerate

Copy

Delete

For example:

A generated email should open in an editable text editor before the user copies or sends it.

AI-generated schedules should allow users to change:

Task

Date

Time

Duration

Priority

AI-generated research should allow users to edit summaries and notes.

6. Responsible AI Disclaimer

Clearly display:

Responsible AI Notice: AI-generated content may contain errors or incomplete information. Review and verify important information before relying on it or taking action.

For research:

Research Notice: AI-generated summaries, insights, and recommendations should be independently verified, especially when making important decisions.

For emails:

Email Notice: Review AI-generated emails before sending to verify names, dates, attachments, facts, and commitments.

For scheduling:

Planning Notice: AI-generated schedules are suggestions. Review and adjust them according to your actual availability and priorities.

7. AI Transparency

Clearly identify AI-generated information using labels such as:

✨ AI Generated

AI Suggestion

Users must always be able to distinguish between:

User-created information

AI-generated information

AI recommendations

Confirmed actions

8. User Control

Follow this workflow:

AI Suggests → User Reviews → User Edits → User Confirms → System Applies

Do not make significant changes to the user's tasks, schedule, or data without confirmation.

CONSTRAINTS

The application must follow these constraints:

Do not fabricate information.

Do not fabricate research sources or citations.

Do not invent deadlines, meetings, or calendar events.

Do not claim an email was sent when it was only generated.

Do not expose API keys or sensitive credentials.

Do not expose one user's data to another user.

Do not create conflicting schedules.

Do not schedule more work than the user's available time.

Do not automatically make major schedule changes without confirmation.

Do not overwrite user edits without permission.

Clearly label AI-generated information.

Allow users to edit and reject AI suggestions.

Handle AI/API failures gracefully.

The application must remain functional on mobile devices.

AI-generated research must clearly distinguish verified information from AI interpretation.

Important AI-generated information should be presented as suggestions, not guaranteed facts.

EXPECTED RESULT

Create a polished AI Productivity Platform that combines:

📧 Smart Email Generator

✅ AI Task Planner & Scheduler

🔎 AI Research Assistant

📊 Modern Productivity Dashboard

The final application should feel like one intelligent personal assistant, not three separate applications.

The overall workflow should be:

Research → Create Tasks → Prioritize → Schedule → Communicate → Complete → Analyze

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://craft-insight-flow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a3795fc2-339a-42d3-8800-123820709dbe).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
