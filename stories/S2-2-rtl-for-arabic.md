# Story: S2-2 — RTL for Arabic
# قصة: S2-2 — اتجاه من اليمين لليسار للعربية

**Sprint:** 2  
**Created:** 2025-03-04  
**Status:** In progress

---

## Summary | الملخص

When the app locale is Arabic (`ar`), the document direction and layout are right-to-left (RTL); the root layout and key shared components use RTL-aware styling (dir, flex/grid, margins, text alignment) so the entire UI reads and flows correctly in Arabic.

---

## Acceptance criteria | معايير القبول

- [ ] When locale is `ar`, the document (HTML or root element) has `dir="rtl"` and `lang="ar"` (or equivalent) so the browser and assistive tech treat the page as RTL.
- [ ] When locale is `en`, the document has `dir="ltr"` and `lang="en"` so LTR is explicit.
- [ ] Root layout (e.g. main shell, nav, footer) respects RTL: flex/grid direction, margins, and padding flip appropriately for RTL (e.g. logical properties or RTL-specific styles).
- [ ] Key shared components (e.g. header, sidebar, buttons, forms, cards) use RTL-aware layout: text alignment, icons, and spacing behave correctly in both `ar` and `en`.
- [ ] No hardcoded `margin-left` / `margin-right` or `text-align: left` where logical equivalents (e.g. `margin-inline-start`, `text-align: start`) would support RTL; or RTL overrides are applied when `dir="rtl"`.
- [ ] Switching locale (e.g. from `ar` to `en` or vice versa) updates `dir` and layout without full reload if the i18n setup supports it; otherwise a navigation/reload that applies the new locale is acceptable.
- [ ] At least one representative page (e.g. home or dashboard shell from S2-4) is verified to look correct in both RTL and LTR.

---

## Tasks | المهام

- [ ] Set document `dir` and `lang` from current locale in the root layout (e.g. in `app/[locale]/layout.tsx` or `_document`); use `ar` → `dir="rtl"`, `en` → `dir="ltr"`.
- [ ] Add a minimal global RTL/LTR style hook or CSS layer (e.g. `[dir="rtl"]` overrides, or logical properties in base components) so layout flips consistently.
- [ ] Audit root layout and shared components (header, nav, footer, main container): replace physical directions with logical ones (e.g. `margin-inline-start`, `padding-inline-end`, `text-align: start`) or add RTL-specific rules where needed.
- [ ] Ensure flex/grid in key components use `direction` or logical equivalents (e.g. `flex-direction` or `dir` inheritance) so order and alignment flip in RTL.
- [ ] Check icon placement (e.g. chevrons, arrows, close buttons): use logical sides or flip icons when `dir="rtl"` so they match reading direction.
- [ ] Document in story or frontend README how RTL is applied (e.g. “dir and lang from locale; layout uses logical properties / RTL overrides”).
- [ ] Manually verify one representative page in both `ar` (RTL) and `en` (LTR) and note any follow-up tweaks for S2-4/S3.

---

## Notes / API / References

- **ARCHITECTURE:** [ARCHITECTURE.md](../ARCHITECTURE.md) — Frontend: “i18n, RTL for Arabic”; users interact via web app with AR/EN and RTL.
- **Sprint plan:** S2-2 — “When locale is `ar`, document dir and layout are RTL; layout and key components respect RTL (flex/grid, margins, text align).”
- **Depends on:** S2-1 (Next.js setup, i18n with `ar`/`en` and locale in App Router). Layout and components may be minimal until S2-4 (dashboard shell); this story establishes the RTL mechanism and applies it to whatever layout exists.
- **CSS:** Prefer logical properties (`margin-inline-start`, `padding-block-end`, `inset-inline-start`) and `text-align: start` / `end` so one set of styles works for both directions; use `[dir="rtl"]` overrides only where necessary (e.g. third-party icons).
- **next-intl:** If using next-intl, `dir` can be set from locale in the root layout; ensure the locale segment and middleware from S2-1 are used so `dir` stays in sync with the active locale.

---

## Implementation notes (S2-2)

- **dir/lang:** Root layout `app/layout.tsx` sets `<html lang={locale} dir={dir}>` from `x-next-intl-locale` (ar → rtl, en → ltr).
- **Global RTL:** `app/globals.css` documents logical properties and adds a small `@layer utilities` with `.flip-icon-inline` for RTL icon flipping when needed.
- **Components:** Home page content uses `text-start` and no physical margins; flex layout inherits dir. No `ml-*`/`mr-*` or `text-left` in current components.
- **Docs:** Frontend README has an "RTL (Arabic)" section describing how dir/lang and logical properties are applied.
- **Verify:** Manually check `/ar` (RTL) and `/en` (LTR) on the home page; follow-up tweaks for dashboard shell in S2-4/S3 as needed.

---

*Story format: Content Pilot | بايلوت المحتوى*
