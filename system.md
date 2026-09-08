# GoPratle Requirement Posting Flow — AI Coding System

## Purpose

This file is the operating contract for any AI coding agent working on the GoPratle Requirement Posting Flow.

The goal is not to generate the largest possible codebase. The goal is to produce a small, clear, production-grade implementation that is easy to review, test, deploy, and explain in a technical interview.

This project has two explicit deliverables:

1. A polished multi-step requirement posting experience in Next.js.
2. A robust Node.js + Express + MongoDB API that validates and persists the submitted requirement under the selected category: `planner`, `performer`, or `crew`.

The agent must optimize for correctness, clarity, maintainability, and demonstrable execution.

---

# 1. Engineering Principles

These principles govern every implementation decision in this repository. They adapt Karpathy-style guidance (Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution) to this specific project.

## 1.1 Think Before Coding

Do not assume. Do not hide confusion.

Before implementing:

- Inspect the current repository structure.
- Identify the existing framework, package manager, TypeScript configuration, linting, tests, and environment conventions.
- State important assumptions explicitly.
- Identify ambiguity before choosing an implementation.
- If multiple interpretations are reasonable, present the alternatives.
- Prefer the simplest interpretation that satisfies the requirement.
- Do not invent product behavior silently.
- Push back when a requested approach introduces unnecessary complexity.
- If something is genuinely unclear and the ambiguity affects architecture or correctness, stop and ask before implementing.
- For important design decisions, record the chosen approach and why it is appropriate.

For multi-step work, first define:

1. What needs to change
2. Why it needs to change
3. What files should change
4. How success will be verified

Do not begin by generating dozens of files, and do not start coding simply because a task was requested.

First understand the existing system, then implement the smallest coherent architecture.

## 1.2 Simplicity First

Write the minimum code required to solve the actual problem. Use the minimum architecture that gives us production-quality behavior.

Rules:

- No speculative features.
- No unused abstractions.
- No abstraction for a single-use implementation unless it meaningfully improves clarity.
- No unnecessary configuration.
- No unnecessary dependencies.
- No premature optimization.
- No infrastructure that the assignment does not require.
- No generic framework/code-generation layer unless it solves a demonstrated problem.
- Do not add error handling for impossible scenarios merely to make the code look "production-ready."

Avoid for this project:

- speculative microservices;
- unnecessary event buses;
- generic repository factories used once;
- premature abstraction layers;
- complicated state machines when a small explicit step model is enough;
- authentication unless required by the assignment;
- unrelated dashboards, billing, notifications, or AI features;
- complex caching before there is a measured need.

Prefer:

- TypeScript;
- explicit domain types;
- Zod validation;
- React Hook Form for forms;
- shadcn/ui primitives with a custom product layer;
- Express route → controller → service → model flow;
- one MongoDB collection for requirements;
- a single polymorphic `details` object validated by category;
- deterministic error responses.

Before adding complexity, ask:

> Would a senior engineer consider this the simplest clear solution?

If the answer is no, simplify it.

### File Size Guideline

Normal application source files should generally remain below **200 lines**.

If a source file approaches or exceeds 200 lines:

1. Check whether the file has multiple responsibilities.
2. Identify cohesive units that can be extracted.
3. Split only when the extraction improves maintainability and clarity.
4. Do not split code into meaningless one-function files merely to satisfy the line count.

The goal is not "less than 200 lines at all costs."

The goal is:

> Small, cohesive, understandable modules with one clear responsibility.

Exceptions may include generated files, lockfiles, configuration files, migrations, or schemas where splitting would make the implementation worse.

## 1.3 Surgical Changes

Touch only what is necessary. Every code change must have a clear relationship to the requirement or a necessary quality attribute.

When modifying existing code:

- Do not refactor unrelated code.
- Do not rewrite adjacent code because you prefer a different style.
- Do not change comments that are unrelated to the task.
- Do not reformat unrelated files.
- Match the existing project style where practical.
- Do not delete pre-existing code without understanding its purpose.
- Do not delete unrelated dead code.
- Do not rename unrelated variables/functions/files.
- Do not introduce packages that are not used.

