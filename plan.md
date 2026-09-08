# GoPratle Requirement Posting Flow — End-to-End Production Plan

## 0. Target Outcome

Build a polished requirement-posting product, not merely a form.

The final experience should demonstrate four things to the GoPratle reviewer:

1. Strong frontend UX and state management.
2. Clean backend/API architecture.
3. Correct category-aware data modeling and persistence.
4. Engineering discipline: validation, error handling, testing, deployment, and observability basics.

The implementation should remain appropriately scoped to the assignment.

---

# 1. Recommended Stack

## Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Lucide icons
- Fetch or Axios through one API client module

## Backend

- Node.js
- Express
- TypeScript
- Mongoose
- Zod
- Helmet
- CORS
- rate limiter
- structured/request-aware logging

## Database

- MongoDB Atlas

## Testing

- Vitest or Jest for backend/unit tests
- Supertest for Express API tests
- Playwright for an end-to-end smoke flow

## Deployment

- Vercel for Next.js
- Render/Railway/Fly.io or another Node-compatible service for Express
- MongoDB Atlas for database

Choose one backend host and keep deployment simple. The architecture should not depend on any provider-specific feature.

---

# 2. Repository Strategy

Use a monorepo because the assignment explicitly has a frontend and backend and the monorepo makes the final repository easy for a reviewer to understand.

```text
root/
  apps/
    web/
    api/
  packages/
    contracts/
  docs/
  package.json
  README.md
  .gitignore
  .env.example
```

### Why a contracts package?

It provides one place for shared domain vocabulary and validation contracts without forcing the frontend to duplicate backend field names.

Keep it small. It should contain only:

- category types;
- base event types;
- category-specific schemas/types;
- request/response DTOs where useful.

Do not turn `packages/contracts` into a giant shared utility library.

---

# 3. Phase 1 — Clarify the Product Before Coding

## Deliverable

A one-page written product contract.

## Define

### Categories

`planner`, `performer`, `crew`

### Common fields

- eventName
- eventType
- startDate
- endDate
- location
- venue
- category

### Planner fields

- guestCount
- servicesNeeded
- budget
- themeOrStyle
- specialRequirements

### Performer fields

- performanceType
- genre
- performerCount
- performanceDurationMinutes
- budget
- technicalRequirements
- portfolioUrl

### Crew fields

- crewRole
- crewCount
- experienceLevel
- shiftStart
- shiftEnd
- budget
- equipmentRequired
- specialRequirements

### Submission semantics

Every valid submission becomes one `Requirement` document with:

```text
category + event + details + status + timestamps
```

## Verification

Read this document as if you were the hiring manager.

Everything in the application must map back to this contract.

---

# 4. Phase 2 — UX and Visual Direction

## Primary recommendation

Build a focused "requirement wizard" rather than starting from a generic dashboard.

Use shadcn/ui primitives and the current Vercel/shadcn visual language as the foundation, then create a custom GoPratle experience around them.

Recommended desktop composition:

```text
┌──────────────────────────────────────────────────────────────┐
│ GoPratle                                      Save & exit     │
├──────────────────┬───────────────────────────────────────────┤
│                  │ Step 1 of 4                               │
│  01 Event basics │ Tell us about your event                  │
│  02 Requirements │ A clear supporting sentence               │
│  03 Details      │                                           │
│  04 Review       │ [form content]                            │
│                  │                                           │
│                  │                          Back   Continue  │
└──────────────────┴───────────────────────────────────────────┘
```

Desktop should have a compact progress rail.

Mobile should switch to a horizontal progress header to preserve space.

## Visual principles

- Use a restrained neutral base.
- Use one recognizable accent color for selection and progress.
- Give the form a large heading and concise supporting text.
- Use cards for planner/performer/crew selection.
- Use icons sparingly.
- Use subtle elevation and borders.
- Avoid excessive gradients, blobs, glass cards, and animations.

## Category selection

Do not use a plain dropdown for the main category choice.

Use three selectable cards:

### Event Planner

Plan the complete event with vendors, logistics, schedule, and coordination.

### Performer

Find an artist, band, DJ, MC, or other performance talent.

### Crew

Request event staff, production support, stage crew, or operations staff.

The selected card should show a clear selected state and remain obvious when the user comes back to the step.

---

# 5. Phase 3 — Scaffold the Repository

Create:

```text
apps/web
apps/api
packages/contracts
```

Set up:

- TypeScript strict mode;
- linting;
- formatting;
- environment validation;
- root scripts;
- Git hooks only if they help rather than slow iteration;
- README with setup instructions.

Root commands should ideally include:

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

