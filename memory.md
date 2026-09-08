# memory.md — GoPratle Fullstack Assignment Work Log

> Use this file to track progress, decisions, and next steps.
> Update it after every work session: add a dated entry under `Progress Log`, update `Current Status` and `Next Up`.

## 1. Project Overview
- **Project:** GoPratle Requirement Posting Flow (planner / performer / crew)
- **Stack:** Next.js + TS + Tailwind + shadcn/ui + RHF + Zod (web) / Express + TS + Mongoose + Zod (api) / MongoDB Atlas
- **Repo layout (planned):** `apps/web`, `apps/api`, `packages/contracts`, `docs/`
- **Source docs:** `plan.md`, `system.md`, `ui.md`

## 2. Current Status
- **Phase:** Milestone 8 complete — README + Deployment done, 49 tests pass.
- **Last updated:** 2026-09-08
- **Blocking issues:** None.

## 3. Key Decisions
- [x] Monorepo with shared `packages/contracts` for Zod schemas (see `plan.md` §2, `system.md` §5)
- [x] Single `Requirement` collection with top-level `category` + polymorphic `details` (see `system.md` §3)
- [x] Wizard UX (4 steps) over generic dashboard (see `ui.md`)
- [x] Test runner: Vitest (consistent across all packages)
- [x] E2E testing: Playwright with webServer auto-start
- [ ] Backend host (Render / Railway / Fly.io) — TBD

## 4. Progress Log

### 2026-09-08 — Milestone 8: README + Deployment
- Rewrote `README.md` with full documentation: architecture, tech stack, features, project structure, local setup, environment variables, API contract, validation, testing, deployment, design decisions, tradeoffs.
- Created `Dockerfile` (multi-stage build: deps → build → production) for backend containerization.
- Created `.dockerignore` for clean Docker builds.
- Verified: `pnpm -r run typecheck` passes, `pnpm -r run test` passes (49 total).
- **Committed:** `docs: add README, Dockerfile, and deployment config`

### 2026-09-08 — Milestone 7: Testing
- Added vitest + @testing-library/react + jsdom to apps/web.
- Created vitest.config.ts and setup.ts (jest-dom matchers + cleanup).
- Wrote 8 unit tests for use-requirement-wizard hook.
- Wrote 4 unit tests for CategoryCard component.
- Installed Playwright, wrote E2E smoke test (fill → review → submit → success with API mock).
- Fixed lint errors (unused imports, empty interfaces → type aliases).
- Verified: 26 contracts + 11 API + 11 vitest + 1 E2E = 49 tests pass.
- **Committed:** `test: add frontend unit tests and Playwright E2E smoke test` (dfbc790)

### 2026-09-08 — Milestone 6: Hardening + Polish
- Created `apps/web/components/error-boundary.tsx` (catches unexpected UI errors with fallback UI).
- Created `apps/web/app/providers.tsx` (client wrapper for error boundary).
- Created `apps/web/app/not-found.tsx` (404 page with "Go home" link).
- Updated `apps/web/app/layout.tsx` (added Providers wrapper, enhanced metadata).
- Updated `apps/web/components/requirement-wizard/category-card.tsx` (added `role="radio"`, `aria-checked`, `aria-label`, `aria-hidden` for indicator, focus-visible styles).
- Updated `apps/web/components/requirement-wizard/wizard-progress.tsx` (added focus-visible styles for keyboard navigation).
- Verified: `pnpm -r run typecheck` passes, `pnpm -r run test` passes (37 total).
- **Committed:** `chore: add error boundary, not-found page, and a11y improvements` (8372ee9)
- Next: Milestone 7 — Testing (unit/API/UI/E2E).

### 2026-09-08 — Milestone 5: Review + Submit + Success
- Created `apps/web/lib/api-client.ts` (createRequirement function, error handling).
- Created `apps/web/components/requirement-wizard/step-review.tsx` (review summary with event, category, details, edit buttons per section).
- Updated `apps/web/components/requirement-wizard/requirement-wizard.tsx` (submission flow with loading spinner, error message, success state with requirement ID).
- Success state shows category, ID, status, and "Create another requirement" action.
- Verified: `pnpm -r run typecheck` passes, `pnpm -r run test` passes (37 total).
- **Committed:** `feat: add review step, API submission, and success state` (b648e86)
- Next: Milestone 6 — Hardening + Polish (a11y, responsive, error boundary, metadata).

