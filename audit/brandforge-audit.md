# BrandForge.gg — Full Codebase Audit

**Audit date:** 2026-05-27  
**Auditor scope:** Complete read of production static site (`site/`, 25 files) + deployment/config layer + legacy `web/` Next.js marketplace (sampled for migration risk). Binary assets (PNG/ICO) verified by path inventory only.  
**Production today:** Cloudflare Workers Assets serving `site/` via `npm run site:deploy`  
**Transformation target:** Next.js 15 App Router animated experience in `brandforge/` (new app, non-destructive to legacy `web/`)

---

## 1. File Inventory (Production Source of Truth)

### `site/` — 25 files (100% text sources read)

| Path | Role |
|------|------|
| `index.html` | Single-page landing (~554 lines), inline critical CSS + JSON-LD |
| `terms.html` | Legal — packages, revisions, refunds |
| `privacy.html` | Legal — Discord/Telegram + Cloudflare analytics |
| `css/main.css` | Non-critical styles (~minified 1 file, ~all section styles) |
| `js/app.js` | IntersectionObserver reveals, package CTA clipboard, sticky bar |
| `js/config.js` | Discord/Telegram URLs, package intake messages |
| `js/analytics.js` | Cloudflare Web Analytics beacon loader |
| `scripts/inject-analytics.mjs` | Deploy-time token injection into config.js |
| `scripts/generate-favicons.mjs` | Local favicon generation (not deployed) |
| `sitemap.xml` | `/`, `/terms.html`, `/privacy.html` |
| `robots.txt` | Allow all + sitemap + llms.txt comment |
| `llms.txt` | Agent/LLM context file |
| `site.webmanifest` | PWA manifest |
| `wrangler.jsonc` | Cloudflare Workers Assets config |
| `.assetsignore` | Excludes scripts/, package.json from deploy |
| `package.json` | Local deploy scripts only |
| `img/*` | logo-header, logo-mark-512, favicons, og-image (binary) |
| `favicon.ico` | binary |

### Repository context (not transformation source)

| Area | Files | Notes |
|------|-------|-------|
| `web/` | ~200+ TS/TSX | Legacy Next.js 15 marketplace — light theme, Supabase, OpenNext CF |
| Root `server.js`, `src/server/` | Node API | Marketplace backend — out of scope |
| `supabase/` | SQL migrations | Marketplace data — out of scope |

---

## 2. Architecture Assessment

### Rendering approach

**Current:** Pure static HTML/CSS/vanilla JS. Zero build step for content. Cloudflare Workers Assets = CDN static file host. No SSR, no hydration, no component tree.

**Critical render path:**
1. HTML document with ~2KB inline critical CSS (hero, nav, reset, tokens)
2. Google Fonts preconnect + stylesheet (render-blocking external)
3. `css/main.css` loaded via preload/onload pattern (non-blocking)
4. Three deferred scripts: `config.js` → `analytics.js` → `app.js`
5. No bundler, no code splitting, no tree shaking

**Strengths:** Trivial TTFB, minimal JS payload (~3KB effective), excellent for mid-range machines and forum operators on slow connections.

**Weaknesses:** No component reusability, duplicated tokens across inline CSS + main.css + legal pages, monolithic 554-line HTML, animation limited to CSS transitions + IO class toggles.

### Component structure and reusability

**Rating: 1/10**

- No components — semantic HTML sections with repeated patterns (eyebrow, sec-h, cards, grids)
- Copy, schema, and styles tightly coupled in one file
- Legal pages duplicate token definitions in inline `<style>` blocks
- Package CTA logic in global IIFE, not modular

### Asset loading strategy

| Asset | Strategy | Issue |
|-------|----------|-------|
| Fonts | Google Fonts CDN | External dependency, FOUT, privacy |
| CSS | Critical inline + async main.css | Good pattern for static |
| JS | defer, no modules | No type safety, global `BF_CONFIG` |
| Images | `<img>` native, fetchpriority on logo | No responsive srcset, no WebP/AVIF |
| JSON-LD | Inline script | Must migrate to Next metadata/JSON-LD component |

### Technical debt and anti-patterns

