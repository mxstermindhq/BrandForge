# Content & SEO Architecture Audit

**Date:** 2026-05-19  
**Scope:** Full repository read — `brandforge/` (production), `site/` (legacy static), `web/` (marketplace, out of scope for content build), mxstermind.com (not yet in repo)

---

## 1. Repository file inventory (content-relevant)

### brandforge/ — production app (56 static routes)

| Area | Files | Role |
|------|-------|------|
| `src/app/` | Home, hubs, dynamic `[slug]` routes, terms, privacy, robots, sitemap | **56 public routes** |
| `src/components/sections/` | HomeSections, ServicesPin, PackageStack, Portfolio, Vouches, HeroStats | Home-only scrollytelling |
| `src/components/typography/` | KineticHero, SectionHeading, EyebrowLabel, HeroSubheading | Phase 2 motion type |
| `src/components/shell/` | SiteHeader, SiteFooter | Minimal nav (Packages, Work) |
| `src/components/motion/` | CustomCursor, LoadingScreen, PageTransitionCurtain, MagneticButton, TiltCard | Phase 4–5 polish |
| `src/components/canvas/` | SceneCanvas, HeroScene, particles, displacement | WebGL hero only |
| `src/components/providers/` | AppProviders, Lenis, Gsap | Global client shell |
| `src/content/home.ts` | SERVICES, PACKAGES_LIST, PORTFOLIO (4), VOUCHES (6) | Typed home content |
| `src/config/site.ts` | URLs, Discord/Telegram, package intake messages | Site constants |
| `src/lib/` | gsap, motion, webgl | Animation infrastructure |
| `public/` | favicons, logos, og-image, llms.txt, _redirects | Static assets |

**Deploy:** Static export → Cloudflare Workers Assets (`wrangler.jsonc` → `out/`). Root `npm run cf:deploy` → brandforge.

### site/ — legacy static (reference only)

25 files. Contains sections **not yet in brandforge home:** ICP (`#who`), process (`#process`), delivery table (`#delivery`), support (`#support`), FAQ (`#faq`), contact CTA block, sticky CTA, live strip, trust bar, mxstermind xlink, full package copy nuances.

### web/ — marketplace (~200+ routes)

Next.js 15 + Supabase + OpenNext. **Not the content target.** Contains `(shop)/mxstermind/page.tsx` bridge only — not mxstermind.com editorial site.

### mxstermind.com — **live** (`mxstermind/`)

37 static routes. Premium bespoke studio — amber/gold tokens, Cormorant + DM Mono. Deploy via `npm run mxstermind:deploy`.

---

## 2. Current page count vs 55-page target

### brandforge.gg — today: **4** → target: **35**

| Route | Status |
|-------|--------|
| `/` | Exists — animated home; missing ICP, process, delivery, support, FAQ, trust bar, full internal hubs |
| `/terms/`, `/privacy/` | Exists — legal only |
| `/services` | **Missing** |
| `/packages` | **Missing** (home has `#packages` anchor only) |
| `/portfolio` | **Missing** (home has 4-card section only) |
| `/about`, `/contact` | **Missing** |
| 9× `/services/*` | **Missing** |
| 8× `/portfolio/*` case studies | **Missing** (4 projects on home; missing ValAccs, SUI, LinkedIn, WhiteSky) |
| 7× `/roadmap/*` | **Missing** |
| 6× `/for/*` niche | **Missing** |
| `/ethics-standards`, `/brand-guide`, `/blog` | **Missing** |
| 10× `/blog/*` posts | **Missing** |

**Gap: 31 net-new routes** (+ home upgrade)

### mxstermind.com — today: **0** → target: **25**

Entire app to build: core (6), developers (7), portfolio (6), trust/editorial (3), blog index + 10 posts.

**Gap: 25 routes**

---

## 3. SEO & AI-SEO gaps (current brandforge)

| Requirement | Home | Terms/Privacy | Inner pages |
|-------------|------|---------------|-------------|
| Unique `<title>` <60 chars | Partial (template) | Yes | N/A |
| Meta description 150–160 | Yes (layout default) | Yes | N/A |
| Canonical absolute | metadataBase only | No explicit per-page | N/A |
| Full OG set | Layout-level | Inherited | N/A |
| Organization JSON-LD | **Missing** | **Missing** | N/A |
| BreadcrumbList | **Missing** | **Missing** | N/A |
| Service / CreativeWork / Article / FAQPage | **Missing** | **Missing** | N/A |
| WebSite + SearchAction (home) | **Missing** | — | N/A |
| Visible FAQ blocks | **Missing** on home | **Missing** | N/A |
| AI-extraction Q&A phrasing | **Missing** | **Missing** | N/A |
| Entity signals (BrandForge / mxstermind) | Footer xlink only | No | N/A |
| Sitemap | 3 URLs only | — | Need 35+ |
| robots.txt | Allow all | — | Add AI bot explicit allow |
| Internal linking architecture | Minimal | Footer legal only | **Missing** |

---

## 4. Design system consistency

### brandforge.gg — **consistent** in app

