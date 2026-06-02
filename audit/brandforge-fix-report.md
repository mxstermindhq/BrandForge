# BrandForge Audit & Fix Report

**Date:** 2026-05-19  
**Scope:** Post-launch QA on `brandforge/` (56 static routes)  
**Production:** https://brandforge.gg

---

## Audit summary

| Check | Before | After |
|-------|--------|-------|
| Production build | ✅ 57 routes | ✅ 56 routes (dev route removed) |
| ESLint | ❌ Interactive prompt, exit 1 | ✅ `eslint.config.mjs` — warnings only |
| `/components-preview/` | ❌ Shipped in prod, not in sitemap | ✅ Removed |
| JSON-LD `sameAs` | Discord + Telegram only | ✅ + mxstermind.com |
| Blog article URL | Hardcoded `brandforge.gg` | ✅ Uses `SITE.url` |
| `llms.txt` | Basic packages blurb | ✅ Hub URLs added |
| Mobile GSAP | Ran on ≤768px | ✅ `useSkipMotion()` skips scroll/pin animations |
| Lint warnings | — | ✅ Unused imports cleaned (about, packages, scene-uniforms) |

---

## Fixes applied

1. **Removed `/components-preview/`** — internal QA page should not ship in static export.
2. **Added `eslint.config.mjs`** — FlatCompat + `next/core-web-vitals` + `next/typescript`.
3. **Schema** — `sameAs` now includes `SITE.premium` (mxstermind.com).
4. **Blog `[slug]`** — Article JSON-LD URL uses `${SITE.url}${path}`.
5. **`llms.txt`** — Added services, packages, portfolio, about, contact, blog, roadmap, ethics hubs.
6. **Mobile perf** — New `useSkipMotion()` hook; all GSAP scroll/pin/typography sections skip on mobile lite (≤768px) or reduced motion.
7. **Lint cleanup** — Removed unused imports in about, packages, scene-uniforms.

---

## Lighthouse (home, production)

| Form factor | Performance | Notes |
|-------------|-------------|-------|
| Desktop | **61** | LCP ~2.1s, TBT ~680ms — GSAP + Three.js on desktop still heavy |
| Mobile | Not re-run | Prior run failed (Puppeteer WS error); mobile lite mode should improve TBT |

Desktop perf bottleneck remains ScrollTrigger pin sections + WebGL hero on large viewports. Mobile lite already skips WebGL/Lenis/loader/cursor; this pass also skips GSAP on ≤768px.

---

## Remaining (optional polish)

- Expand blog posts toward 1,200-word editorial spec
- Desktop perf: lazy-load GSAP sections below fold, reduce Three.js particle count
- Update `audit/content-audit.md` route count (still says 4 routes)
- Migrate `next lint` → ESLint CLI before Next.js 16

---

## Route count

**56 public routes** — matches sitemap (57 URLs minus removed components-preview).