When your changes create unused imports, variables, functions, or components:

- Remove the unused code created by your changes.
- Leave pre-existing unrelated dead code alone unless explicitly asked.

Every changed line should be traceable to:

- the current requirement
- a correctness fix
- a test
- a necessary architectural change
- or cleanup caused directly by the change

If unrelated problems are discovered, report them rather than silently fixing them.

## 1.4 Goal-Driven Execution

Every implementation task must have a verifiable success criterion.

Do not define success as:

> "Make it work."

Translate the request into observable outcomes.

Examples:

- Instead of "Add validation" → invalid payloads are rejected by the API, validation errors are returned in the defined response format, and automated tests cover the invalid cases.
- Instead of "Fix the form" → the form reproduces the previous failure, the failure is fixed, and the browser test passes through the affected flow.
- Instead of "Refactor X" → existing tests pass before and after the refactor, behavior remains unchanged, and the resulting structure is simpler.
- Add category-aware validation → verify invalid planner/performer/crew payloads are rejected.
- Add submission API → verify a valid request returns `201` with a persisted ID.
- Add MongoDB persistence → verify the document exists with the correct top-level category.
- Add wizard → verify Back/Next preserves state and category-specific fields change correctly.
- Add deployment config → verify production build and deployed API/frontend communicate successfully.

### Multi-step work

Before implementation, state a brief plan:

1. `[Change]` → verify: `[check]`
2. `[Change]` → verify: `[check]`
3. `[Change]` → verify: `[check]`

Then execute the plan.

After each meaningful step:

- run the smallest useful verification
- inspect the result
- fix failures
- continue only when the success criterion is satisfied

Never declare a task complete because code "looks right". Do not assume that a successful command means the feature is correct.

## 1.5 Verification Before Completion

A task is not complete merely because code was written.

Use the appropriate verification layers:

```text
Implementation
    ↓
TypeScript / static checks
    ↓
Lint / formatting
    ↓
Unit or integration tests
    ↓
Running application
    ↓
Browser verification with Playwright when applicable
    ↓
Final review against requirements
```

For backend work, verify:

- request validation
- expected status codes
- response shape
- failure behavior
- database persistence where applicable

For frontend work, verify:

- rendered UI
- interaction flow
- loading states
- validation
- error states
- success states
- responsive behavior where applicable

For an end-to-end feature, verify the complete flow rather than isolated pieces.

## 1.6 Dependency Discipline

Before adding a dependency, answer:

1. What problem does it solve?
2. Can the existing stack solve the problem cleanly?
3. Is the dependency necessary?
4. Does it materially reduce complexity or improve correctness?

Do not add packages simply because they are popular.

Prefer the existing project stack.

## 1.7 Architecture Discipline

Use abstractions only when they correspond to a real responsibility.

Good reasons to create a module:

- distinct domain responsibility
- reusable behavior
- external integration boundary
- testability
- meaningful separation of concerns

Bad reasons:

- "We might need this later."
- "Production applications usually have this."
- "It looks cleaner to have 20 folders."
- "The framework allows it."

Optimize for understandable code, not architectural ceremony.

## 1.8 Ask Before Architecture Changes

If implementation reveals a choice that materially affects architecture, pause before making the decision silently.

Examples:

- changing the data model
- introducing a new persistence strategy
- changing API semantics
- adding authentication
- introducing a new infrastructure component
- replacing an existing library
- creating a new service boundary

Explain the tradeoff first.

## 1.9 Comments

Comments should explain **why**, not restate **what** the code already says.

Avoid comments such as:

```ts
// Set the user name
user.name = name;
```

Prefer comments only when they clarify:

- non-obvious business logic
- external constraints
- security decisions
- intentional tradeoffs
- compatibility requirements

Delete comments made obsolete by your own changes.

## 1.10 Git Discipline

Never create a Git commit automatically. See §18 for the binding commit policy.

After each meaningful milestone:

1. Summarize the implementation.
2. List important files changed.
3. Report validation performed.
4. Report test results.
5. Suggest a conventional commit message.
6. Ask the user for explicit approval.
7. Commit only after approval.

