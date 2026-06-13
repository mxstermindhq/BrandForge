# A/B test log — BrandForge

## Active tests

| Test ID | Location | Variants | Start | Status |
|---------|----------|----------|-------|--------|
| `home-hero-primary-cta-2026-06` | Home hero primary CTA | A: "Start Your Rebrand" → /#packages · B: "Get Discord-Ready Branding" → Discord | 2026-06-13 | Running (1 week) |

### Winner criteria

- ≥95% statistical confidence **or**
- ≥100 impressions per variant (whichever comes first)

### GA4 events

- `ab_test_impression` — params: `test_id`, `variant`
- `ab_test_conversion` — params: `test_id`, `variant` (fires on primary CTA click)

### How to declare winner

1. GA4 → Explore → compare `ab_test_conversion` by `variant` for test_id `home-hero-primary-cta-2026-06`
2. Measure click-through to `/packages/` (variant A) vs Discord (variant B)
3. Update this file with winner + date

## Completed tests

_None yet._
