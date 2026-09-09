# Demo Video Script — GoPratle Requirement Posting Flow (5–7 min)

> Goal: prove the assignment brief end-to-end — working form, working API,
> data visibly stored in MongoDB — plus the voice-AI differentiator.
> Record at 1080p with OBS/Loom. Speak the **SAY** lines, do the **DO** steps.

## 0. Before recording (checklist)

- [ ] Open these tabs: (1) live app, (2) GitHub repo, (3) Postman, (4) Atlas → Browse Collections
- [ ] Live app: https://gopratle-fullstack-assignment-web.vercel.app
- [ ] Repo: https://github.com/sam1dh/gopratle-fullstack-assignment
- [ ] API base: https://gopratle-fullstack-assignment.onrender.com
- [ ] Chrome with mic permission allowed for the app tab
- [ ] Cold-start the API first: open `…/api/v1/health` in a tab, wait for `{"status":"ok"}`
- [ ] Close extra tabs, silence notifications, zoom browser to 100%

---

## Scene 1 — Intro + repo (0:00–0:45)

**DO:** Show GitHub repo tab. Scroll README slowly.
**SAY:**
> "Hi, I'm [name]. This is my GoPratle assignment — a requirement posting flow
> with a Next.js frontend, Express + MongoDB backend, and a voice-first AI
> assistant. The repo is a pnpm monorepo: apps/web, apps/api, and a shared
> Zod contracts package, so frontend and backend validate against the same
> schemas. Live app link and repo link are in my submission."

---

## Scene 2 — Form flow, Steps 1–2 (0:45–2:30)

**DO:** App tab. Fill Step 1 live:
- Event name: "Diwali Launch Night"
- Event type: Concert
- Dates: 2026-10-01 → 2026-10-02
- Location: type "Hyderabad", **click a Google suggestion** (point out the dropdown)
- Category: click **Performer**
- Click Continue → Step 2 appears

**DO:** Fill Step 2 (performer): performance type DJ, count 2, duration 120, budget 75000. Continue.
**SAY:**
> "Step 1 captures event basics plus the category selector. Location is a real
> Google Places autocomplete proxied through our backend so the key never
> reaches the browser. Steps 2 and 3 adapt to the category — I'm posting as a
> performer, so I get performance type, genre, count, duration, and budget."

---

## Scene 3 — Voice automation + Step 3 (2:30–3:45)

**DO:** Add `?voice-debug=1` to the app URL (inspector panel appears).
Click the mic, say: *"set special requirements to veg catering only"*.
Point at the inspector: transcript → reply → action → timing. The textarea fills.
Then say *"next"* → wizard advances to Review.
**SAY:**
> "The differentiator: a voice assistant. Speech recognition runs in the
> browser, commands like set, select, next, and submit are parsed locally —
> instant and quota-free. Open questions go to Groq with an OpenRouter
> fallback, and speech replies come from Cartesia with a Sarvam fallback.
> The debug panel shows the whole pipeline live."

---

## Scene 4 — Submit + API request/response (3:45–5:00)

**DO:** Before clicking Submit, open DevTools → Network → Fetch/XHR.
Click Submit → success screen with requirement ID.
Click the `POST requirements → 201` row → show **Payload** tab, then **Response** tab. Copy the `id`.
**SAY:**
> "On submit the frontend POSTs to /api/v1/requirements. Status 201, and the
> response returns the ID, category, and status. Every field is validated by
> the same Zod contract on both sides."

**DO:** Switch to Postman. Show two saved requests:
1. `GET /api/v1/requirements/<PASTE_ID>` → Send → stored JSON appears.
2. `POST /api/v1/assistant/message` with `{"message":"set event name to Demo",…}` → Send → reply + suggestedAction appears.
**SAY:**
> "Same API, read back directly: the document we just created, and the voice
> endpoint returning a structured form action, not just chat text."

---

## Scene 5 — MongoDB (5:00–6:00)

**DO:** Atlas tab → Browse Collections → `gopratle.requirements` → open newest document.
Point at: `_id` (matches the API response ID), `category: "performer"`, `event` object, `details` object, `status`, timestamps.
**SAY:**
> "And here it is in MongoDB Atlas — one requirements collection, categorised
> under performer, with the event object, category details, submitted status,
> and timestamps. Exactly what the API returned."

---

## Scene 6 — Close (6:00–6:30)

**DO:** Back to repo tab, scroll file tree briefly.
**SAY:**
> "Clean monorepo structure, 170+ automated tests, typed end to end. Links are
> in the submission. Thank you!"

---

## Submission checklist

- [ ] Live frontend URL (Vercel)
- [ ] GitHub repo link (public)
- [ ] Video link (unlisted YouTube / Drive)
- [ ] All three links sent to GoPratle

## If something goes wrong while recording

- API slow first call → Render free tier cold-starts (~30s); hit `/health` first, keep tab open
- Mic not capturing → Chrome address bar → mic icon → Allow; must be HTTPS (Vercel is)
- Location dropdown empty → Google key optional; field still accepts typed text
- Keep going, don't restart — a small live hiccup handled calmly reads well
