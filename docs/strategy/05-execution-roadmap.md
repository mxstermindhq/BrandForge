# Execution roadmap (fast path to leadership)

**Purpose:** A **single ordered plan**—what to ship next, why, and dependencies. Adjust dates in planning meetings; keep this file the source of truth for priorities.

> See `docs/strategy/00-landing-audit-roadmap.md` for a landing audit and conversion path, and `docs/strategy/06-app-audit.md` for the authenticated product / AI experience audit and fast logged-in roadmap.

## Horizon legend

- **Now:** next 2 weeks  
- **Next:** weeks 3–6  
- **Then:** weeks 7–12

---

## Pillar A — Trust & activation


| ID  | Task                                                   | Horizon | Owner hint | Depends on         |
| --- | ------------------------------------------------------ | ------- | ---------- | ------------------ |
| A1  | Harden welcome → home path; measure drop-off           | Now     | Web + API  | Auth/bootstrap     |
| A2  | Profile `/p/{username}` + settings copy always aligned | Now     | Web        | API profile fields |
| A3  | Marketplace empty states → single clear CTA per role   | Next    | Web        | —                  |
| A4  | Email/support paths audited (`hello@brandforge.gg`)    | Now     | Content    | —                  |


## Pillar B — Liquidity (marketplace)


| ID  | Task                                               | Horizon | Owner hint | Depends on           |
| --- | -------------------------------------------------- | ------- | ---------- | -------------------- |
| B1  | Search/filter UX + URL state for marketplace       | Now     | Web        | —                    |
| B2  | Listing quality: trust row, delivery/price clarity | Next    | Web + API  | Bootstrap data shape |
| B3  | Bid/offer flows instrumented (funnel events)       | Next    | Web + API  | —                    |
| B4  | Pagination / API limits on heavy lists             | Next    | API        | DB indexes           |


## Pillar C — Deal execution (chat & deals)


| ID  | Task                                             | Horizon | Owner hint         | Depends on        |
| --- | ------------------------------------------------ | ------- | ------------------ | ----------------- |
| C1  | Chat reliability + optimistic UI review          | Now     | Web                | API messages      |
| C2  | Attachments strategy (size, types, storage)      | Next    | API + Web          | Supabase storage  |
| C3  | Realtime MVP (chat or notifications)             | Then    | Full stack         | Supabase Realtime |
| C4  | Contract/checkout: one vertical slice end-to-end | Then    | API + integrations | Stripe/rules      |


## Pillar D — AI & agents (differentiation)


| ID  | Task                                                         | Horizon | Owner hint  | Depends on  |
| --- | ------------------------------------------------------------ | ------- | ----------- | ----------- |
| D1  | One provider adapter + env-driven model pick                 | Now     | API         | Secrets     |
| D2  | Brief generator: structured output stored on profile/project | Next    | Web + API   | —           |
| D3  | Agent run: observable job status + user-visible errors       | Next    | API + infra | Runner host |
| D4  | Reduce stubs (`completeMxAgentChat`-class) behind flags      | Then    | API         | D1          |


## Pillar E — Competition layer


| ID  | Task                                             | Horizon | Owner hint | Depends on           |
| --- | ------------------------------------------------ | ------- | ---------- | -------------------- |
| E1  | Leaderboard data accuracy vs API payloads        | Now     | Web + API  | `/api/leaderboard/`* |
| E2  | Season prizes/Rules UX synchronized with backend | Next    | Web + API  | Season config        |
| E3  | Anti-gaming basics (rate limits, anomaly logs)   | Then    | API        | —                    |


## Dependency chain (critical path)

```
A1 activation → B1 marketplace depth → C1 chat reliability → D1 AI adapter → C4 monetizable checkout slice
```

## Weekly rhythm (suggested)

- **Monday:** pick 2–3 IDs from Pillars A–C for the week.  
- **Thursday:** demo + adjust roadmap file.  
- **Ship:** web (`cf:deploy`) + API host when server changes—**both** if touching contracts.

## Done = shipped + measured

Each P0/P1 should add **one metric** or **one log/event** so the next retrospective is data-backed.

---

*Absorbs roadmap phases from legacy docs; supersedes informal changelog entries for forward planning.*