### 2026-09-08 — Milestone 4: Frontend Wizard (Steps 1–3)
- Created Tailwind v4 CSS with shadcn/ui design tokens (`apps/web/app/globals.css`).
- Created shadcn/ui-style components: Button, Input, Label, Textarea, Select, Card.
- Created `apps/web/lib/utils.ts` (cn helper).
- Created `apps/web/types/wizard.ts` (StepId, WizardState, STEPS, CATEGORY_INFO).
- Created `apps/web/hooks/use-requirement-wizard.ts` (form state, step navigation, category switching).
- Created `apps/web/components/requirement-wizard/wizard-progress.tsx` (step indicator with check marks).
- Created `apps/web/components/requirement-wizard/category-card.tsx` (selectable cards with icons).
- Created `apps/web/components/requirement-wizard/step-basics.tsx` (Step 1: event name, type, dates, location, venue, category cards).
- Created `apps/web/components/requirement-wizard/step-requirements.tsx` (Step 2: category-specific primary fields).
- Created `apps/web/components/requirement-wizard/step-details.tsx` (Step 3: category-specific secondary fields).
- Created `apps/web/components/requirement-wizard/requirement-wizard.tsx` (main shell with progress rail, step validation, Back/Continue).
- Updated `apps/web/app/layout.tsx` (metadata, globals.css import).
- Updated `apps/web/app/page.tsx` (renders RequirementWizard).
- Verified: `pnpm -r run typecheck` passes, `pnpm -r run test` passes (37 total).
- **Committed:** `feat: build requirement wizard with category-aware steps` (bce4354)
- Next: Milestone 5 — Review step + API submission + success state.

### 2026-09-08 — Milestone 3: Express Backend API
- Created `apps/api/src/config/env.ts` (Zod env validation), `database.ts` (Mongoose connect/disconnect).
- Created `apps/api/src/utils/api-error.ts` (ApiError, ValidationError, NotFoundError).
- Created `apps/api/src/middleware/request-id.ts`, `error-handler.ts`, `not-found.ts`.
- Created `apps/api/src/models/requirement.model.ts` (Mongoose schema with timestamps, category index).
- Created `apps/api/src/services/requirement.service.ts` (create + getById).
- Created `apps/api/src/controllers/requirement.controller.ts` (Zod validation + error formatting).
- Created `apps/api/src/routes/health.routes.ts`, `requirement.routes.ts`.
- Updated `apps/api/src/app.ts` (Helmet, CORS, rate limiting, request ID, routes, error handlers).
- Updated `apps/api/src/server.ts` (env-based startup, graceful shutdown).
- Added vitest + supertest, wrote 11 API tests (health, create planner/performer/crew, invalid payloads, get by id, 404).
- Verified: `pnpm -r run typecheck` passes, `pnpm -r run test` passes (26 + 11 = 37 tests).
- **Committed:** `feat: implement requirement API with validation and tests` (f13b0b8)
- Next: Milestone 4 — Frontend wizard (Steps 1–3).

### 2026-09-08 — Milestone 2: Shared Zod Contracts
- Created `packages/contracts/src/categories/planner.ts`, `performer.ts`, `crew.ts` with category-specific detail schemas.
- Created `packages/contracts/src/requirement.ts` with event schema (date range validation), `createRequirementSchema` (Zod discriminated union on `category`), and response/error DTOs.
- Created `packages/contracts/src/index.ts` exporting all schemas and types.
- Added vitest to `packages/contracts`, wrote 26 tests covering valid payloads for all 3 categories, invalid category/details/date-range, missing fields, and discriminated union behavior.
- Verified: `pnpm -r run typecheck` passes, `pnpm --filter @gopratle/contracts test` passes (26/26).
- **Committed:** `feat: add shared Zod contracts and schema tests` (4728450)
- Next: Milestone 3 — Express backend API.

