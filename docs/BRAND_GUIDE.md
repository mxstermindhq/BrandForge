# BrandForge — brand & UI tokens

## Core colors (reference)

- **Background / surface:** dark neutrals (`globals.css` semantic tokens: `surface`, `on-surface`, `outline-variant`, etc.).
- **Primary accent:** blue star / links — `#4f8ef7` (see marketing OG and `icon.svg`).
- **App shell:** near-black base `#0a0a0b` for icon and OG artwork.

## Typography

- **Body:** Inter (via `next/font`).
- **Headlines:** Inter Tight (`--font-headline`).
- **Mono (where used):** JetBrains Mono (`--font-mono`).

Always use semantic Tailwind tokens (`text-on-surface`, `bg-surface-container`, `text-primary`, …) in components instead of raw hex, except shared static assets (favicon, OG image).

## Icons

- **UI:** Material Symbols Outlined (linked in root layout).
- **Brand mark:** ★ in a rounded square — `web/src/app/icon.svg`.

## Social / SEO assets

- `web/public/og-image.png` — 1200×630 Open Graph image.
- `web/public/site.webmanifest` — PWA manifest.
- Favicons in `web/public/` — regenerate with `npm run generate:public-assets` from `web/`.
