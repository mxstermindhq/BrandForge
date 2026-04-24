# Product, design & UX strategy

**Purpose:** Align UI, brand, and flows so BrandForge feels like a **single premium workspace**—fast to trust, fast to transact.

## North-star UX

- **Time to commitment:** minimize steps from discovery → clear offer → agreement → payment signal.
- **One thread per deal:** chat, files, terms, and status stay in one mental model (deal rooms).
- **Blue / Material-style tokens:** primary actions, surfaces, and dark/light parity via semantic Tailwind + `globals.css` variables—not one-off hex in product UI.

## Design system (non-negotiables)

| Rule | Why |
|------|-----|
| Semantic tokens (`bg-background`, `text-on-surface`, `border-outline-variant`, `primary`) | Consistent light/dark and future theme tweaks |
| `input-base` / `surface-card` for forms | Fewer bespoke borders; faster polish |
| Focus visible on interactive controls | Accessibility and keyboard users |
| Truncation + min-w-0 in flex rows | Sidebar, chat, marketplace cards don’t blow layouts |

## Information architecture

| Zone | Role |
|------|------|
| **Marketplace** | Canonical discovery for services + requests (legacy `/services` / `/requests` index redirect here). |
| **Chat / deal rooms** | Execution and negotiation; empty state drives requests, services, bids, squads. |
| **Leaderboard** | Competitive loop; show **username only** (no full name stack), normal weight, no `@` prefix in list. |
| **Profile** | Public by default at `/p/{username}` once a username exists; settings copy matches that. |
| **Welcome** | Onboarding uses shared tokens (no orphan dark-only zinc pages). |

## UX backlog (prioritized)

1. **Mobile pass** — sidebar, marketplace filters, chat composer (still called out in legacy docs as high priority).
2. **Marketplace listing quality** — richer cards, trust chips, filter persistence in URL.
3. **Notification surfaces** — in-app read state + eventually realtime (push/email already partially there).
4. **Empty states** — every core route should answer: *what do I do next?* with one primary CTA.
5. **Reduce duplicate nav mental models** — feed removed; ensure no orphan links to old routes.

## Brand & content

- **Customer-facing name:** BrandForge / World of BrandForge on `brandforge.gg`.
- **Voice:** direct, competitive, professional—avoid gimmick copy in transactional flows.
- **Legal/support:** keep `hello@brandforge.gg` and `/help` consistent in footers.

## Success metrics (design)

- Activation: % completing welcome + first marketplace action (bid, message, or listing).
- Retention: return sessions within 7 days of first deal-room message.
- Trust: profile view → message or bid conversion.

---

*Replaces scattered branding notes from legacy README / BRANDFORGE narrative.*
