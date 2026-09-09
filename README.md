# GoPratle Requirement Posting Flow

A polished multi-step requirement posting experience for event planners, performers, and crew — built with Next.js, Express, and MongoDB.

## Architecture

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Next.js    │──────▶│   Express    │──────▶│   MongoDB    │
│   Frontend   │  HTTP │   API        │       │   Atlas      │
│   (Vercel)   │       │  (Node/Render│       │              │
└──────────────┘       └──────────────┘       └──────────────┘
       │                       │
       │  shared Zod schemas   │
       └──── packages/contracts┘
```

**Monorepo layout** — pnpm workspaces with three packages:

| Package | Purpose |
|---------|---------|
| `apps/web` | Next.js 15 frontend (App Router, Tailwind v4, React 19) |
| `apps/api` | Express 5 backend (Mongoose, Helmet, CORS, rate limiting) |
| `packages/contracts` | Shared Zod schemas + TypeScript types |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS v4, shadcn-style components |
| Forms | React Hook Form, Zod (via `@hookform/resolvers`) |
| Backend | Express 5, TypeScript, Mongoose 8 |
| Security | Helmet, CORS, express-rate-limit |
| Database | MongoDB Atlas (Mongoose ODM) |
| Validation | Zod (shared between frontend and backend) |
| Testing | Vitest, @testing-library/react, Supertest, Playwright |
| Package Manager | pnpm 12 (workspaces) |

## Features

- **4-step wizard** — Event Basics → Category Requirements → Details → Review & Submit
- **Category-aware forms** — Planner, Performer, and Crew each render different fields
- **Dual validation** — Zod schemas validate on both client (instant feedback) and server (authoritative)
- **Clean API contract** — Consistent success/error envelopes with request IDs
- **Security baseline** — Helmet, CORS, rate limiting, request IDs, sanitized errors
- **Accessible** — Semantic labels, keyboard navigation, focus states, ARIA attributes
- **Responsive** — Works on mobile and desktop
- **Tested** — 49 tests across unit, API, component, and E2E layers

## Project Structure

```
gopratle-fullstack-assignment/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── app/
│   │   │   ├── page.tsx              # Entry point → RequirementWizard
│   │   │   ├── layout.tsx            # Root layout + metadata
│   │   │   ├── globals.css           # Tailwind v4 + design tokens
│   │   │   ├── not-found.tsx         # Custom 404
│   │   │   └── providers.tsx         # ErrorBoundary wrapper
│   │   ├── components/
│   │   │   ├── requirement-wizard/
│   │   │   │   ├── requirement-wizard.tsx   # Main wizard shell
│   │   │   │   ├── wizard-progress.tsx      # Step indicator
│   │   │   │   ├── step-basics.tsx          # Step 1: Event + category
│   │   │   │   ├── step-requirements.tsx    # Step 2: Category fields
│   │   │   │   ├── step-details.tsx         # Step 3: Preferences
│   │   │   │   ├── step-review.tsx          # Step 4: Summary
│   │   │   │   └── category-card.tsx        # Selectable card
│   │   │   └── ui/                          # Reusable primitives
│   │   ├── hooks/
│   │   │   └── use-requirement-wizard.ts    # Form state management
│   │   ├── lib/
│   │   │   ├── api-client.ts                # API wrapper
│   │   │   └── utils.ts                     # cn() utility
│   │   ├── types/
│   │   │   └── wizard.ts                    # Wizard types + constants
│   │   ├── e2e/                             # Playwright tests
│   │   └── src/__tests__/                   # Vitest unit tests
│   │
│   └── api/                          # Express backend
│       └── src/
│           ├── app.ts                # Express app setup
│           ├── server.ts             # Server startup + graceful shutdown
│           ├── config/
│           │   ├── env.ts            # Zod-validated environment
│           │   └── database.ts       # MongoDB connection
│           ├── models/
│           │   └── requirement.model.ts
│           ├── controllers/
│           │   └── requirement.controller.ts
│           ├── services/
│           │   └── requirement.service.ts
│           ├── routes/
│           │   ├── health.routes.ts
│           │   └── requirement.routes.ts
│           ├── middleware/
│           │   ├── error-handler.ts
│           │   ├── not-found.ts
│           │   └── request-id.ts
│           └── __tests__/
│               └── requirement.test.ts
│
├── packages/
│   └── contracts/                    # Shared Zod schemas
│       └── src/
│           ├── index.ts              # Re-exports
│           ├── requirement.ts        # createRequirementSchema, eventSchema, detail schemas
│           └── __tests__/
│               └── requirement.test.ts
│
├── pnpm-workspace.yaml
├── tsconfig.json                     # Base TS config
├── .env.example                      # Environment template
└── README.md
```

## Local Setup

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8
- MongoDB (local or Atlas URI)

### Install

```bash
git clone <repo-url>
cd gopratle-fullstack-assignment
pnpm install
```

### Environment

```bash
cp .env.example apps/api/.env
# Edit apps/api/.env with your MongoDB URI
```

### Run

```bash
# Start both frontend and backend
pnpm dev

# Or individually
pnpm dev:web    # http://localhost:3000
pnpm dev:api    # http://localhost:5000
```

### Verify

```bash
# Health check
curl http://localhost:5000/health
# → {"status":"ok"}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | `development`, `production`, or `test` |
| `PORT` | No | `5000` | API server port |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `FRONTEND_URL` | No | `http://localhost:3000` | Allowed CORS origin |
| `GROQ_API_KEY` | No | — | Groq API key: primary voice LLM |
| `GROQ_MODEL` | No | `qwen/qwen3.8-27b` | Groq model for assistant replies |
| `OPENROUTER_API_KEY` | No | — | OpenRouter key: LLM fallback when Groq fails (no mock in chain) |
| `OPENROUTER_MODEL` | No | `inclusionai/ling-3.0-flash-sante:free` | OpenRouter fallback model |
| `GOOGLE_MAPS_API_KEY` | No | — | Google Places key for location autocomplete (server-side proxy; field works without it) |
| `CARTESIA_API_KEY` | No | — | Cartesia API key for voice TTS (falls back to device speech) |
| `CARTESIA_VOICE_ID` | No | `a0e99841-438c-4a64-b679-ae501e7d6091` | Cartesia voice ID |
| `NEXT_PUBLIC_API_BASE_URL` | No | `http://localhost:5000` | API base URL for frontend |

## API Contract

### Health

```
GET /health
```

```json
{ "status": "ok" }
```

### Create Requirement

```
POST /api/v1/requirements
Content-Type: application/json
```

**Request body:**

```json
{
  "category": "performer",
  "event": {
    "name": "Hyderabad Product Launch Night",
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
    "technicalRequirements": "PA system + monitors",
    "portfolioUrl": "https://example.com/portfolio"
  }
}
```

**Success response (201):**

```json
{
  "success": true,
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "category": "performer",
    "status": "submitted",
    "createdAt": "2026-09-08T12:00:00.000Z"
  }
}
```

**Error response (400):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "requestId": "req_abc123",
    "fields": {
      "event.startDate": "Start date is required"
    }
  }
}
```

**Status codes:**

| Code | Meaning |
|------|---------|
| 201 | Requirement created |
| 400 | Validation error |
| 404 | Route not found |
| 429 | Rate limited |
| 500 | Server error |

### Voice Assistant

The assistant is voice-first — no chat UI. The floating microphone button
drives `idle → listening → processing → speaking → idle`.

```
POST /api/v1/assistant/message
Content-Type: application/json
```

```json
{
  "message": "What should I enter here?",
  "context": {
    "currentStep": "event-basics",
    "category": "performer",
    "currentField": "eventType",
    "event": {},
    "categoryDetails": {},
    "validationErrors": []
  }
}
```

```json
{
  "success": true,
  "data": {
    "response": "Event type describes the kind of event you are organizing...",
    "suggestedAction": { "type": "NONE" }
  }
}
```

```
POST /api/v1/assistant/transcribe   # mock STT (browser SpeechRecognition is the real STT)
POST /api/v1/assistant/speak        # Cartesia MP3, or mock payload when unconfigured
```

See `docs/voice-pipeline.md` for the full pipeline.

### Location Autocomplete

The Location field proxies Google Places through the backend so the key
never reaches the browser (5-minute server cache, debounced requests).

```
GET /api/v1/places/autocomplete?input=Hyderabad&language=en
GET /api/v1/places/:placeId?language=en
```

```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "placeId": "ChIJx9Lr6tqZyzsRwvu6koO3k64",
        "text": "Hyderabad, Telangana, India",
        "mainText": "Hyderabad",
        "secondaryText": "Telangana, India"
      }
    ]
  }
}
```

## Validation

Validation is enforced at two boundaries:

**Frontend (Zod + React Hook Form):**
- Immediate field-level feedback
- Step-level validation before advancing
- Category-specific required fields

**Backend (Zod + Express middleware):**
- Authoritative data contract enforcement
- Category discriminated union (`planner`, `performer`, `crew`)
- Date range validation (`endDate ≥ startDate`)
- Numeric bounds (counts ≥ 1, budget ≥ 0)

Invalid payloads are rejected with structured error responses. Raw Mongoose errors are never exposed to the client.

## Testing

```bash
# Run all tests
pnpm test

