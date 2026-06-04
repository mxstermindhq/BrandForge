# Portfolio screenshots — drop files here

## Quick steps (easiest)

1. **Compress** each image once (see below).
2. **Rename** to match the project slug (see `SLUGS.txt`).
3. **Save** into this folder: `brandforge/public/portfolio/`
4. **Register** the filename in `src/content/portfolio/screenshot-manifest.ts` (one line per image).
5. Run `npm run build` in `brandforge/` — done.

You do **not** need external links. Local files load fastest and score best in Lighthouse.

---

## File format (performance)

| Use | Format | Why |
|-----|--------|-----|
| **Preferred** | **WebP** (`.webp`) | Smallest size, sharp UI screenshots |
| **Also fine** | **JPEG** (`.jpg`) | Photos, busy UIs — use quality 80–85 |
| **Avoid** | PNG | Only for logos with transparency; otherwise 3–5× larger |

### Size targets

| Mockup type | Max width | Target file size |
|-------------|-----------|------------------|
| Desktop / browser | **1280px** wide | **80–200 KB** |
| Phone | **750px** wide | **50–120 KB** |
| Tablet | **1024px** wide | **80–150 KB** |

### Free compression (pick one)

- **Squoosh** — https://squoosh.app — drag image → WebP → quality **80** → download  
- **TinyPNG** — https://tinypng.com — batch JPG/PNG → often enough  
- **Windows Photos** — Export → resize width to 1280 → save as JPG quality high  

Rule: if a file is **over 300 KB**, compress again before uploading.

---

## Naming convention

**Default (recommended):** `{slug}.webp`  
Examples: `drain-cx.webp`, `carspotlive.webp`, `whiteskyhosting.webp`

**Custom name:** any name, but you must add it to `screenshot-manifest.ts`:

```ts
export const SCREENSHOT_FILES = {
  "drain-cx": "drain-cx.webp",
  "carspotlive": "carspotlive-mobile.webp", // custom filename
} as const;
```

Slugs must match `src/content/portfolio/projects.ts` exactly.

---

## Optional second shot (case study only)

For an extra angle on the case study page, add:

- `{slug}-2.webp` (e.g. `drain-cx-2.webp`)

Register in manifest:

```ts
"drain-cx-detail": "drain-cx-2.webp",
```

(Advanced — wire in `projects.ts` `detailScreenshot` when needed; ask in Discord if you want this automated.)

---

## Do not put PDFs here

PDFs and scans belong outside `public/portfolio/` — they get copied to the live site on deploy. A `.gitignore` blocks git only; keep docs elsewhere.

---

## Checklist before commit

- [ ] Image is WebP or JPG (not 2MB PNG)
- [ ] Width ≤ 1280px
- [ ] Filename matches slug (or manifest updated)
- [ ] `screenshot-manifest.ts` has an entry for that slug
- [ ] `npm run build` succeeds

---

## Telegram / Discord

If you prefer to send files to the team instead of git: zip the `public/portfolio/` folder contents + list of slugs. We drop them in and update the manifest for you.