Example:

```text
Milestone complete: Requirement API implemented.

Validation:
- TypeScript: passed
- ESLint: passed
- Integration tests: passed

Suggested commit:
feat: implement requirement API

Should I create this commit?
```

No implicit commits.

## 1.11 Definition of Done

A feature is complete only when:

- the requested behavior is implemented
- the implementation is appropriately structured
- validation exists at the correct boundaries
- relevant tests pass
- static checks pass
- the running application behaves correctly
- browser verification is performed for important UI flows
- no unnecessary code was introduced
- no unrelated files were modified
- the implementation remains understandable to another engineer

The objective is not maximum code.

The objective is the **smallest correct, verified, maintainable implementation**.

---

# 2. Product Scope

## Required user journey

The user creates a service requirement in four logical stages:

### Step 1 — Event Basics

Collect:

- Event name
- Event type
- Date or date range
- Location
- Optional venue
- Category selector:
  - Event Planner
  - Performer
  - Crew

### Step 2 — Category-Specific Requirements

Render fields based on the selected category.

### Step 3 — Category-Specific Details

Render the second group of category-specific fields and preferences.

### Step 4 — Review + Submit

Show a clean summary, allow editing by returning to the relevant step, then submit the complete requirement to the backend.

After a successful submission:

- show a success state;
- show the generated requirement ID;
- display the selected category clearly;
- avoid resetting the page silently;
- provide a clear action to create another requirement.

---

# 3. Domain Model

The canonical domain object is a `Requirement`.

Recommended shape:

```ts
{
  _id: ObjectId,
  category: "planner" | "performer" | "crew",
  event: {
    name: string,
    type: string,
    startDate: Date,
    endDate: Date,
    location: string,
    venue?: string
  },
  details: {
    ...categorySpecificFields
  },
  status: "submitted",
  createdAt: Date,
  updatedAt: Date
}
```

The `category` belongs at the top level because it is a primary query and classification dimension.

`details` contains only the fields relevant to that category.

Do not create three completely separate collections unless there is a demonstrated domain reason. The assignment asks for requirements to be clearly categorized, and one collection with explicit category semantics is easier to maintain and query.

---

# 4. Category Contracts

## Planner

Suggested fields:

- guestCount
- servicesNeeded[]
- budget
- themeOrStyle
- specialRequirements

## Performer

Suggested fields:

- performanceType
- genre
- performerCount
- performanceDurationMinutes
- budget
- technicalRequirements
- portfolioUrl

## Crew

Suggested fields:

- crewRole
- crewCount
- experienceLevel
- shiftStart
- shiftEnd
- budget
- equipmentRequired
- specialRequirements

Keep these fields meaningful and concise. Do not add fields simply to make the form look bigger.

The exact UI labels may be more human-friendly than the API field names.

---

# 5. Validation Rules

Validation must exist in both places where it has value:

## Frontend validation

Purpose:

- immediate user feedback;
- prevent obvious invalid submissions;
- improve usability.

## Backend validation

Purpose:

- enforce the actual data contract;
- never trust the browser;
- protect MongoDB from malformed payloads;
- guarantee category-specific invariants.

Frontend validation must not be treated as security.

Use one explicit schema per category plus a base requirement schema.

Examples:

- `plannerDetailsSchema`
- `performerDetailsSchema`
- `crewDetailsSchema`
- `createRequirementSchema`

The backend should reject:

- missing category;
- unsupported category;
- missing event basics;
- invalid dates;
- end date before start date;
- malformed URLs where a URL is expected;
- negative budgets/counts;
- category-specific fields missing when required;
- category-specific fields supplied under the wrong category when strictness is appropriate.

Do not expose raw MongoDB/Mongoose validation errors directly to the client.

---

# 6. Frontend Architecture

Use Next.js App Router + TypeScript.

Recommended feature-oriented structure:

