# GoPratle Requirement Posting Flow — UI Template & Design Direction

## Recommendation

Do **not** copy a generic event-management dashboard for the candidate-facing flow.

The strongest direction is:

> **Vercel/shadcn visual system + custom multi-step requirement wizard + a small reviewer/admin surface only if needed.**

Use shadcn/ui as the component foundation and customize the layout, typography, category cards, step navigation, and review experience so it looks like a GoPratle product rather than a template clone.

## Current template/reference choice

### 1. Vercel — Next.js & shadcn/ui Admin Dashboard

Use this primarily as a code-quality and visual-system reference, not as the exact page to copy.

It currently uses Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Zod, React Hook Form, and Zustand, with a colocation-oriented structure and responsive layouts. Those conventions fit the engineering quality bar for this assignment. 

Reference:
https://vercel.com/templates/next.js/next-js-and-shadcn-ui-admin-dashboard

Why it is useful:

- modern Next.js foundation;
- TypeScript-first;
- shadcn/ui;
- Zod + React Hook Form;
- responsive patterns;
- feature-oriented structure.

Citation: Vercel template details. 

### 2. shadcn/ui Blocks

Use the shadcn Blocks library for reusable patterns such as sidebars, dashboard shells, tables, and responsive navigation.

Reference:
https://ui.shadcn.com/blocks

For this assignment, take the visual language but keep the candidate flow much simpler than an admin dashboard.

### 3. Event onboarding references

A useful visual reference is the classic event-planning onboarding pattern where event types are displayed as selectable cards with a visible step indicator. That interaction is much more appropriate for GoPratle's planner/performer/crew choice than a plain dropdown.

The best reference found shows:

- explicit step progression;
- large question-oriented heading;
- selectable event cards;
- clear selected state;
- simple primary action.

Use the interaction pattern, not the exact branding or copy.

---

# Visual Concept

## Desktop

```text
┌───────────────────────────────────────────────────────────────────┐
│  GoPratle                                      Save & exit         │
├──────────────────────┬────────────────────────────────────────────┤
│                      │  Step 1 of 4                               │
│  ●  Event basics     │  Tell us about your event                 │
│  ○  Requirements     │  Start with the essentials.               │
│  ○  Details          │                                            │
│  ○  Review            │  ┌────────────────────────────────────┐  │
│                      │  │ Event name                           │  │
│                      │  │ Hyderabad Product Launch Night      │  │
│                      │  └────────────────────────────────────┘  │
│                      │                                            │
│                      │  Event type     Date                      │
│                      │  [Corporate]    [14 Oct 2026]             │
│                      │                                            │
│                      │  Location       Optional venue            │
│                      │  [Hyderabad]    [The Leela Palace]        │
│                      │                                            │
│                      │  Who are you looking for?                 │
│                      │  [ Planner ] [ Performer ] [ Crew ]       │
│                      │                                            │
│                      │                         Back   Continue    │
└──────────────────────┴────────────────────────────────────────────┘
```

## Mobile

```text
GoPratle

Step 1 of 4
━━━━━━━━━━━━○━━

Tell us about your event
Start with the essentials.

[ Event name                 ]
[ Event type                 ]
[ Date                        ]
[ Location                    ]
[ Optional venue              ]

Who are you looking for?

[ Planner                     ]
[ Performer                   ]
[ Crew                        ]

[ Continue ]
```

---

# What Will Make It Stand Out

## 1. Category cards with useful microcopy

Do not show only:

`Planner | Performer | Crew`

Instead:

**Event Planner**
Coordinate vendors, logistics, timeline, and the complete event experience.

**Performer**
Find the right artist, band, DJ, MC, or live act for your event.

**Crew**
Request event staff for production, operations, stage, or on-ground support.

This makes the choice feel like product design rather than a database enum.

## 2. Question-led step headings

Prefer:

`What are you planning?`

`What should we know about the role?`

`Any preferences we should consider?`

`Review your requirement`

Avoid:

`Step 1`
`Step 2`
`Enter details`

The former makes the flow easier to understand.

## 3. Smart summary

The review screen should read like a real request someone could hand to a service provider.

For example:

```text
Hyderabad Product Launch Night
Corporate Event · 14 Oct 2026
Hyderabad · The Leela Palace

PERFORMER
Live Band · Indie / Pop
5 performers · 90 min
Budget ₹75,000

Technical
PA system + stage monitors
```

This is one of the strongest places to demonstrate that the frontend has good information architecture.

## 4. Small purposeful animation

Use animation only for:

- step transition;
- selected category feedback;
- submission success.

Keep transitions around 150–250ms and respect reduced-motion preferences.

Do not animate every card and input.

## 5. Professional empty/error states

Do not show a raw red browser error.

Use a compact inline message such as:

`We couldn't submit your requirement. Your information is still here—please retry.`

That single detail significantly improves perceived product quality.

---

# Recommended Component Set

Use shadcn/ui primitives such as:

- Button
- Input
- Label
- Textarea
- Select
- RadioGroup
- Checkbox
- Card
- Badge
- Calendar/Popover
- Separator
- Alert
- Progress
- Skeleton

Build custom components around them:

```text
RequirementWizard
WizardProgress
CategoryCard
CategoryFieldGroup
ReviewSection
FieldError
SubmissionState
```

Do not create a custom UI framework.

---

# Design Tokens

Use a small token set rather than arbitrary values throughout the application.

```text
background
foreground
muted
muted-foreground
border
primary
primary-foreground
success
error
```

Typography should have approximately:

- display/hero for the main step heading;
- medium-weight section labels;
- regular body text;
- smaller helper text.

The application should feel calm and premium rather than loud.

---

# Template Decision

### Use

**Vercel Next.js + shadcn/ui Admin Dashboard** as the engineering/design foundation.

### Borrow

- component patterns;
- responsive behavior;
- TypeScript structure;
- shadcn primitives;
- Zod + React Hook Form approach;
- visual restraint.

### Do not copy

- full admin sidebar for the creation flow;
- dashboard cards unrelated to requirement posting;
- template-specific branding;
- unnecessary charts;
- authentication pages not required by the assignment.

### The final product

Should look like a dedicated GoPratle requirement-posting experience built with a mature design system.
