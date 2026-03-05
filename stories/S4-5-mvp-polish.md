# Story: S4-5 — MVP polish
# قصة: S4-5 — صقل النسخة الأولى

**Sprint:** 4  
**Created:** 2025-03-05  
**Status:** In progress

---

## Summary | الملخص

Close out the MVP by fixing outstanding bugs, ensuring Arabic/English and RTL work consistently across all screens (including Sprint 4 brand and design flows), and running through the PRD acceptance checklist so the product is ready for release.

---

## Acceptance criteria | معايير القبول

- [ ] **Bugs:** All known critical/high bugs from S1–S4 are triaged; P0 bugs are fixed or documented as known issues with workaround. No regressions on core flows (auth, projects, analysis, plans, export, brand, designs).
- [ ] **AR/EN and RTL:** Every user-facing screen and flow has correct `ar` and `en` strings; when locale is Arabic, document and layout are RTL; forms, tables, modals, and design/brand screens behave correctly in both directions. No untranslated keys or hardcoded English in user-facing text.
- [ ] **PRD acceptance checklist passed:** All items in [PRD §11](PRD.md) are verified (registration/login, dashboard, project CRUD, market analysis, content plan generate/edit/regenerate, Excel export, brand settings, design generation and download, subscription limits, full AR/EN+RTL, API behavior).
- [ ] **Consistency:** Error messages, loading states, and limit-reached messaging are consistent between Arabic and English and aligned with backend responses (e.g. 403 project/plan/design limit).
- [ ] **Definition of done (Sprint 4):** User can set brand (logo, colors, theme) and generate post designs; download assets; all PRD MVP acceptance criteria pass; UI fully usable in Arabic (RTL) and English.

---

## Tasks | المهام

- [ ] **Bug triage:** Collect and list outstanding bugs from testing or prior stories; label P0/P1; fix P0 or add to known-issues with workaround; ensure no new P0 from S4 flows.
- [ ] **i18n audit:** Walk every route/screen (auth, dashboard, project list/detail, market analysis, content plan, export, brand settings, design generation, asset list/download); ensure all labels, buttons, placeholders, errors, and toasts have `ar` and `en` entries; fix missing or fallback keys.
- [ ] **RTL audit:** With locale `ar`, verify: document `dir="rtl"`, layout (flex/grid, margins, text align), forms, tables, modals, brand/design screens; fix overflow, alignment, or icon-mirroring issues. Test language switcher and persistence of locale.
- [ ] **PRD checklist run-through:** Execute each item in PRD §11 (registration, login, dashboard, create/edit project, market analysis run/display/refresh, content plan generate/edit/regenerate, Excel export, brand logo/colors/theme, design generation and download, subscription-limit messaging, full AR/EN+RTL, API versioning/auth/errors). Record pass/fail; fix any failures.
- [ ] **Error and limit messaging:** Confirm 403 and other API error handling show clear, translated messages; subscription limit copy matches backend and is consistent in ar/en. No raw error codes or untranslated strings.
- [ ] **Smoke test:** Full flow in both locales: register → login → create project → run analysis → generate plan → edit items → export Excel → set brand → generate designs → download assets; switch locale mid-flow and confirm UI updates; verify RTL on all screens.
- [x] **Docs/checklist:** [MVP_RELEASE_CHECKLIST.md](../MVP_RELEASE_CHECKLIST.md) added; run before release. Update or add a short “MVP release checklist” (or mark SPRINT_PLAN Definition of done for S4) once all criteria are met.

---

## Notes / API / References

- **MVP release checklist:** [MVP_RELEASE_CHECKLIST.md](../MVP_RELEASE_CHECKLIST.md) — run-through template aligned with PRD §11 and S4 DoD.
- **Sprint plan:** S4-5 — “Fix outstanding bugs; ensure AR/EN and RTL work across all new screens; run through PRD acceptance checklist.” ([SPRINT_PLAN.md](../SPRINT_PLAN.md))
- **PRD §11 — Acceptance Criteria Checklist (MVP):** [PRD.md §11](../PRD.md) — Registration/login, dashboard, project CRUD, market analysis, content plan, Excel export, brand and design generation/download, subscription limits, full AR/EN+RTL, API behavior.
- **Sprint 4 DoD:** User can set brand and generate post designs; download assets; all PRD MVP acceptance criteria pass; UI fully usable in Arabic (RTL) and English.
- **Depends on:** S4-1 (brand settings UI), S4-2 (design generation backend), S4-3 (design generation frontend), S4-4 (asset download in UI); and all S2/S3 stories for auth, dashboard, projects, analysis, plans, export, and subscription limits in UI.
- **Optional:** If time allows, run a quick accessibility pass (focus order, labels) for key flows.

---

*Story format: Content Pilot | بايلوت المحتوى*