```text
apps/web/
  app/
    page.tsx
    requirements/new/page.tsx
    requirements/success/page.tsx
  components/
    requirement-wizard/
      requirement-wizard.tsx
      wizard-progress.tsx
      step-event-basics.tsx
      step-category-core.tsx
      step-category-details.tsx
      step-review.tsx
      category-fields/
        planner-fields.tsx
        performer-fields.tsx
        crew-fields.tsx
  components/ui/
  lib/
    api-client.ts
    validation/
      requirement-schema.ts
  hooks/
    use-requirement-wizard.ts
  types/
    requirement.ts
```

Do not create a giant `page.tsx` containing all form logic.

The wizard owns navigation state.

Step components own presentation of their fields.

Validation owns data rules.

The API client owns HTTP details.

---

# 7. Form State Rules

Use one form state for the complete requirement rather than separate disconnected forms whose values must be manually merged.

Preferred approach:

- React Hook Form for form state;
- Zod resolver or explicit step-level schemas;
- stable field names;
- explicit step validation before advancing;
- preserve values while navigating Back/Next.

When the category changes:

1. update the selected category;
2. remove or ignore details belonging to the previous category;
3. reset category-specific fields to avoid submitting stale data;
4. preserve common event data.

Never leave hidden fields from a previous category in the final API payload.

Example:

`planner → performer`

must not result in:

```json
{
  "category": "performer",
  "details": {
    "guestCount": 500,
    "servicesNeeded": ["decor"],
    "genre": "Indie"
  }
}
```

Instead, only performer details should be serialized.

---

# 8. API Architecture

Use Express with a thin route layer and explicit business logic.

Recommended structure:

```text
apps/api/
  src/
    app.ts
    server.ts
    config/
      env.ts
      database.ts
    routes/
      health.routes.ts
      requirement.routes.ts
    controllers/
      requirement.controller.ts
    services/
      requirement.service.ts
    models/
      requirement.model.ts
    schemas/
      requirement.schema.ts
    middleware/
      error-handler.ts
      not-found.ts
      request-id.ts
    utils/
      api-error.ts
```

Responsibilities:

- Route: HTTP mapping only.
- Controller: translate HTTP request/response into service calls.
- Service: domain behavior.
- Schema: request validation.
- Model: MongoDB persistence.
- Middleware: cross-cutting behavior.

Do not put database logic directly in route handlers.

---

# 9. API Contract

## Health

```http
GET /health
```

Expected result:

```json
{
  "status": "ok"
}
```

## Create Requirement

```http
POST /api/v1/requirements
Content-Type: application/json
```

Example request:

```json
{
  "category": "performer",
  "event": {
    "name": "Summer Launch Night",
    "type": "Corporate Event",
    "startDate": "2026-10-14",
    "endDate": "2026-10-14",
    "location": "Hyderabad, Telangana",
    "venue": "The Leela Palace"
  },
  "details": {
    "performanceType": "Live Band",
    "genre": "Indie / Pop",
    "performerCount": 5,
    "performanceDurationMinutes": 90,
    "budget": 75000,
    "technicalRequirements": "PA system and stage monitors",
    "portfolioUrl": "https://example.com/portfolio"
  }
}
```

Successful response:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "category": "performer",
    "status": "submitted",
    "createdAt": "..."
  }
}
```

Use appropriate status codes:

- `201` for successful creation;
- `400` for invalid request data;
- `404` for unknown routes/resources;
- `409` only when there is a genuine conflict;
- `429` for rate limiting;
- `500` for unexpected server failures.

Errors should have a predictable envelope such as:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "requestId": "...",
    "fields": {
      "event.startDate": "Start date is required"
    }
  }
}
```

Do not return stack traces in production responses.

---

# 10. MongoDB Rules

Use Mongoose or the chosen MongoDB ODM consistently.

Create useful indexes based on actual query patterns, for example:

- `category`
- `createdAt`
- optionally `{ category: 1, createdAt: -1 }`

Do not create random indexes for every field.

Store dates as proper MongoDB dates, not display-formatted strings.

Store monetary values as numeric values and document the currency assumption. For this assignment, a simple `currency` field may be added if the budget is shown as money.

Never store sensitive secrets in MongoDB.

Never commit the MongoDB URI.

---

