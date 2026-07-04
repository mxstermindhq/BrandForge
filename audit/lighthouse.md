# BrandForge Lighthouse Audit

**Last updated:** 2026-06-13  
**Full report:** `audit/brandforge-audit.md`  
**Summary JSON:** `audit/brandforge-perf-all.json` (51 URLs, mobile, 2026-06-03)

---

## Production scores (live URLs)

| Page | Form factor | Performance | A11y | Best | SEO | LCP | CLS | TBT |
|------|-------------|-------------|------|------|-----|-----|-----|-----|
| brandforge.gg `/` | Mobile | **28** | 89 | 81 | 100 | 8.6 s | 0 | 3.1 s |
| brandforge.gg `/` | Desktop | **65** | — | — | — | ~1.1 s | ~0.006 | ~1.1 s |
| brandforge.gg `/packages/` | Mobile | **49** | — | — | — | ~4.0 s | 0 | ~3.4 s |
| Site average (51 URLs) | Mobile | **65** | — | — | — | — | 0 | — |
| Best page | Mobile | **84** | — | — | — | — | — | `/brand-guide/` |

**Targets:** Desktop 95+, mobile 85+, LCP &lt; 2.5 s, CLS ≈ 0 — **not met on home mobile**.

---

## Key findings (Jun 2026)

1. **CLS fixed** — static home removed lazy `#packages` hydration shift (was 0.86 in May).
2. **LCP still critical** — mobile home 8.6 s; main thread + fonts + GA.
3. **Content pages healthy** — most portfolio/roadmap/service pages score 74–84 mobile.
4. **Home is the outlier** — only page below 30 perf in full crawl.

---

## Raw reports

- `audit/lh-bf-all/` — per-URL mobile JSON (51 files)
- `audit/lh-bf-home-mobile-2026.json`
- `audit/lh-bf-home-desktop-2026.json`
- `audit/lh-bf-packages-mobile-2026.json`

---

## Re-run

```bash
cd brandforge && node scripts/audit-perf-all.mjs --fresh
npx lighthouse https://brandforge.gg/ --form-factor=mobile --view
```

Update `audit-perf-all.mjs` portfolio slug list before full crawl (currently 8 of 21).
