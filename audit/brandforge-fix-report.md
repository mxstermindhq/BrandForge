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

- Push desktop perf further (defer ScrollTrigger until in-view)
- mxstermind terms/privacy pages if legal URLs needed on that domain
- Blog posts toward full 1,200-word spec (currently ~500–700 words/post)