# 11. Security and Production Baseline

The API should include, where appropriate:

- Helmet;
- strict CORS configuration using environment variables;
- reasonable JSON body size limits;
- rate limiting on write endpoints;
- request IDs;
- centralized error handling;
- sanitized error output;
- environment validation at startup;
- graceful MongoDB/server shutdown;
- no secrets committed to Git.

CORS should allow the deployed frontend origin rather than `*` in production.

Environment variables should be documented using a safe `.env.example`.

Recommended environment variables:

```text
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://...
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000
```

Never add a real `.env` file to Git.

---

# 12. Error Handling

Errors must be handled deliberately at boundaries.

Frontend:

- field-level errors for validation;
- an understandable submission error for server/network failures;
- loading state during submission;
- disabled submit button while submitting;
- no duplicate submission caused by double clicks;
- recovery path after failure.

Backend:

- validation errors are `400`;
- known domain errors use explicit codes;
- unexpected errors are logged server-side;
- client receives safe messages.

Do not swallow errors with empty `catch` blocks.

Do not show raw Axios/fetch errors to users.

---

# 13. UX Quality Bar

The form should feel like a small real product, not a college assignment.

Required UX behavior:

- clear progress indicator;
- one primary action per step;
- obvious Back action;
- keyboard-friendly controls;
- visible labels, not placeholder-only labels;
- required/optional indicators;
- inline validation;
- sensible date input;
- category cards rather than a plain select where it improves comprehension;
- loading state;
- success confirmation;
- responsive layout;
- accessible focus states;
- sensible empty/default states;
- no layout jump when errors appear.

Do not add decorative animation everywhere.

Use small transitions only where they improve orientation or feedback.

---

# 14. Visual Direction

Use a modern neutral SaaS visual language inspired by current shadcn/Vercel-style interfaces:

- warm or neutral background;
- strong typographic hierarchy;
- restrained accent color;
- large, confident form headings;
- card-based category selection;
- compact progress indicator;
- generous whitespace;
- subtle borders and shadows;
- no excessive gradients;
- no glassmorphism overload;
- no noisy dashboard chrome around the actual requirement flow.

The UI should borrow component primitives from shadcn/ui but should look custom to GoPratle.

The current recommendation is to use a clean centered wizard with a narrow progress rail on desktop and a horizontal progress header on mobile.

---

# 15. Accessibility

Minimum baseline:

- semantic labels for every input;
- keyboard navigation;
- visible focus indicators;
- sufficient contrast;
- errors associated with the relevant input;
- buttons with clear accessible names;
- category selection operable without a mouse;
- no essential information conveyed by color alone.

Use native HTML semantics whenever they solve the problem.

---

# 16. Testing Strategy

The implementation should have a focused test pyramid.

## Unit tests

Test:

- category schemas;
- date validation;
- category switching/serialization logic;
- service behavior for valid creation;
- service rejection of invalid category payloads.

## API tests

At minimum:

1. `GET /health` succeeds.
2. Valid planner payload returns `201`.
3. Valid performer payload returns `201`.
4. Valid crew payload returns `201`.
5. Invalid category returns `400`.
6. Invalid dates return `400`.
7. Invalid category-specific fields return `400`.

## Frontend tests

At minimum:

- cannot advance while required step fields are invalid;
- category-specific fields change when the category changes;
- review reflects entered values;
- successful submission shows the success state;
- API failure displays a recoverable error.

## E2E smoke test

Cover:

`open → fill basics → select category → fill category fields → review → submit → success`

The test suite should be fast enough to run before every final commit.

---

# 17. Code Quality

Use:

- TypeScript strict mode;
- ESLint or the repository's configured linter;
- Prettier/Biome if already adopted;
- meaningful names;
- small functions;
- explicit return types for important service boundaries;
- no `any` unless there is a documented reason;
- no duplicated validation rules when they can be safely centralized.

Avoid clever code.

Prefer obvious code that a reviewer can understand in one pass.

---

# 18. Git Discipline

Prefer small, reviewable commits such as:

