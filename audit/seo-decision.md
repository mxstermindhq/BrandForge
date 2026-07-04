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

The conflict is caused by **Cloudflare Managed Content** (a zone-level feature) prepending its own rules to the origin's `robots.txt`. It is NOT fixable from the codebase — no API key or Terraform config exists in this repo for zone-level settings.

### Exact steps (screenshot-level detail)

1. **Log in** to https://dash.cloudflare.com → select **brandforge.gg** zone
2. In the left sidebar, click **Scrape Shield** (under the **Security** section)
3. Scroll to **Managed robots.txt** — toggle it **OFF**
   - Alternatively, if a newer AI-specific section exists under **Security → Bots**:
     - Click **Security → Bots**
     - Open **AI Crawler Control** or **Bot Fight Mode** settings
     - Find the "verified AI crawlers" blocklist
     - Remove: GPTBot, ClaudeBot, Google-Extended, PerplexityBot from the blocked list
4. **Purge cache:** Go to **Caching → Configuration → Purge Everything** (or purge `/robots.txt` specifically)
5. **Verify:**
   ```bash
   curl -s https://brandforge.gg/robots.txt
   ```
   — the response must NOT contain `# BEGIN Cloudflare Managed content` / `# END Cloudflare Managed Content` blocks with `Disallow: /` for GPTBot, ClaudeBot, etc.
6. **Verify each bot can still access the site:**
   ```bash
   curl -sA "GPTBot" -w "%{http_code}" -o /dev/null https://brandforge.gg/
   curl -sA "ClaudeBot" -w "%{http_code}" -o /dev/null https://brandforge.gg/
   curl -sA "PerplexityBot" -w "%{http_code}" -o /dev/null https://brandforge.gg/
   ```
   All should return `200`.

**Note as of July 4, 2026:** AI bots returning 200 for page requests is already confirmed. The only remaining issue is the conflicting `Disallow` in robots.txt itself — the Managed Content section wins for bots that respect the first-matching user-agent directive. Edge cache may serve stale robots.txt for up to 86400s (`Cache-Control: public, max-age=86400`).

Until this is done, GEO content investment (llms.txt, FAQ schema) is partially wasted for AI crawlers — they CAN access the content (200) but are TOLD not to index it (robots.txt Disallow).

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
