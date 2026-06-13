# Security & Deploy — Post-Sprint 7 Audit

**Audit date:** 2026-06-13

---

## Static Export

| Check | Status | Notes |
|-------|--------|-------|
| No server secrets in client bundle | PASS | GA ID public only |
| No API keys exposed | PASS | Stripe links via env at build |
| Pure static output | PASS | Next.js `output: "export"` |
| `wrangler.jsonc` configured | PASS | Assets from `./out` |

---

## HTTPS & Edge

| Check | Status | Notes |
|-------|--------|-------|
| Valid HTTPS certificate | PASS | https://brandforge.gg loads |
| HTTP/3 | PASS | `alt-svc: h3=":443"` in response |
| HSTS | **NOT OBSERVED** | Not in sampled response headers; may be CF dashboard setting |
| X-Content-Type-Options | **NOT OBSERVED** | Consider adding via `_headers` or CF |
| X-Frame-Options | **NOT OBSERVED** | Consider adding via `_headers` or CF |
| Cache-Control HTML | PASS | `max-age=3600, stale-while-revalidate=86400` |
| Cache-Control static | PASS | `max-age=31536000, immutable` in `_headers` |

---

## Form Security

| Check | Status |
|-------|--------|
| CSRF risk | LOW — no server-side forms |
| Discord webhooks in client | PASS — not exposed |

---

## Admin Surface

| Check | Status |
|-------|--------|
| `/admin/` client gate | PASS — key or CF Access |
| Dashboard JSON in public/ | PASS — no secrets, metrics only |

---

## Grade: **B+**

Static export model is secure by default. Recommend adding security headers via Cloudflare or `_headers`.
