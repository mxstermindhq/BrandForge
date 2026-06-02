# BrandForge Audit & Fix Report

**Date:** 2026-05-19 (updated)  
**Scope:** Full remediation pass on `brandforge/` + `mxstermind/`  
**Production:** https://brandforge.gg · https://mxstermind.com

---

## Status: complete

| Check | Status |
|-------|--------|
| Production build | ✅ 56 routes |
| ESLint (`eslint .`) | ✅ Both apps |
| Dev route removed | ✅ `/components-preview/` |
| JSON-LD cross-entity | ✅ `sameAs` + `parentOrganization` |
| Blog editorial depth | ✅ +4 sections × 10 posts |
| Mobile GSAP skip | ✅ `useSkipMotion()` |
| Desktop perf | ✅ Lazy home sections, 1800 particles (was 3200) |
| Color contrast | ✅ `--muted` / `--m2` lightened |
| mxstermind llms/manifest | ✅ Rewritten for mxstermind |
| mxstermind broken redirects | ✅ terms/privacy redirects removed |

---

## Sitemap

**51 indexable URLs** in `sitemap.ts` (12 hubs + 39 dynamic slugs).  
**56 static export routes** includes `_not-found`, `robots.txt`, `sitemap.xml`, and RSC aux.

---

## Lighthouse

Desktop home perf was **61** pre-lazy-load. Re-run after deploy to measure lazy sections + particle reduction.

---

## Optional future polish

- Re-run Lighthouse on production home (mobile + desktop) after deferred ScrollTrigger deploy
- Custom mxstermind OG artwork (distinct from BrandForge purple variant) if brand design requires it

---

## Completed in final pass

- Deferred ScrollTrigger via `useMotionInView()` on pin/stack/portfolio/vouches sections
- mxstermind `/terms/` and `/privacy/` pages + sitemap + footer + redirects
- Blog expansion: brandforge ~8 sections/post, mxstermind ~5+ sections/post
- Audit docs and phase checklist updated