## Verification

A clean clone should install and start both apps with documented commands.

---

# 6. Phase 4 — Design the Contract First

Create Zod schemas for:

```text
plannerDetailsSchema
performerDetailsSchema
crewDetailsSchema
createRequirementSchema
```

The parent schema should validate that the `details` shape matches the chosen category.

Example conceptual model:

```ts
category === "planner"   → planner schema
category === "performer" → performer schema
category === "crew"      → crew schema
```

## Important date rule

`endDate >= startDate`

If only a single day is selected, send the same start and end date.

Do not send browser-localized display strings to the API.

Serialize dates in a stable ISO representation.

## Verification

Add tests before wiring the UI.

Expected tests:

- valid planner payload passes;
- valid performer payload passes;
- valid crew payload passes;
- missing event name fails;
- invalid date range fails;
- unsupported category fails;
- wrong category details fail.

---

# 7. Phase 5 — Build the Backend

## 7.1 Express application

Create:

```text
app.ts
server.ts
```

Keep `app.ts` testable without starting the network listener.

## 7.2 Infrastructure

Add:

- MongoDB connection;
- environment parsing;
- health endpoint;
- request ID;
- centralized error handler;
- 404 handler;
- security middleware;
- CORS.

## 7.3 Requirement API

Implement:

```http
POST /api/v1/requirements
GET /api/v1/requirements/:id
```

The GET endpoint is optional for the assignment but useful for proving the resource model and for future extensibility.

## 7.4 Persistence

Mongoose model:

```text
Requirement
  category
  event
  details
  status
  createdAt
  updatedAt
```

Use timestamps.

Add an index on:

```text
category
createdAt
```

or a compound index if the future listing query makes that more appropriate.

## 7.5 Error contract

Return:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "requestId": "...",
    "fields": {}
  }
}
```

Do not expose Mongoose internals.

## Verification

API tests should prove:

- health works;
- three categories can be created;
- invalid payloads are rejected;
- the response contains the persisted ID;
- MongoDB receives the expected category and details.

---

# 8. Phase 6 — Build the Frontend Wizard

## Step 1: Event Basics

Fields:

- Event name
- Event type
- Date/range
- Location
- Optional venue
- Category

Use a strong layout hierarchy:

```text
What are you planning?
Tell us the basics. You can refine the requirement in the next steps.

Event name               Event type
[_________________]      [____________]

Date                      Location
[ start — end ]           [____________]

Optional venue
[______________________________________]

Who are you looking for?
[ Planner ] [ Performer ] [ Crew ]
```

Step completion rule:

The user cannot move forward until required fields are valid.

---

# 9. Phase 7 — Category-Aware Steps 2 and 3

Step 2 should focus on the primary category requirements.

Step 3 should focus on preferences, logistics, and extra details.

This separation keeps each screen readable.

## Planner

Step 2:

- guest count
- services needed
- budget

Step 3:

- theme/style
- special requirements

## Performer

Step 2:

- performance type
- genre
- performer count
- duration
- budget

Step 3:

- technical requirements
- portfolio

## Crew

Step 2:

- crew role
- headcount
- experience
- shift timing
- budget

Step 3:

- equipment required
- special requirements

Use the same shell for all three categories so the UX remains coherent.

Only the content changes.

---

# 10. Phase 8 — Review Step

Before submitting, show a clean summary grouped into:

### Event

Name, type, dates, location, venue.

### Category

Planner / Performer / Crew.

### Requirement details

Only the selected category's fields.

Each section should have an Edit action that returns to the appropriate step.

The review screen is important because it demonstrates:

- state was preserved;
- category-aware data is correct;
- the final payload is predictable.

---

# 11. Phase 9 — API Integration

Create one frontend API client:

```text
lib/api-client.ts
```

The UI should never scatter raw `fetch` calls across components.

The submission flow should be:

```text
Review submit
   ↓
validate complete form
   ↓
transform display values into API DTO
   ↓
POST /api/v1/requirements
   ↓
201 response
   ↓
success screen
```

During submission:

- disable the button;
- show an inline pending state;
- keep the entered values intact;
- do not allow accidental double-submit.

On failure:

- show a clear message;
- preserve the form;
- let the user retry.

---

# 12. Phase 10 — Success State

The success screen should feel deliberate.

Example:

```text
Requirement submitted

Your performer requirement has been created successfully.

Requirement ID
REQ-66F...

Status
Submitted