# Run specific suites
pnpm --filter @gopratle/contracts test   # 26 schema tests
pnpm --filter @gopratle/api test         # 11 API tests
pnpm --filter @gopratle/web test         # 11 component/hook tests
pnpm --filter @gopratle/web test:e2e     # 1 E2E smoke test
```

**Test coverage:**

| Layer | Tool | Tests | What's covered |
|-------|------|-------|----------------|
| Contracts | Vitest | 26 | Zod schemas, date logic, category switching |
| API | Vitest + Supertest | 11 | Health, create (planner/performer/crew), validation, 404 |
| Components | Vitest + Testing Library | 11 | Wizard hook state, CategoryCard rendering/interaction |
| E2E | Playwright | 1 | Full happy-path: fill → review → submit → success |

**Typecheck + Lint:**

```bash
pnpm typecheck   # TypeScript strict mode
pnpm lint        # ESLint across all packages
```

## Deployment

### MongoDB Atlas

1. Create a cluster on [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a dedicated database user (not your personal account)
3. Whitelist the API server's IP address
4. Copy the connection string to `MONGODB_URI`

### Backend (Node.js / Render / Railway)

```bash
# Build
pnpm --filter @gopratle/api build

# Start
pnpm --filter @gopratle/api start
```

**Environment:**

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/gopratle
FRONTEND_URL=https://<your-frontend-domain>
```