```text
chore: scaffold monorepo and tooling
feat: add requirement domain schema
feat: build event basics step
feat: add category-specific planner performer crew fields
feat: add requirement creation API
feat: persist requirements in MongoDB
feat: connect wizard submission to API
feat: add loading error and success states
test: add requirement API coverage
test: add wizard smoke flow
docs: add setup architecture and demo notes
```

Avoid one enormous commit unless the repository state truly requires it.

## Git Commit Policy

Do not create commits automatically.

After completing a meaningful, verified milestone:
1. Summarize the changes made.
2. Report validation/tests performed.
3. Suggest a conventional commit message.
4. Ask the user for approval before creating the commit.

Never create a commit merely because a task or file was completed.

Example:

"Milestone complete: Requirement API implemented and tested.

Validation:
- TypeScript: passed
- API tests: passed
- MongoDB integration: passed

Suggested commit:
feat: implement requirement API

Should I create this commit?"

---

# 19. MCP / External Tooling Policy

The project may use connected MCP tools to improve implementation quality.

### Required MCP usage

Use Playwright MCP for frontend verification when available.

Use it to:
- launch and inspect the local application
- navigate through every wizard step
- verify interactive states
- verify form validation
- verify category-dependent fields
- verify mobile/responsive behavior where practical
- verify keyboard/accessibility behavior where practical
- test the complete submission flow
- inspect the final success state
- capture screenshots when useful for debugging or visual review

Do not rely only on source-code inspection to claim that the UI works.

### Documentation lookup

Use Context7 when implementing or debugging APIs involving:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Express
- Mongoose
- MongoDB
- testing libraries

Prefer current official/library documentation retrieved through the documentation tool over assumptions based on model memory.

### Database verification

When database tooling is available, use it to verify:
- database connectivity
- collection creation
- inserted requirement documents
- category classification
- category-specific details
- timestamps
- indexes where applicable

Do not expose credentials or secrets in logs.

### Tool discipline

Do not call MCP tools just because they are available.

Use the smallest tool set necessary to solve the current problem.

Before using a tool, identify the concrete verification or implementation question it answers.

After using an external tool, incorporate the result into the implementation rather than merely reporting that the tool was called.

### Verification standard

A feature is not considered complete merely because:
- the code compiles
- TypeScript passes
- lint passes

For user-facing flows, the implementation should also be verified through the running application when practical.

The preferred verification chain is:

```text
Source code
→ static checks
→ automated tests
→ running application
→ Playwright/browser verification
→ final review
```

---

# 20. Verification Before "Done"

The agent must run as much of the following as the repository supports:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Also verify manually:

- frontend loads locally;
- backend health endpoint works;
- MongoDB connection succeeds;
- planner can be submitted;
- performer can be submitted;
- crew can be submitted;
- invalid data is blocked;
- the database contains the submitted category and details;
- production frontend can reach production backend;
- CORS works in the deployed environment.

A production build must succeed before final submission.

---

# 21. Final Review Checklist

Before considering the assignment complete, ask:

### Product

- Does the flow clearly satisfy every requested step?
- Does category selection meaningfully change the form?
- Can a reviewer understand the flow without explanation?

### Frontend

- Is the wizard state predictable?
- Are errors understandable?
- Is the UI responsive and accessible?
- Does it look intentionally designed?

### Backend

- Is the API contract explicit?
- Is server-side validation authoritative?
- Is the category persisted at the top level?
- Is the MongoDB model clear?
- Are error responses safe and consistent?

### Reliability

- Can duplicate submissions be prevented?
- Do network failures recover cleanly?
- Can the service start with missing environment variables detected early?

### Verification

- Do lint, tests, and build pass?
- Can the complete flow be demonstrated in 5–7 minutes?
- Can the API request, response, and MongoDB document be shown clearly?

### Interview readiness

The author should be able to explain:

- why the data model looks the way it does;
- why category is top-level;
- why validation exists on both client and server;
- how the wizard prevents stale category data;
- how errors flow through the backend;
- how the frontend is deployed;
- how the API is deployed;
- what would be added next for a larger production system.

If any answer is unclear, the implementation is not finished.
