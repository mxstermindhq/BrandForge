# BrandForge Lighthouse Audit — Phase 6

**Date:** 2026-05-19  
**App:** `brandforge/` production build (`next build` + `next start -p 3003`)  
**Tool:** Lighthouse CLI (headless Chrome)  
**Targets (spec):** Desktop performance 95+, mobile 85+, LCP &lt; 2.5s, CLS ≈ 0, INP &lt; 200ms

Raw JSON reports: `audit/lh-{page}-{desktop|mobile}.json`

---

## Summary scores

| Page | Form factor | Performance | A11y | Best practices | SEO | LCP | CLS | TBT |
|------|-------------|-------------|------|----------------|-----|-----|-----|-----|
| `/` | Desktop | **60** | 96 | 100 | 100 | 1.4 s | 0.008 | 1,310 ms |
| `/` | Mobile | **39** | 96 | 100 | 100 | 5.2 s | 0 | 8,730 ms |
| `/terms` | Desktop | **82** | 95 | 100 | 100 | 0.9 s | 0 | 380 ms |
| `/terms` | Mobile | **57** | 95 | 100 | 100 | 3.3 s | 0.009 | 3,520 ms |
| `/privacy` | Desktop | **82** | 95 | 100 | 100 | 1.0 s | 0.003 | 380 ms |
| `/privacy` | Mobile | **49** | 95 | 100 | 100 | 4.4 s | 0 | 4,630 ms |

**Verdict:** Core Web Vitals layout stability is good (CLS near zero). LCP is strong on desktop and acceptable on legal pages. **Performance targets are not met** — the home page pays a heavy JS tax from GSAP + Lenis + Three.js/R3F on throttled mobile CPU (TBT dominates the score).

---

## Optimizations applied (Phase 6)

| Change | Intent |
|--------|--------|
| Dynamic `SceneCanvas` import in `AppProviders` | Keep Three/R3F out of initial bundle |
| `useDeferredMount` (~1.4s idle) before WebGL | Prioritize LCP / first paint |
| `frameloop="demand"` + `CanvasInvalidator` | Avoid idle GPU when scene is static |
| Unmount WebGL when hero scroll progress ≥ 98% | Stop WebGL after hero exits viewport |
| Code-split below-fold sections (`ServicesPin`, `Portfolio`, `PackageStack`, `Vouches`) | Smaller home route JS (6.9 kB page chunk vs 10.9 kB pre-split) |
| `next/image` + blur placeholder for header logo | Optimized LCP candidate + zero layout shift |
| Dynamic `CustomCursor` + `PageTransitionCurtain` | Defer non-critical interaction layers |

---

## Home page — desktop deep dive

| Audit | Value | Notes |
|-------|-------|-------|
| Bootup time | ~2.0 s | GSAP, Lenis, R3F chunk parse/eval |
| Main-thread work | ~6.0 s | ScrollTrigger registration + hydration |
| Unused JavaScript | ~188 KiB est. | Shared vendor chunks (Three, GSAP) loaded for hero |
| LCP element | Hero typography | 1.4 s — within target |

---

## Gaps vs targets & recommended follow-ups

1. **Mobile TBT (8.7 s on `/`)** — Lighthouse simulates slow 4× CPU; animation stack is inherently heavy. Mitigations for Phase 7+:
   - Route-level `loading.tsx` skeleton; hydrate motion providers after `requestIdleCallback`
   - Mobile-specific “lite mode”: skip WebGL entirely below 768px (CSS-only hero)
   - Tree-shake GSAP to ScrollTrigger-only imports where Flip is unused on home
2. **Mobile LCP (5.2 s on `/`)** — Font + JS contention; consider subsetting Space Grotesk weights actually used (300/700 vs full set)
3. **Desktop perf 60** — Mostly TBT from boot; splitting `LenisProvider` + lazy ScrollTrigger registration per section would help legal pages reach 90+
4. **INP** — Lab INP on desktop was ~1.3 s (loader + hydration); real-user INP likely lower once `sessionStorage` skips loader

---

## How to re-run

```bash
cd brandforge
npm run build
npx next start -p 3003

# From repo root (one page example)
npx lighthouse http://localhost:3003 --preset=desktop \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=audit/lh-home-desktop.json
```

Clear `sessionStorage.bf-loader-seen` before auditing first-visit loader impact.

---

*Phase 6 complete. Performance budget documented; further gains require mobile lite path or post-hydration motion boot.*