[Create another requirement]
```

Do not manufacture a fake human-readable ID unless the backend explicitly owns that identifier.

The MongoDB ObjectId can be returned as the resource ID; a separate public ID can be introduced only if useful.

---

# 13. Phase 11 — Production Hardening

Add the following only after the core flow works:

### Backend

- Helmet
- CORS allowlist
- request size limit
- rate limiting
- request ID
- environment validation
- graceful shutdown
- consistent error envelope
- safe logs

### Frontend

- API timeout/abort behavior where appropriate
- error boundary for unexpected UI failures
- loading states
- responsive behavior
- accessibility pass
- metadata/title

### Data

- MongoDB indexes
- timestamps
- clear schema constraints
- no secrets in Git

Do not turn this assignment into a full auth/permissions platform.

---

# 14. Phase 12 — Testing Matrix

## Schema tests

```text
planner valid       ✓
performer valid     ✓
crew valid          ✓
invalid category    ✓
invalid date range  ✓
invalid budget      ✓
missing core field  ✓
```

## API tests

```text
GET /health                  200
POST planner                 201
POST performer               201
POST crew                    201
POST invalid payload         400
POST wrong category details  400
```

## UI tests

```text
Step 1 blocks invalid data
Category cards change active state
Category change clears stale details
Back preserves valid data
Review matches form state
Submit disables while pending
API error preserves data
Success state shows ID
```

## E2E

Record one reliable happy-path test using Performer because it visibly demonstrates category-specific behavior and enough fields to make the flow realistic.

---

# 15. Phase 13 — Deployment

## MongoDB Atlas

Create one database for the assignment.

Configure IP/network access appropriately for the hosting environment.

Create a dedicated application database user.

Do not use personal credentials inside the source tree.

## Backend deployment

Example environment:

```text
NODE_ENV=production
PORT=<platform-provided-or-configured-port>
MONGODB_URI=<secret>
FRONTEND_URL=https://<frontend-domain>
```

Verify:

```text
https://<backend-domain>/health
```

## Frontend deployment

Vercel environment:

```text
NEXT_PUBLIC_API_BASE_URL=https://<backend-domain>
```

Verify:

- browser can load the frontend;
- browser can submit a real requirement;
- backend accepts the production frontend origin;
- MongoDB document is created.

---

# 16. Phase 14 — README and Reviewer Experience

The GitHub repo should answer five questions immediately:

1. What is this?
2. How do I run it?
3. What is the architecture?
4. What are the API endpoints?
5. How was it deployed?

README structure:

```text
# GoPratle Requirement Posting Flow

## Live Demo
## Architecture
## Tech Stack
## Features
## Project Structure
## Local Setup
## Environment Variables
## API Contract
## Validation
## Testing
## Deployment
## Design Decisions
## Tradeoffs / Future Improvements
```

Include screenshots or one short GIF only if they add useful context.

---

# 17. Demo-Ready Data

Create realistic data that tells a story.

Recommended demo scenario:

```text
Event: Hyderabad Product Launch Night
Event type: Corporate Event
Date: 14 Oct 2026
Location: Hyderabad, Telangana
Venue: The Leela Palace
Category: Performer

Performance type: Live Band
Genre: Indie / Pop
Performers: 5
Duration: 90 minutes
Budget: ₹75,000
Technical requirements: PA system + monitors
Portfolio: example.com
```

This makes the demo feel like a real platform use case instead of placeholder text.

---

# 18. 5–7 Minute Submission Demo Plan

The video should not be a generic screen recording.

It should prove architecture and execution in this order:

```text
00:00–00:30  Product and architecture overview
00:30–02:30  Live frontend flow
02:30–03:30  Category adaptation + review
03:30–04:30  Network/API request and response
04:30–05:20  MongoDB persisted document
05:20–06:20  Code architecture and validation
06:20–07:00  Production/deployment + tradeoffs
```

Show the actual browser and developer tools rather than reading code from a screen for several minutes.

---

# 19. Final Verification Gate

Do not submit until all of these are true:

```text
[ ] Fresh clone installs successfully
[ ] Frontend starts
[ ] Backend starts
[ ] MongoDB connects
[ ] Health endpoint returns OK
[ ] Planner submission works
[ ] Performer submission works
[ ] Crew submission works
[ ] Invalid inputs are blocked on the client
[ ] Invalid inputs are rejected by the server
[ ] Category data is persisted correctly
[ ] Review state is correct
[ ] Submission cannot be duplicated accidentally
[ ] API errors are understandable
[ ] Production build passes
[ ] Deployed frontend submits to deployed backend
[ ] MongoDB contains the document shown in the demo
[ ] README is complete
[ ] Demo script is rehearsed
```

The last check matters: the video is part of the engineering submission.
