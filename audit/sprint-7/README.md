# Sprint 7 — Ecosystem Bridge & Store Launch

## New pages

| Path | Purpose |
|------|---------|
| `/mxstermind/` | Cross-platform bridge hub |
| `/store/` | Store catalog (4 products) |
| `/store/[slug]/` | Product detail + checkout |
| `/partners/` | v2 — tiers, affiliates, 6 partners |
| `/membership/` | Insider + Pro tiers |
| `/events/` | Workshop calendar |
| `/community/` | Showcase + template submissions |
| `/client/` | Portal scaffold (noindex) |

## Store payments

Set at build time:

- `NEXT_PUBLIC_STRIPE_DISCORD_KIT`
- `NEXT_PUBLIC_STRIPE_FORUM_KIT`
- `NEXT_PUBLIC_STRIPE_WEB3_LANDER`
- `NEXT_PUBLIC_STRIPE_STYLE_GUIDE`

Without env vars, checkout falls back to Discord DM with `purchase_initiated` tracking.

## Acceptance checklist

- [x] `/mxstermind/` live
- [x] Cross-nav header/footer + `cross_platform_nav` GA event
- [x] Joint lead magnet PDF
- [x] 4 store products + detail pages
- [x] 6 partners + affiliate program copy
- [x] Partner spotlight blog post
- [x] Membership + events + community pages
- [x] Client portal scaffold
- [x] Dashboard store/partner metrics
- [x] API.md webhook scaffold
- [ ] Live Stripe links (env)
- [ ] First sale
- [ ] Home mobile perf ≥ 85

See `brandforge/docs/API.md` for events and webhooks.