1. **Dual CSS sources** — `:root` tokens defined in `index.html` inline block AND assumed in `main.css` (main.css does not redefine `:root`; depends on inline load order — legal pages only partial tokens)
2. **Global mutable config** — `inject-analytics.mjs` mutates `config.js` on disk at deploy time
3. **Smooth scroll conflict risk** — `html { scroll-behavior: smooth }` + anchor click JS + future Lenis = triple scroll controllers if not removed
4. **Hover transforms on layout** — `.port-card:hover`, `.pkg:hover` use `translateY` (GPU-safe) but also trigger repaints via border-color
5. **Hero grid animation** — `will-change: background-position` on infinite CSS animation — continuous compositor work even off-screen
6. **No ES modules** — IIFE pattern blocks tree-shaking and typed imports
7. **Accessibility gaps** — FAQ accordion is static (good), but no `aria-expanded` patterns; sticky CTA lacks focus trap consideration
8. **Schema/HTML duplication** — FAQ content in JSON-LD and HTML body (maintenance burden)

### Dependency map

```
index.html
├── inline critical CSS (tokens, hero, nav, buttons)
├── css/main.css (sections, responsive, components)
├── js/config.js (BF_CONFIG — discord, telegram, packages)
├── js/analytics.js → reads BF_CONFIG.cfBeaconToken
└── js/app.js → reads BF_CONFIG, DOM queries [data-pkg], .rv, #sticky-cta

terms.html / privacy.html
├── css/main.css (partial — mostly unused)
├── inline legal CSS (duplicate tokens)
└── js/config.js + analytics.js

Deploy pipeline (root package.json)
└── site/scripts/inject-analytics.mjs → mutates config.js
    └── wrangler deploy --config site/wrangler.jsonc
```

---

## 3. Animation Readiness Score

### Score: **2 / 10**

| Capability | Current state |
|------------|---------------|
| Scroll-linked animation | None — IO fade-up only |
| Pin/scrub sections | None |
| Split/kinetic type | None — plain text nodes |
| WebGL / shaders | None — CSS radial gradients + grid |
| Smooth scroll library | None (native + CSS smooth) |
| GSAP / R3F | Not present in production site |
| Custom cursor | None |
| Page transitions | None (MPA-style legal pages) |

### What exists

- `.rv` + IntersectionObserver → opacity + translateY reveal (CSS transition)
- CSS `@keyframes fu` hero entrance (opacity + translateY)
- `.hero-grid` infinite background-position animation
- `.live-dot` pulse animation
- `:hover` transforms on cards/buttons
- `prefers-reduced-motion` class toggled on `<html>` — disables IO animation, hero grid, hover transforms

### Blocking GPU-accelerated animation

1. **No animation layer architecture** — everything is DOM/CSS; no canvas, no GSAP timeline, no scroll proxy
2. **Lenis + native smooth scroll** must be removed before Lenis integration
3. **554-line monolith** — cannot attach ScrollTrigger per-section without component boundaries
4. **No `transform3d` discipline** — some animations OK, but no centralized motion config
5. **External font load** delays first meaningful paint for kinetic type measuring

### Scroll performance risks

- Long single page (~15 sections) — many IO observers (one per `.rv` element, ~40+)
- Sticky nav + sticky bottom CTA + fixed positioning — OK if z-index managed
- Horizontal scroll sections (Phase 3) will need `overflow: hidden` on pin containers — not present
- Delivery `<table>` — wide layout on mobile with horizontal scroll only

### Layout thrash opportunities

- SplitText / character spans will force layout reads if implemented naïvely — must batch DOM writes
- Package price DOM is static — safe
- Trust bar flex wrap — safe
- Future magnetic buttons must use `transform` only, not margin/left/top

---

## 4. Design System Extraction