- Tokens: `#060608`, `#7c3aed` / `#9d5fff`, Space Grotesk + Space Mono (`tokens.css`, Tailwind `@theme`)
- Motion-heavy home; legal pages use shell without section components
- **Risk:** New pages must use `content-wrap`, mono eyebrows, accent `<em>` pattern — not reintroduce `site/css/main.css`

### mxstermind.com — **not started**

- Spec: `#080807`, `#c9a96e`, Cormorant Garamond 300/400, DM Mono
- Must not reuse brandforge purple tokens

---

## 5. Reusable components (existing → target)

| Existing | Reuse for new pages |
|----------|---------------------|
| `EyebrowLabel`, `SectionHeading` | Page section headers |
| `MagneticButton` | CTAs (optional on content pages) |
| `TiltCard` | Vouch cards variant |
| `SiteHeader` / `SiteFooter` | Extend nav links for hubs |
| `PORTFOLIO`, `VOUCHES`, `SERVICES` data | Seed portfolio/service pages |
| — | **Need:** PageHero, ServiceCard, PortfolioCard, FAQBlock, VouchCard, CTASection, TrustBar, BlogCard, BreadcrumbNav, SchemaInjector, CopyButton, RoadmapStep, DevCard, EthicsSection, PageShell |

---

## 6. Internal linking gaps

- No hub pages → no crawl depth beyond home
- Portfolio cards link externally only — no `/portfolio/cascade-markets` etc.
- Services on home have no `/services/brand-identity` deep links
- No blog → service links
- No roadmap → package links
- mxstermind cross-link: `SITE.premium` in config only — footer needs both domains

---

## 7. Build complexity estimate

| Phase | Scope | Complexity | Notes |
|-------|-------|------------|-------|
| 0 | Audit | Done | This document |
| 1 | Shared components + SEO lib | Medium | brandforge first; mirror types for mxstermind |
| 2 | Core hubs (both domains) | High | mxstermind scaffold + 5 BF hubs |
| 3 | 9 service deep dives | High | 800+ words each, Service schema |
| 4 | 14 case studies | High | CreativeWork schema, screenshots placeholders |
| 5 | 7 roadmap pages | Medium | Checklists + copy buttons |
| 6 | 7 developer pages | High | mxstermind only, technical depth |
| 7 | 6 niche landings | Medium | Audience-specific copy |
| 8 | Ethics ×2 | Medium | Shared structure, tone variants |
| 9 | Brand guide | High | CopyButton + token docs |
| 10 | 20 blog posts | **Very high** | 1,200+ words × 20 |
| 11 | Sitemap/robots | Low | generateStaticParams registries |
| 12 | Final SEO report | Low | Validation pass |

**Total estimated:** ~55 routes, ~35k+ words of copy, 2 Next.js static apps.

---

## 8. Implementation decisions (better than spec where noted)

1. **Dynamic segments** — Use `app/services/[slug]/page.tsx`, `app/portfolio/[slug]/page.tsx`, `app/blog/[slug]/page.tsx`, `app/roadmap/[slug]/page.tsx`, `app/for/[slug]/page.tsx` with `generateStaticParams` from typed registries — same URLs, less duplication.
2. **Content-as-data** — All copy in `src/content/**/*.ts` imported by thin page files — enables sitemap generation and word-count QA.
3. **Layout groups** — `app/(site)/` for content pages (lighter hero, no WebGL requirement); keep animated providers on home via route group or conditional canvas.
4. **mxstermind/** — New sibling app mirroring brandforge architecture; shared patterns documented, not shared package (avoid cross-domain token bleed).
5. **Home upgrade** — Fold missing static sections (ICP, process, delivery, support, FAQ, trust) into home or link prominently to new hubs in Phase 2.

---

## 9. Blog post registry (20 slugs)

### brandforge.gg
- `how-to-build-a-brand-from-scratch-2026`
- `what-is-geo-generative-engine-optimisation`
- `discord-server-branding-complete-guide`
- `how-to-build-a-web-store-gaming-community`
- `forum-marketing-2026-what-still-works`
- `how-we-built-carspotlive-mobile-app-case-study`
- `brand-identity-vs-brand-design-difference`
- `what-is-cro-conversion-rate-optimisation`
- `how-to-choose-a-design-agency-2026`
- `ai-tools-every-operator-should-use`

### mxstermind.com
- `how-we-rebuilt-sol-app-for-sui-blockchain-two-weeks`
- `bespoke-agency-vs-package-agency-which-is-right`
- `what-is-a-growth-engine-and-how-to-build-one`
- `how-to-brief-a-design-agency-without-wasting-time`
- `web3-branding-what-crypto-projects-get-wrong`
- `how-we-built-cascade-markets-case-study`
- `real-cost-of-a-bad-brand-and-how-to-fix-it`
- `what-outcome-based-agency-work-means-in-practice`
- `how-much-should-a-website-cost-honest-answer`
- `ethics-standards-how-we-work`

---

## 10. Phase gate checklist

- [x] Phase 0 — Audit saved
- [x] Phase 1 — Shared components
- [x] Phase 2 — Core pages (both domains)
- [x] Phases 3–10 — Services, portfolio, roadmap, niche, blog, ethics, brand guide
- [x] Phase 11 — mxstermind app + sitemap/robots
- [x] Phase 12 — SEO final report + production deploy

---

*All phases complete. Both apps live.*
