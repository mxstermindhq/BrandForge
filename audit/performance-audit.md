# Performance Audit — Production (May 2026)

**Date:** 2026-05-19  
**Method:** Lighthouse CLI against live URLs (mobile + desktop)  
**Targets (spec):** Desktop perf 95+, mobile 85+, LCP &lt; 2.5s, CLS ≈ 0, TBT minimal

Raw JSON: `audit/lh-bf-home-*-2026.json`, `audit/lh-bf-packages-mobile-2026.json`, `audit/lh-mm-home-mobile-2026.json`

---

## Executive summary

| Site | Page | Mobile perf | Desktop perf | Verdict |
|------|------|-------------|--------------|---------|
| **brandforge.gg** | `/` | **12** ❌ | **65** ❌ | Mobile **regressed** — CLS 0.86 from lazy package section |
| **brandforge.gg** | `/packages/` | **54** ❌ | — | Content pages OK on CLS; still JS-heavy |
| **mxstermind.com** | `/` | **47** ❌ | — | No motion stack; better CLS, still high TBT |

**SEO remains strong** (100 on BrandForge home). **Accessibility** dipped on mobile home (89) — likely contrast/motion-related audits.

Desktop BrandForge home **improved slightly** (61 → 65) after deferred ScrollTrigger and particle reduction. Mobile home **collapsed** because a **0.86 CLS shift** when `#packages` hydrates from lazy-loaded motion chunks — not from fonts or hero.

---

## brandforge.gg — `/` (home)

| Metric | Mobile | Desktop | Target |
|--------|--------|---------|--------|
| **Performance** | 12 | 65 | 85+ / 95+ |
| LCP | 5.4 s | 1.1 s | &lt; 2.5 s |
| TBT | 6,190 ms | 1,126 ms | &lt; 200 ms |
| CLS | **0.863** | 0.006 | ≈ 0 |
| FCP | ~5.8 s | 0.7 s | — |
| Speed Index | 17.3 s | 3.3 s | — |
| Accessibility | 89 | — | 95+ |
| Best practices | 81 | — | 100 |
| SEO | 100 | — | 100 |

### Root causes (mobile home)

1. **CLS 0.86 — `#packages` Launch Stack card**  
   Lazy `HomeMotionSections` chunk loads; package cards mount into empty space → single layout shift scoring 0.86.  
   Selector: `main#main > section#packages > div.content-wrap > article[data-pkg-card]`

2. **TBT 6.2 s** — Despite mobile lite (no WebGL/Lenis/cursor), main thread still parses:
   - Shared Next.js vendor chunks (~1.8 s + 1.3 s long tasks)
   - GSAP-related chunks when motion sections hydrate
   - Hero typography animations (KineticHero) still run above fold
   - Google Analytics gtag (added post prior audit)

3. **LCP 5.4 s** — Hero headline; delayed by JS parse + font load (minor 0.002 CLS from Space Grotesk woff2)

### Root causes (desktop home)

1. **TBT 1.1 s** — GSAP ScrollTrigger pin sections + Three.js hero (1800 particles) + Lenis
2. **LCP 1.1 s** — Within target; typography hero is LCP element
3. **CLS 0.006** — Good; no lazy-section pop-in on desktop pin layout

---

## brandforge.gg — `/packages/` (mobile)

| Metric | Value |
|--------|-------|
| Performance | 54 |
| LCP | 3.7 s |
| TBT | 1,501 ms |
| CLS | 0.024 |

Content hub without home motion — **~4× better perf score** than home mobile. Confirms home animation/lazy-load stack is the bottleneck, not CDN or global CSS.

---

## mxstermind.com — `/` (mobile)

| Metric | Value |
|--------|-------|
| Performance | 47 |
| LCP | 3.9 s |
| TBT | 3,879 ms |
| CLS | 0.002 |
| Accessibility | (see JSON) |
| SEO | (see JSON) |

Static editorial site — no GSAP/WebGL. TBT still high from Next.js hydration + font subset (Cormorant + DM Mono). **CLS excellent.**

---

## Optimizations already shipped

| Change | Impact |
|--------|--------|
| Mobile lite (≤768px) — skip WebGL, Lenis, loader, cursor | Reduces GPU + scroll jank |
| `useSkipMotion()` — skip GSAP on mobile | Less ScrollTrigger work |
| `useMotionInView()` — defer ScrollTrigger until near viewport | Desktop TBT ↓ slightly |
| Lazy `HomeMotionSections` / below-fold chunks | Smaller initial JS |
| Particle count 3200 → 1800 desktop | GPU ↓ |
| Font subset (Space Grotesk 4 weights) | Transfer ↓ |
| GA4 via `afterInteractive` | Minor TBT add |

---

## Priority fixes (recommended)

| Priority | Fix | Expected gain |
|----------|-----|----------------|
| **P0** | **Reserve min-height for lazy motion sections** (`#services`, `#portfolio`, `#packages`) or SSR skeleton before `HomeMotionSections` hydrates | Mobile CLS 0.86 → ~0; perf score +30–40 |
| **P1** | **SSR package/service cards on mobile** — render static HTML in server component, enhance with GSAP only on desktop | Mobile TBT ↓, LCP ↓ |
| **P1** | Skip KineticHero char-split on mobile (`useSkipMotion` in typography) | Mobile TBT ↓ ~200–400 ms |
| **P2** | Route-level code split: don't load Three/R3F chunk on non-home routes (verify) | Legal/hub pages faster |
| **P2** | Self-host fonts with `size-adjust` fallbacks | CLS font flash ↓ |
| **P3** | Partytown or defer GA to `lazyOnload` | Small TBT win |

---

## Comparison vs prior audit (local build, May 2026)

| Page | Factor | Before | Now (prod) | Δ |
|------|--------|--------|------------|---|
| `/` | Mobile perf | 39 | **12** | ↓ lazy-load CLS regression |
| `/` | Mobile CLS | 0 | **0.863** | ↓ regression |
| `/` | Mobile TBT | 8,730 ms | 6,190 ms | ↑ improved |
| `/` | Desktop perf | 60 | **65** | ↑ improved |
| `/` | Desktop TBT | 1,310 ms | 1,126 ms | ↑ improved |

---

## How to re-run

```bash
npx lighthouse https://brandforge.gg --preset=perf \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=audit/lh-bf-home-mobile-2026.json \
  --form-factor=mobile --screenEmulation.mobile=true

npx lighthouse https://brandforge.gg --preset=desktop \
  --only-categories=performance \
  --output=json --output-path=audit/lh-bf-home-desktop-2026.json
```

---

*Production audit complete. P0 CLS fix on lazy `#packages` is the highest-leverage next step for mobile.*
