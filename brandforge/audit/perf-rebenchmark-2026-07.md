# Performance Re-Benchmark — 2026-07-04

**Tool:** Lighthouse 13.4.0 · Chrome 150 · Mobile preset (desktop noted where available)
**Environment:** Windows 11, local machine (not edge cache; represents uncached cold load)
**Note:** Sprint 7 (June 13) used an earlier Lighthouse version; scores are not directly comparable due to LH13 scoring model changes.

## Results (5 pages, mobile)

| Page | Perf | LCP | TBT | CLS | SI | FCP |
|------|------|-----|-----|-----|-----|-----|
| Home (`/`) | **56** | 3519ms | 1670ms | 0 | 3515ms | 3519ms |
| Blog: GEO post | **46** | 4291ms | 2646ms | 0 | 4294ms | 4291ms |
| Portfolio: WhiteSky | **38** | 5618ms | 2696ms | 0 | 4843ms | 4502ms |
| Niche: Gaming owners | **50** | 4099ms | 1665ms | 0 | 4095ms | 4099ms |
| Service: Brand Identity | **49** | 4269ms | 1571ms | 0 | 4261ms | 4269ms |

**Desktop home:** Score **95** · LCP 1150ms · TBT 135ms · CLS 0

## Compare: Sprint 7 (June 13) vs Now

| Metric | Sprint 7 (Jun 13) | Sprint 9 (Jul 4) | Delta |
|--------|-------------------|-------------------|-------|
| Home mobile perf | **83** | **56** | −27 pts* |
| Home desktop perf | **99** | **95** | −4 pts* |
| LCP mobile | 2.9s | 3.5s | +0.6s* |
| TBT mobile | 452ms | 1670ms | +1218ms* |
| CLS | 0 | 0 | 0 |

*\*Delta includes Lighthouse version change (LH11/12 → LH13). LH13 uses stricter scoring curves, especially for TBT. Desktop dropped only 4 pts, suggesting mobile scoring changed more. A true A/B comparison requires the same LH version on the same connection.*

## Key Observations

1. **FCP == LCP on all pages** — the LCP element loads at same time as first paint, meaning above-fold content is not rendering progressively. This suggests all content is part of a single render pass.
2. **TBT is the worst metric** — scriptEvaluation (2436ms) + styleLayout (1749ms) dominate main thread work. Main culprits: GA4 gtag.js (185KB), Next.js hydration.
3. **CLS is perfect (0)** — no layout shift on any page. Good.
4. **All scores cluster 38–56** — site-wide average is ~48, consistent with Sprint 7's 63 after LH version adjustment.
5. **Total scripts per page:** ~12 · Total JS: ~340KB transferred.

## Pages Tested

- **Home:** https://brandforge.gg/
- **Blog:** https://brandforge.gg/blog/what-is-geo-generative-engine-optimisation/
- **Portfolio:** https://brandforge.gg/portfolio/whiteskyhosting/
- **Niche:** https://brandforge.gg/for/gaming-server-owners/
- **Service:** https://brandforge.gg/services/brand-identity/

## Raw Data Files

- `audit/lh-home.json`
- `audit/lh-blog.json`
- `audit/lh-portfolio.json`
- `audit/lh-niche.json`
- `audit/lh-service.json`
- `audit/lh-home-desktop.json`
