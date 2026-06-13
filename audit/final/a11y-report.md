# Accessibility — Post-Sprint 7 Audit

**Audit date:** 2026-06-13

---

## Lighthouse Scores (Home)

| Form factor | Accessibility | Target | Status |
|-------------|---------------|--------|--------|
| Mobile | **96** | ≥95 | PASS |
| Desktop | **96** | ≥95 | PASS |

Source: `audit/final/lighthouse/home-mobile.json`, `home-desktop.json`

---

## Contrast

| Check | Status | Notes |
|-------|--------|-------|
| WCAG AA normal text | PASS | Lighthouse contrast audit clean on home |
| `--muted` color | PASS | No failures flagged in Lighthouse a11y category |

---

## Motion & Interaction

| Component | Reduced motion support |
|-----------|------------------------|
| LiveWorkMarquee | PASS — static grid fallback |
| Trust counters | PASS — static when reduced |
| Lenis / GSAP pages | PASS — `useReducedMotion()` gates |
| Home (static) | N/A — no motion stack |

---

## Focus & Navigation

| Check | Status |
|-------|--------|
| `:focus-visible` styles | PASS (global CSS) |
| Mobile nav trap + Escape | PASS (`SiteHeader` / `StaticSiteHeader`) |
| Heading hierarchy | PASS (content templates) |
| Portfolio semantic HTML | PASS (`<article>` cards) |
| Image alt text | PASS (OptimizedPicture requires alt) |
| Form labels | N/A — no email forms (Discord/Telegram intake) |

---

## Screen Reader

| Check | Status |
|-------|--------|
| FAQ accordion buttons | PASS |
| Copy buttons announce success | PASS (`CopyInviteButton`) |
| Store price + buy label | PASS |
| Cross-nav labels | PASS ("MXSTERMIND" / "BrandForge" explicit) |

---

## Grade: **A-**

Home accessibility exceeds targets. Full manual audit of all 91 pages not performed.
