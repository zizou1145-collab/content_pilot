# Story: S1-1 — Implement AI service
# قصة: S1-1 — تنفيذ خدمة الذكاء الاصطناعي

**Sprint:** 1  
**Created:** 2025-03-04  
**Status:** Draft

---

## Summary | الملخص

Implement `backend/src/services/ai.js` with `analyzeMarket()` and `generateMonthlyPlan()` using an OpenAI (or compatible) API, so that market analysis and content plan routes work end-to-end without 500 errors.

---

## Acceptance criteria | معايير القبول

- [ ] **`services/ai.js`** exists with two exported functions:
  - `analyzeMarket(project, locale)` — returns structured analysis (content types, post ideas, strategies); uses project fields (country, field, description, strengths).
  - `generateMonthlyPlan(project, { month, year }, marketAnalysis, locale)` — returns array of plan items (publishDate, postIdea, postCopy, contentType, objective).
- [ ] Prompts and responses support **AR and EN** per `locale`.
- [ ] **OpenAI (or compatible)** API is used; API key from env (e.g. `OPENAI_API_KEY`).
- [ ] Errors (e.g. API failure, invalid key) are caught and passed to the route (no unhandled rejections); routes return appropriate status and message.
- [ ] Market and content-plan routes call these functions instead of stubs/mocks.

---

## Tasks | المهام

- [ ] Create `backend/src/services/ai.js`.
- [ ] Implement `analyzeMarket(project, locale)` with structured prompt and response parsing.
- [ ] Implement `generateMonthlyPlan(project, { month, year }, marketAnalysis, locale)` with structured prompt and response parsing.
- [ ] Wire `POST /api/v1/market/:projectId` to `analyzeMarket` and persist to `MarketAnalysis`.
- [ ] Wire `POST /api/v1/content-plans/project/:projectId/generate` to `generateMonthlyPlan` and persist `ContentPlan` + `ContentPlanItem`s.
- [ ] Add `OPENAI_API_KEY` to config and `.env.example`; handle missing key gracefully.
- [ ] Manual test: run analysis and generate plan for a project (AR and EN).

---

## Notes / API / References

- **Config:** `backend/src/config.js` — add `openaiApiKey` (or similar).
- **Schema:** `ContentPlanItem` has `contentType` enum: `educational`, `promotional`, `introductory`, `success_story`.
- **ARCHITECTURE:** AI service is stateless; rate/cost controlled via provider.

---

*Story format: Content Pilot | بايلوت المحتوى*