**Docker:**

```bash
docker build -f apps/api/Dockerfile -t gopratle-api .
docker run -p 5000:5000 -e MONGODB_URI="..." gopratle-api
```

**Verify:**

```
GET https://<backend-domain>/health
→ {"status":"ok"}
```

### Frontend (Vercel)

1. Connect the GitHub repo to Vercel
2. Set the root directory to `apps/web`
3. Set the build command to `pnpm build`
4. Add environment variable:

```
NEXT_PUBLIC_API_BASE_URL=https://<backend-domain>
```

**Verify:**
- Page loads at the Vercel URL
- Wizard renders all 4 steps
- Submission reaches the API and returns a requirement ID

## Design Decisions

**Single `Requirement` collection** — One collection with a top-level `category` discriminator and polymorphic `details` is simpler than three separate collections. It mirrors the business domain (all are "requirements") and avoids collection sprawl.

**Shared Zod contracts** — The same schema validates on both client and server. This eliminates validation drift and ensures the API contract is always in sync with the frontend.

**Wizard hook over React Hook Form for navigation** — The wizard's step state (current step, back/next, validation gates) is managed by a custom hook. RHF handles field-level validation within each step. This separation keeps navigation logic clean.

**Step-level validation** — Each step validates only its own fields before allowing advancement. This gives immediate feedback without overwhelming the user.

**Category cards over `<select>`** — Cards with icons make the category choice visible and self-explanatory, improving first-time comprehension.

## Tradeoffs / Future Improvements

**Current tradeoffs:**
- No authentication — the assignment doesn't require it; adding auth would obscure the core flow
- No optimistic UI — submission shows a loading spinner rather than optimistic state
- Single-page wizard — no URL-based step routing (would add complexity without reviewer benefit)

**What I'd add for production:**
- Authentication (JWT or OAuth) for requirement ownership
- File uploads (portfolio images, equipment photos)
- Search and filtering for posted requirements
- Email/webhook notifications on requirement creation
- Pagination and listing pages
- Rate limiting per user (currently per IP)
- Monitoring (Sentry, Datadog)
- CI/CD pipeline (GitHub Actions)
- Database migrations and indexes
- Soft deletes and status transitions (submitted → in-progress → completed)

---

Built as a fullstack internship assignment for GoPratle.
