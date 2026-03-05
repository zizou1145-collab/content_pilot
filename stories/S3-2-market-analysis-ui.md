# Story: S3-2 — Market analysis UI
# قصة: S3-2 — واجهة تحليل السوق

**Sprint:** 3  
**Created:** 2025-03-05  
**Status:** Draft

---

## Summary | الملخص

In the project detail view, the user can run or refresh market analysis, see a loading state, and then view the results: content types, post ideas, and strategies. Errors (e.g. API failure, no analysis yet) are handled with clear messages and optional retry. This builds on the project detail layout from S3-1 and feeds into content plan generation (S3-3).

---

## Acceptance criteria | معايير القبول

- [ ] **Run/Refresh market analysis:** In project view (`/[locale]/projects/[id]`), a clear action (e.g. “Run market analysis” or “Refresh analysis”) triggers `POST /api/v1/market/:projectId`; only authenticated owners of the project can run it; button/label uses i18n (ar/en).
- [ ] **Loading state:** While the analysis request is in progress, show a loading indicator (spinner, skeleton, or “Analyzing…” message); disable the run/refresh button during the request to avoid double submission.
- [ ] **Display content types:** When analysis exists (from GET or after POST), display the **content types** (array of strings) in a readable way (e.g. list or tags); empty state if the array is empty or null; labels use i18n.
- [ ] **Display post ideas:** Display the **post ideas** (array of strings) in a readable way (e.g. list, cards, or expandable list); empty state if empty or null; i18n for section title and empty message.
- [ ] **Display strategies:** Display the **strategies** object (e.g. `platforms`, `tone`, `frequency`, or `summary`) in a readable way; handle both object shape and single `summary` string; empty state if null; i18n for labels.
- [ ] **No analysis yet:** When `GET /api/v1/market/:projectId` returns `{ analysis: null }`, show an empty state with a CTA to “Run market analysis” (no error tone); do not show content types/post ideas/strategies sections with empty data as if they were loaded.
- [ ] **Error handling:** On POST or GET failure (4xx/5xx, network error), show a user-friendly message and optional “Retry” or “Run again”; do not leave the UI in a permanent loading state. If 404 (project not found), align with S3-1 (not-found/redirect). All error copy uses i18n.
- [ ] **RTL and layout:** Market analysis section respects RTL when locale is `ar` (per S2-2); layout fits within project detail and is consistent with S3-1 styling.

---

## Tasks | المهام

- [ ] Add translation keys for market analysis: section title, runAnalysis, refreshAnalysis, loading, contentTypes, postIdeas, strategies, noAnalysisYet, runAnalysisCta, errorMessage, retry, emptyContentTypes, emptyPostIdeas, emptyStrategies; plus any strategy sub-labels (e.g. platforms, tone, frequency, summary) in both `ar` and `en`.
- [ ] In project detail page (`/[locale]/projects/[id]`), add a “Market analysis” section: on mount (or when entering the section), call `GET /api/v1/market/:projectId` with auth token to load existing analysis; store result in state (`analysis` or `null`).
- [ ] Add “Run market analysis” / “Refresh analysis” button: calls `POST /api/v1/market/:projectId`; while request is in progress show loading state and disable button; on 201 update local state with returned `analysis` and display it; on 404 show not-found (consistent with S3-1); on 500 or other errors show error message and retry.
- [ ] Render content types: if `analysis.contentTypes` is a non-empty array, display as list or tags; if empty or null, show “No content types” or hide section / show empty state within section; use i18n.
- [ ] Render post ideas: if `analysis.postIdeas` is a non-empty array, display as list (numbered or bullet); if empty or null, show empty state; use i18n.
- [ ] Render strategies: if `analysis.strategies` is an object, display key–value pairs (e.g. platforms, tone, frequency); if it has a `summary` string, display it; if null or empty, show empty state; use i18n for keys.
- [ ] Empty state when no analysis: when `GET` returns `{ analysis: null }`, show a single clear message (e.g. “No market analysis yet”) and primary CTA “Run market analysis”; do not show the three data sections until analysis exists.
- [ ] Apply RTL: use logical properties and existing RTL from S2-2 for the market analysis block (headings, lists, strategy key–value layout).
- [ ] Manually test: open a project, run analysis (loading → success), refresh and see updated data; test with no analysis (empty state); test API error (e.g. disconnect) and retry; verify ar/en and RTL.

---

## Notes / API / References

- **ARCHITECTURE:** [ARCHITECTURE.md](../ARCHITECTURE.md) — Frontend: “project detail”; market analysis is consumed in the UI and used as context for content plan generation (S3-3).
- **Sprint plan:** S3-2 — “In project view: ‘Run/Refresh market analysis’; loading state; display content types, post ideas, strategies; handle errors.”
- **Backend APIs:** [backend/src/routes/market.js](../backend/src/routes/market.js)
  - **POST /api/v1/market/:projectId** — Auth required; user must own project. Runs AI market analysis and creates a MarketAnalysis record. Returns 201 `{ analysis: { id, contentTypes, postIdeas, strategies, createdAt } }` or 404 `{ error: 'Project not found' }`. May 500 if AI service fails.
  - **GET /api/v1/market/:projectId** — Auth required; user must own project. Returns latest analysis: `{ analysis: { id, contentTypes, postIdeas, strategies, createdAt } }` or `{ analysis: null }` if none. 404 if project not found.
- **Response shapes:** `contentTypes` and `postIdeas` are arrays of strings; `strategies` is an object (e.g. `{ platforms: [], tone: '', frequency: '' }` or `{ summary: '...' }`). See [backend/src/services/ai.js](../backend/src/services/ai.js) for AI output structure.
- **Depends on:** S2-1 (Next.js, i18n, API base), S2-2 (RTL), S2-3/S2-5 (auth, token), S3-1 (project detail page and layout). S3-3 will use the presence of market analysis when generating monthly plans.

---

*Story format: Content Pilot | بايلوت المحتوى*
