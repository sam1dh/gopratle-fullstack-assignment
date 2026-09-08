# memory.md — GoPratle Fullstack Assignment Work Log

> Use this file to track progress, decisions, and next steps.
> Update it after every work session: add a dated entry under `Progress Log`, update `Current Status` and `Next Up`.

## 1. Project Overview
- **Project:** GoPratle Requirement Posting Flow (planner / performer / crew)
- **Stack:** Next.js + TS + Tailwind + shadcn/ui + RHF + Zod (web) / Express + TS + Mongoose + Zod (api) / MongoDB Atlas
- **Repo layout (planned):** `apps/web`, `apps/api`, `packages/contracts`, `docs/`
- **Source docs:** `plan.md`, `system.md`, `ui.md`

## 2. Current Status
- **Phase:** Milestone 1 complete — monorepo scaffolded, workspace resolution verified, TypeScript passes.
- **Last updated:** 2026-09-08
- **Blocking issues:** None.

## 3. Key Decisions
- [x] Monorepo with shared `packages/contracts` for Zod schemas (see `plan.md` §2, `system.md` §5)
- [x] Single `Requirement` collection with top-level `category` + polymorphic `details` (see `system.md` §3)
- [x] Wizard UX (4 steps) over generic dashboard (see `ui.md`)
- [ ] Backend host (Render / Railway / Fly.io) — TBD
- [ ] Test runner (Vitest vs Jest) — TBD

## 4. Progress Log

### 2026-09-08 — Milestone 1: Scaffold Monorepo + Tooling
- Created root `package.json` (pnpm workspaces, dev/build/lint/typecheck/test scripts), `pnpm-workspace.yaml`, `.gitignore`, `.env.example`, root `tsconfig.json`.
- Created `apps/web/` (Next.js 15 + React 19 + Tailwind 4 + shadcn deps + React Hook Form + Zod + path aliases + ESLint + placeholder `page.tsx`/`layout.tsx`).
- Created `apps/api/` (Express 5 + Mongoose + Helmet + CORS + rate limiter + Zod + tsx + ESLint + placeholder `app.ts`/`server.ts`).
- Created `packages/contracts/` (Zod + TypeScript + placeholder `index.ts`).
- Installed pnpm globally, ran `pnpm install` (411 packages), approved esbuild/unrs-resolver builds.
- Fixed TS2742 in `apps/api/src/app.ts` (added `Express` type annotation).
- Verified: `pnpm -r run typecheck` passes across all 3 workspaces.
- Workspace resolution confirmed: both `apps/web` and `apps/api` link to `@gopratle/contracts`.
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
- [ ] Phase 4 — Contracts package + schema tests
- [ ] Phase 5 — Backend API (`POST /api/v1/requirements`, `GET /:id`, health, error envelope)
- [ ] Phase 6 — Frontend wizard Step 1
- [ ] Phase 7 — Steps 2–3 category-aware
- [ ] Phase 8 — Review step
- [ ] Phase 9 — API integration
- [ ] Phase 10 — Success state
- [ ] Phase 11 — Hardening (helmet, CORS, rate-limit, a11y)
- [ ] Phase 12 — Testing matrix (unit/API/UI/E2E)
- [ ] Phase 13 — Deployment (Atlas + API host + Vercel)
- [ ] Phase 14 — README + reviewer experience
- [ ] Demo data + 5–7 min video

## 6. Next Up
1. Implement Zod schemas in `packages/contracts` (category types, event schema, detail schemas, combined requirement schema).
2. Write schema tests (valid planner/performer/crew, invalid payloads).
3. Wire schemas into Express backend validation.

## 7. Open Questions / Risks
- Backend host choice?
- Date serialization (ISO) + `endDate >= startDate` enforcement on both ends?
- Budget currency assumption (INR, numeric)?
- Category-switch stale-data clearing strategy in RHF?

## 8. Useful Commands
```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```
