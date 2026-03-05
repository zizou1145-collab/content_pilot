# MVP Release Checklist
# قائمة التحقق لإصدار النسخة الأولى

**Version:** 1.0  
**Date:** 2025-03-05  
**Story:** S4-5 MVP polish ([stories/S4-5-mvp-polish.md](stories/S4-5-mvp-polish.md))

---

## Purpose | الغرض

Use this checklist before releasing the MVP. It aligns with [PRD §11 — Acceptance Criteria Checklist (MVP)](PRD.md) and Sprint 4 Definition of done in [SPRINT_PLAN.md](SPRINT_PLAN.md).

---

## 1. PRD §11 — Acceptance criteria

| # | Criterion | Pass | Notes |
|---|-----------|------|--------|
| 1 | Registration and login work; dashboard shows subscription and projects. | ☐ | |
| 2 | Create project with all required fields; edit project works. | ☐ | |
| 3 | Market analysis runs and is stored and displayed; refresh works. | ☐ | |
| 4 | Monthly content plan is generated; user can edit items (date, idea, copy, type, objective) and regenerate. | ☐ | |
| 5 | Export to Excel produces file with required columns (Date, Post idea, Content text, Content type, Objective). | ☐ | |
| 6 | Brand settings (logo, colors, theme, optional reference) are saved; design generation produces images; user can download. | ☐ | |
| 7 | Subscription limits (projects, plans, designs) are enforced with clear messaging. | ☐ | |
| 8 | UI is fully functional in Arabic (RTL) and English. | ☐ | |
| 9 | API is versioned, authenticated, and authorized; errors and validation are handled. | ☐ | |

---

## 2. Sprint 4 Definition of done

- [ ] User can set brand (logo, colors, theme) and generate post designs; download assets.
- [ ] All PRD MVP acceptance criteria above pass.
- [ ] UI fully usable in Arabic (RTL) and English.

---

## 3. S4-5 Polish — Bugs & i18n & RTL

- [ ] **Bug triage:** No open P0 bugs; P1 documented or fixed.
- [ ] **i18n:** All user-facing screens have `ar` and `en` strings; no untranslated keys or hardcoded English in UI.
- [ ] **RTL:** With locale `ar`, document `dir="rtl"`; layout, forms, tables, modals, brand/design screens correct; language switcher and locale persistence work.
- [ ] **Errors & limits:** 403 and other API errors show clear, translated messages; limit copy consistent in ar/en.

---

## 4. Smoke test (full flow)

Run in **Arabic** and **English**:

1. Register → Login → Dashboard (subscription + projects).
2. Create project (name, country, field, description, strengths).
3. Run market analysis → view content types, ideas, strategies.
4. Generate monthly plan → edit items → regenerate (with confirm).
5. Export plan to Excel → verify columns and AR headers when locale is ar.
6. Set brand: upload logo, colors, theme, optional reference URL → save.
7. Generate designs (selection or all) → list assets → download single and “Download all”.
8. Switch locale mid-flow; confirm UI updates and RTL on all screens.

---

## 5. Sign-off

| Role | Name | Date |
|------|------|------|
| Dev | | |
| QA / Product | | |

---

*Checklist version: 1.0 | تاريخ: 2025-03-05*
