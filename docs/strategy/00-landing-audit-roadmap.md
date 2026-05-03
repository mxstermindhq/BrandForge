# Landing Audit & Fast-Path Roadmap

**Purpose:** Audit the current `web/` landing experience, document gaps, and give a fast pixel-perfect path to a production-ready, sales-friendly homepage.

## 1. Current state audit

### 1.1 What is live today
- `web/src/app/(landing)/page.tsx` renders:
  - `LandingHero`
  - `PlansShowcase`
  - `FAQSection`
  - `LandingFooter`
- `LandingNav` provides a persistent sticky header with a CTA.
- The landing stack uses Next.js 15, Tailwind, and client-side auth hooks.

### 1.2 What exists but is not used
- `web/src/app/(landing)/_components/WorldOfBrandForge.tsx`
- `web/src/app/(landing)/_components/StreamingTerminal.tsx`
- `web/src/app/(landing)/_components/MarketplaceShowcase.tsx`
- `web/src/app/(landing)/_components/LiveStats.tsx`
- `web/src/app/(landing)/_components/HowItWorks.tsx`
- `web/src/app/(landing)/_components/FinalCTA.tsx`
- `web/src/app/(landing)/_components/FeaturesGrid.tsx`
- `web/src/app/(landing)/_components/AskAICards.tsx`
- `web/src/app/(landing)/_components/ActivityFeed.tsx`

> The landing route is currently a MVP scaffold. There is high potential to reuse ready-made sections to make the homepage feel complete, product-led, and trust-oriented.

### 1.3 Immediate UX and copy issues
- Hero is visually strong but copy is generic: `Hire Fast. Build Faster.`
- Pricing section shows plan names and feature lists, but there is inconsistent messaging: FAQ refers to `Agency ($29/mo)` while the plan label is `Max`.
- Footer links reference pages like `/about`, `/blog`, `/careers`, `/ai`, and `/teams` that may not exist or are not primary conversion paths.
- The landing page does not surface:
  - material buyer confidence (proof, client logos, cases)
  - clear outcomes for buyers vs creators
  - social proof or volume metrics
  - direct sales-ready alternatives like `Book a demo`, `Schedule a call`, or `Talk to sales` beyond plan cards.

### 1.4 Technical and production readiness observations
- `LandingNav` works via client-side `window.location` logic; it is fine in client components but could be simplified if anchor behavior is predictable.
- `LandingHero` redirects signed-in users to `/chat`, making the hero route effectively a login page for members. This is okay, but the page should also serve anonymous visitors as a strong marketing landing.
- There is no explicit `LiveStats` or trust/metrics section in the live landing page. Sales-ready landing pages benefit from a strong `numbers + credibility` strip.
- `PlansShowcase` has a `window.setTimeout` scroll highlight side effect; this is acceptable for plan selection but should be tested for accessibility.

## 2. Rewritten landing guidance

### 2.1 Landing page goal
The landing page should do three things in one scroll:
1. Explain what BrandForge is and who it is for.
2. Prove trust quickly with metrics, outcomes, and expertise.
3. Convert visitors into trial users, sales discussions, or buyer actions.

### 2.2 Recommended landing structure
1. **Hero + primary outcome**
   - Strong, benefit-led headline
   - One sentence that positions BrandForge as the fastest authenticated marketplace for professional SaaS work.
   - Primary CTA: `Try free`, secondary CTA: `Talk to sales`.
2. **Trust strip / hero stats**
   - Static or dynamic metrics: deals closed, specialists, escrow volume, live deal rooms.
3. **How it works**
   - 3-step buyer value path: Brief → Offer → Deliver.
   - Use existing `HowItWorks`, `MarketplaceShowcase`, or `AskAICards` components.
4. **Outcome showcase**
   - `WorldOfBrandForge`, `StreamingTerminal`, `LiveStats`, or `ActivityFeed` to show actual platform behavior and credibility.
5. **Plans and pricing**
   - Keep pricing clean and aligned with actual plan names.
   - Add low-commitment offer for Free users and enterprise sales path.
6. **FAQ / bottom CTA**
   - Address buyer questions and include a final sales CTA.

### 2.3 Key copy recommendations
- Replace generic line with something like:
  - `A polished workflow for buying professional SaaS services—brief, compare, contract, and launch faster than email and meetings.`
- Emphasize outcomes over features:
  - `Ship product work with specialists who deliver in contract-backed deal rooms.`
  - `Get clean proposals, fixed-price terms, and a single source of truth for delivery.`
- Use sales-friendly microcopy in plan cards:
  - `Free: Start with a pilot brief.`
  - `Pro: Close more deals with AI workflow support.`
  - `Enterprise: Procurement-ready, compliance-friendly, custom onboarding.`

## 3. Fast pixel-perfect roadmap

### 3.1 Week 1: Landing polish + conversion optimization
- Ship a complete homepage using the existing landing components.
- Replace or augment the hero with more specific value props.
- Add a trust metrics row with real or seeded numbers.
- Fix plan copy mismatch and ensure CTAs are consistent.
- Trim footer to only pages that exist or are core conversion targets.

### 3.2 Week 2: Sales readiness and production hardening
- Add a clear `Talk to sales` / `Book a demo` CTA in the hero and footer.
- Validate `/privacy`, `/terms`, `/help`, `/status` content and links.
- Confirm all landing links are live or remove them.
- Run a quick content audit of marketing copy for consistency across landing + product overview.

### 3.3 Week 3: Performance + reliability
- Ensure landing page loads fast and CSS/JS is minimal.
- Check `web/.env.local.example` and `web/.env.example` for required production env vars.
- Validate metadata and open graph assets for social sharing.
- Add monitoring on route response times and deploy health.

### 3.4 Week 4: Product-market fit polish
- Add proof points from the product experience: live marketplace stats, user stories, and trust chips.
- Align product overview page messaging with landing page.
- If possible, include a short video or animated workflow preview in the hero area.

## 4. Production readiness checklist for landing

- [ ] Landing hero communicates one clear buyer outcome.
- [ ] Pricing plans are accurate, consistent, and have direct CTAs.
- [ ] Footer only links to valid pages.
- [ ] All landing assets are optimized (SVG, compressed imagery).
- [ ] Social meta tags and JSON-LD are correct.
- [ ] `hello@brandforge.gg` appears consistently as support/sales contact.
- [ ] No broken client-side anchor nav behavior on `/`.
- [ ] `Try BrandForge` CTA loads the right auth flow and tracks conversions.

## 5. Recommended next doc actions
- Keep this file as the landing audit source of truth.
- Use `docs/strategy/05-execution-roadmap.md` to track actual shipping milestones.
- Sync the root README to show the new file as the first strategy doc.
