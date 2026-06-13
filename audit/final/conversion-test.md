# Conversion Funnel — Post-Sprint 7 Audit

**Audit date:** 2026-06-13

---

## CTA Tracking

| Check | Status | Evidence |
|-------|--------|----------|
| Discord UTM params | PASS | `lib/tracking.ts` → `utm_source=brandforge&utm_medium=cta` |
| Telegram UTM params | PASS | `telegramHref()` |
| Store Buy UTM / events | PASS | `StoreBuyButton` → `purchase_initiated` |
| MXSTERMIND cross-links UTM | PASS | `CrossPlatformLink` + `cross_platform_nav` |
| GA events in code | PASS | `GoogleAnalytics.tsx` data-bf-cta delegation |
| GA4 Real-Time verified | **NOT TESTED** | Manual browser test required |

---

## Package Intake (`/packages/`)

| Check | Status |
|-------|--------|
| 5 tiers + custom | PASS |
| Comparison table | PASS |
| "Most popular" badge | PASS (mid-tier) |
| Discord pre-fill per tier | PASS |
| Copy message fallback | PASS |
| Calendly embed (custom tier) | PASS (when configured) |
| Mobile/desktop button test | NOT RUN in this audit |

---

## Store Flow

| Check | Status | Notes |
|-------|--------|-------|
| 3+ products live | PASS | 4 products in `store.ts` |
| Product schema | PASS | Validated in out/ |
| Payment flow | **PARTIAL** | Stripe env vars not set; Discord fallback checkout |
| Digital delivery | **PARTIAL** | Placeholder PDFs in `public/downloads/` |
| purchase_initiated event | PASS (code) | Live fire not verified |
| purchase_completed event | **MISSING** | Not implemented |
| First sale | **PENDING** | No recorded sale |

---

## Trust Signals

| Check | Status |
|-------|--------|
| Animated trust counters (home) | PASS |
| prefers-reduced-motion on counters | PASS |
| 8+ vouches with project links | PASS |
| Client/niche logo bar | PASS |
| Portfolio copyable stat boxes | PASS |
| FAQ 👍/👎 feedback | Partial / not verified in GA |
| FAQ feedback GA events | NOT FOUND in codebase |

---

## A/B Tests

| Check | Status |
|-------|--------|
| `useABTest` hook | PASS (`lib/ab-test.ts`) |
| Active test | `home-hero-primary-cta-2026-06` (running) |
| Completed test with winner | **NONE** (`audit/ab-tests.md`) |

---

## Grade: **B-**

Tracking infrastructure is solid in code. Gaps: live GA verification, Stripe checkout, first sale, FAQ feedback events.