### CSS custom properties (from `index.html` inline `:root`)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#060608` | Page background |
| `--s1` | `#0b0b0f` | Surface 1 (sections, cards) |
| `--s2` | `#0f0f14` | Surface 2 (ICP, trust, xlink) |
| `--b1` | `#181820` | Border primary |
| `--b2` | `#222230` | Border secondary |
| `--a` | `#7c3aed` | Primary accent (buttons) |
| `--a2` | `#9d5fff` | Accent bright (links, eyebrows) |
| `--a-dim` | `rgba(124,58,237,.07)` | Hover wash |
| `--a-glow` | `rgba(124,58,237,.3)` | Button shadow |
| `--a-mid` | `rgba(124,58,237,.45)` | Border hover |
| `--green` | `#22c55e` | Trust, live dot, pkg-avg |
| `--amber` | `#f59e0b` | Star ratings |
| `--text` | `#e2e0ea` | Primary text |
| `--t2` | `#a09cb8` | Secondary text |
| `--muted` | `#5c5870` | Muted text |
| `--m2` | `#2a2838` | Dim labels |
| `--dc` | `#5865f2` | Discord pill |
| `--tg` | `#229ed9` | Telegram accent |
| `--font` | `'Space Grotesk', sans-serif` | Display + body |
| `--mono` | `'Space Mono', monospace` | Labels, stats, nav |
| `--max` | `1200px` | Content max-width |
| `--r` | `4px` | Border radius |

### Typography scale (implicit, not tokenized)

| Element | Size | Weight | Font |
|---------|------|--------|------|
| Hero h1 | clamp(40px, 6.5vw, 84px) | 700 / 300 (.lt) | Grotesk |
| sec-h | clamp(28px, 4vw, 48px) | 700 | Grotesk |
| eyebrow | 9–10px | 400 | Mono, uppercase, letter-spacing .24–.26em |
| body/sec-p | 14–15px | 400 | Grotesk |
| stat-n | 28px | 400 | Mono |
| pkg-price | 36px | 400 | Mono |

### Spacing (implicit)

- Section padding: `100px 0` (`.sec`)
- Wrap padding: `32px` (18px mobile)
- Grid gaps: `14–16px`
- Hero padding: `120px 0 80px`

### Inconsistencies flagged

1. **Legal pages** use subset of tokens (`--bg`, `--s1`, `--b1`, `--a`, `--a2` only) — missing `--t2`, surfaces
2. **Legacy `web/src/styles/tokens.css`** is entirely different brand (light mode, blue accent, Cormorant/DM Sans) — must NOT merge
3. **Font weights** — index loads Grotesk 300–700; legal pages load 400/600/700 only
4. **Border radius** — `--r: 4px` but some cards use `5px` or `6px` hardcoded
5. **Emphasis color** — `em` in headings always `--a2`, never `--a`

### Strongest visual foundation (animation-ready)

1. **Hero** — mesh + grid layers, clear z-index stack, full viewport — ideal for WebGL particle underlay
2. **Package cards** — `.pkg.pop` gradient border treatment — good for scale/blur scroll choreography
3. **Service columns** — 3-col grid with top accent line hover — candidate for horizontal pin sequence
4. **Typography pairing** — Grotesk + Mono is distinctive and reference-aligned

### Needs most rework before animation

1. **FAQ grid** — static cards; need accordion or stagger without height animation (use opacity/transform)
2. **Delivery table** — semantic table hard to animate; consider row-by-row reveal or card fallback on mobile
3. **Vouches** — blockquote grid; needs 3D tilt layer (transform-only)
4. **Nav** — currently always opaque; Phase 5 requires scroll-driven background transition

---

## 5. Migration Risk Map (Static → Next.js 15 App Router)

| Section | Preserve verbatim | Rebuild | Complexity |
|---------|-------------------|---------|------------|
| Copy/content | ✅ All text, packages, FAQ, vouches | Structured as TS content modules | **Low** |
| Design tokens | ✅ Values | Tailwind v4 + CSS vars in `tokens.css` | **Low** |
| JSON-LD | ⚠️ Logic | `generateMetadata` + JSON-LD component | **Low** |
| Images/assets | ✅ Files | `next/image` + public/ | **Low** |
| Package CTAs | ⚠️ Behavior | React hooks + clipboard API | **Medium** |
| Legal pages | ✅ Content | `/terms`, `/privacy` routes | **Low** |
| Analytics | ⚠️ Pattern | Env-based CF beacon in layout | **Low** |
| Scroll reveals | ❌ | GSAP ScrollTrigger | **Medium** |
| Hero | ❌ | R3F particles + kinetic type | **High** |
| Services | ❌ | Pinned horizontal scrollytelling | **High** |
| Packages | ❌ | Scroll-scrub card stack | **High** |
| Deploy | ❌ | OpenNext Cloudflare or static export decision | **Medium** |

