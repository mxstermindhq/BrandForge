# SEO & AI Crawler Policy — BrandForge

**Decision date:** 2026-06-13  
**Status:** Active  
**Owner:** Content architecture / growth

---

## Decision

**Option A — AI-SEO is intentional.** Allow AI crawlers to index public marketing content for GEO (Generative Engine Optimisation).

The app-owned policy lives in `brandforge/src/app/robots.ts` and explicitly allows:

- GPTBot, ChatGPT-User, ClaudeBot, Google-Extended, PerplexityBot

Public content (`llms.txt`, FAQ schema, blog depth) is written for human + AI extraction.

---

## Conflict

Production `robots.txt` currently has **two layers**:

1. **Cloudflare Managed Content** — blocks GPTBot, ClaudeBot, Google-Extended, CCBot, etc.
2. **Next.js static export (`robots.ts`)** — allows those same bots

Edge-managed rules are prepended and **take precedence** for blocked user-agents. Net effect today: **AI bots are blocked** despite app intent.

---

## Required action (manual — Cloudflare dashboard)

1. Log in to Cloudflare → **brandforge.gg** zone  
2. **Security** or **Scrape Shield** → **Managed robots.txt** (or Bot Fight / AI Crawl Control)  
3. **Disable** managed robots rules that block GPTBot / ClaudeBot / Google-Extended **OR** switch to “allow AI search indexing” if the dashboard offers a toggle  
4. Purge cache for `/robots.txt`  
5. Verify: `curl https://brandforge.gg/robots.txt` — app rules should allow GPTBot without preceding `Disallow`

Until this is done, GEO content investment (llms.txt, FAQ schema) is partially wasted for AI crawlers.

---

## What stays blocked / noindex

| Path | Policy |
|------|--------|
| `/launch/` | `noindex` — internal campaign ops, not in sitemap |
| Admin / auth routes | N/A on static marketing site |

---

## Review cadence

Re-check after any Cloudflare plan change or new “AI bot” product toggle — Q3 2026 or when Search Console / Perplexity referral traffic is measured.

---

## References

- `brandforge/src/app/robots.ts`
- `brandforge/public/llms.txt`
- `audit/seo-final-report.md`
- `audit/ecosystem-audit-playbook.md` — Pillar C
