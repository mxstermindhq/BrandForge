# BrandForge — Animated Site (Next.js 15)

Awwwards-tier rebuild of brandforge.gg. See `/audit/brandforge-audit.md` for full audit.

## Phase 1 — Global shell ✅

- Next.js 15 App Router + TypeScript strict
- Tailwind CSS v4 + design tokens from static site
- Lenis smooth scroll synced to GSAP ticker
- GSAP + ScrollTrigger + Flip registered
- Fixed R3F canvas overlay (`pointer-events: none`)
- `prefers-reduced-motion` at provider level

## Phase 2 — Kinetic typography ✅

- In-house char/word/line split (`src/lib/motion/split-text.ts`) — SplitText-compatible surface without Club plugin
- Custom cubic-bezier easings (`EASE_KINETIC`, `EASE_HERO_CHAR`)
- Hero: char stagger + word clip reveal subheading + eyebrow char stagger
- Section headings: line wipe from below via ScrollTrigger (scrub optional)
- All animations use `transform` + `opacity` only — no layout properties

## Install (all phases)

```bash
cd brandforge
npm install
```

## Dev

```bash
npm run dev
# http://localhost:3002
```

## Stack

| Layer | Package |
|-------|---------|
| Framework | Next.js 15, React 19 |
| Styling | Tailwind v4 + CSS tokens |
| Scroll | Lenis → GSAP ticker |
| Animation | GSAP 3 + ScrollTrigger |
| 3D | R3F + drei |

Production static site remains in `/site` until cutover.