### What breaks moving to Next.js 15

- All `#anchor` URLs — become same-page sections (OK) but need Lenis scrollTo
- `.html` legal URLs — redirect `/terms.html` → `/terms`
- `BF_CONFIG` global — becomes env + typed config module
- `inject-analytics.mjs` — replaced by `NEXT_PUBLIC_CF_BEACON_TOKEN`
- Cloudflare Workers Assets deploy — must add OpenNext or `@cloudflare/next-on-pages` pipeline for Next

### Legacy `web/` reuse

**Do not fork marketplace app.** Conflicting design system, Supabase auth, 200+ routes. New app in `brandforge/` is the correct isolation.

### GSAP SplitText note

SplitText is a GSAP Club plugin (not on public npm). **Implementation decision:** use `@gsap/react` with a typed in-house `splitText` utility (span-per-char/word) achieving identical animation surface. Documented in code comments. If Club files are added later, swap registerPlugin only.

---

## 6. Honest Quality Assessment

### Where the codebase is strong

- **Content completeness** — ICP, delivery table, support tiers, intake checklist, legal alignment
- **Performance baseline** — tiny JS, fast static delivery, good for target audience hardware
- **SEO** — JSON-LD, canonical, OG, sitemap, llms.txt
- **Accessibility basics** — skip link, aria labels, reduced motion support
- **Sales funnel** — package-aware Discord/Telegram intake messages

### Where it falls short of Awwwards tier

- No motion design system, no scroll narrative, no WebGL identity
- Visual language is competent dark SaaS, not kinetic/editorial
- Single CSS file minification hurts maintainability
- No typed data layer for packages/portfolio/vouches
- No page transitions, loading ritual, or cursor craft

### Recommended phase order

1. **Phase 1 — Global shell** (Lenis + GSAP + R3F canvas + tokens) ← START HERE
2. **Phase 2 — Kinetic typography** (hero + section headings)
3. **Phase 3 — Scrollytelling** (services pin, packages stack, portfolio reveals)
4. **Phase 4 — WebGL hero** (particles + shader displacement)
5. **Phase 5 — Micro-interactions** (cursor, magnetic CTAs, nav, transitions, loader)
6. **Phase 6 — Performance audit** (Lighthouse, lazy R3F, next/image)

---

## 7. Target Stack Alignment

| Requirement | Plan |
|-------------|------|
| Next.js 15 App Router | `brandforge/` new app |
| TypeScript strict | `strict: true`, `noImplicitReturns`, no `any` |
| Tailwind CSS v4 | `@import "tailwindcss"` + `@theme` mapping tokens |
| Lenis v2 | `lenis` package, synced to `gsap.ticker` |
| GSAP v3 + ScrollTrigger | `@gsap/react` + registerPlugins |
| R3F + drei | Fixed canvas in layout, `pointer-events: none` |
| Shaders | Phase 4 — `shaderMaterial` in hero |
| Page transitions | Phase 5 — GSAP curtain (view-transitions optional) |

### Single install command (Phase 1)

```bash
cd brandforge && npm install next@15 react@18 react-dom@18 gsap @gsap/react lenis three @react-three/fiber @react-three/drei && npm install -D typescript @types/node @types/react @types/react-dom @types/three tailwindcss @tailwindcss/postcss postcss eslint eslint-config-next
```

---

## 8. Content Module Extraction (for migration)

All copy lives in `site/index.html` sections: hero, live-strip, who, services, portfolio (6 cards), packages (3 tiers), process, delivery table, support, trust, vouches (6), FAQ (10), xlink, CTA, footer.

Contact constants:
- Discord: `https://discord.gg/a8Nz2R6M55`
- Telegram: `https://t.me/Notmxstermind`
- Premium: `https://mxstermind.com`

---

*Audit complete. Phase 1 may proceed in `brandforge/`.*