### 2026-09-08 — Milestone 1: Scaffold Monorepo + Tooling
- Created root `package.json` (pnpm workspaces, dev/build/lint/typecheck/test scripts), `pnpm-workspace.yaml`, `.gitignore`, `.env.example`, root `tsconfig.json`.
- Created `apps/web/` (Next.js 15 + React 19 + Tailwind 4 + shadcn deps + React Hook Form + Zod + path aliases + ESLint + placeholder `page.tsx`/`layout.tsx`).
- Created `apps/api/` (Express 5 + Mongoose + Helmet + CORS + rate limiter + Zod + tsx + ESLint + placeholder `app.ts`/`server.ts`).
- Created `packages/contracts/` (Zod + TypeScript + placeholder `index.ts`).
- Installed pnpm globally, ran `pnpm install` (411 packages), approved esbuild/unrs-resolver builds.
- Fixed TS2742 in `apps/api/src/app.ts` (added `Express` type annotation).
- Verified: `pnpm -r run typecheck` passes across all 3 workspaces.
- Workspace resolution confirmed: both `apps/web` and `apps/api` link to `@gopratle/contracts`.
- **Committed:** `chore: scaffold monorepo with pnpm workspaces` (24d72bf)
- Next: Milestone 2 — shared Zod contracts in `packages/contracts`.

### 2026-09-08 — Add Engineering Principles to system.md
- Replaced §1 Core Principles with expanded §1 Engineering Principles (§1.1–§1.11: think-before-coding, simplicity + 200-line guideline, surgical changes, goal-driven execution, verification, dependency/architecture discipline, ask-before-architecture, comments, git, definition of done), preserving project-specific stack guidance.
- Verified: edit applied to `system.md`.
- Next: scaffold monorepo.

### 2026-09-08 — Add MCP / External Tooling Policy to system.md
- Added `# 19. MCP / External Tooling Policy` (Playwright verification, Context7 docs, DB verification, tool discipline, verification chain); renumbered Verification → §20, Final Review → §21.
- Verified: read `system.md:701-827`, edits applied.
- Next: scaffold monorepo.

### 2026-09-08 — Add Git Commit Policy to system.md
- Added `## Git Commit Policy` under §18 Git Discipline: no auto-commits, summarize + validate + suggest message + ask approval.
- Verified: read `system.md:701-723`, edit applied.
- Next: scaffold monorepo (`apps/web`, `apps/api`, `packages/contracts`), root tooling + README.

### 2026-09-08 — Init memory tracker
- Created `memory.md` to track work going forward.
- Reviewed existing docs: `plan.md` (19 phases), `system.md` (AI operating contract), `ui.md` (wizard design direction).
- Next: scaffold monorepo (`apps/web`, `apps/api`, `packages/contracts`), root tooling + README.

<!-- Add new entries on top of this list, newest first. Template:
### YYYY-MM-DD — Short title
- What done:
- What verified (lint/test/build/manual):
- Decisions / tradeoffs:
- Next:
-->

## 5. Phase Checklist
- [ ] Phase 1 — Product contract written
- [ ] Phase 2 — UX direction locked
- [x] Phase 3 — Repo scaffold + `npm run dev/lint/typecheck/test/build`
- [x] Phase 4 — Contracts package + schema tests
- [x] Phase 5 — Backend API (`POST /api/v1/requirements`, `GET /:id`, health, error envelope)
- [x] Phase 6 — Frontend wizard Step 1
- [x] Phase 7 — Steps 2–3 category-aware
- [x] Phase 8 — Review step
- [x] Phase 9 — API integration
- [x] Phase 10 — Success state
- [x] Phase 11 — Hardening (helmet, CORS, rate-limit, a11y)
- [x] Phase 12 — Testing matrix (unit/API/UI/E2E)
- [x] Phase 13 — Deployment (Dockerfile, .dockerignore)
- [x] Phase 14 — README + reviewer experience
- [ ] Demo data + 5–7 min video

## 6. Next Up
1. Demo data + video recording.

## 7. Open Questions / Risks
- Backend host choice for production deployment (Render, Railway, Fly.io)?
- Budget currency assumption (INR, numeric)?

## 8. Useful Commands
```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```
