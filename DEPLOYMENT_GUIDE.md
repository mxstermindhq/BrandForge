# BrandForge Deployment Guide

## Quick Deploy Commands

### 1. Web (Cloudflare Pages)
```bash
cd web
npm install
npm run cf:build
npm run cf:deploy
```

### 2. API Server (Railway/Render/Fly.io)
```bash
# Deploy server.js with environment variables
# See server setup below
```

---

## Detailed Deployment Steps

### Step 1: Environment Setup

Create `web/.env.local`:
```bash
# Copy from .env.example
cp web/.env.example web/.env.local

# Edit and add your keys
```

Required variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_APP_URL=https://brandforge.gg
```

### Step 2: Database Migrations

Run Supabase migrations:
```bash
supabase migration up
```

Or apply manually from:
- `supabase/migrations/20260502_social_features.sql`

### Step 3: Build Web App

```bash
cd web
npm install
npm run cf:build
```

This creates `.open-next/` output.

### Step 4: Deploy to Cloudflare

```bash
npm run cf:deploy
```

Or manually via Wrangler:
```bash
npx wrangler pages deploy .open-next --project-name=brandforge
```

### Step 5: Deploy API Server

#### Option A: Railway (Recommended)
1. Connect GitHub repo to Railway
2. Add environment variables in Railway dashboard
3. Deploy

#### Option B: Render
1. Create new Web Service
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Add environment variables

#### Option C: Fly.io
```bash
flyctl launch
flyctl deploy
```

### Step 6: Configure Custom Domain

1. In Cloudflare dashboard: Add custom domain `brandforge.gg`
2. In Server host: Set `PUBLIC_WEB_ORIGIN=https://brandforge.gg`
3. In Supabase: Add `brandforge.gg` to redirect URLs

---

## Environment Variables Reference

### Web (Cloudflare/Next.js)
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=https://brandforge.gg
NEXT_PUBLIC_API_URL=https://api.brandforge.gg  # or same-origin
```

### Server (server.js)
```bash
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# AI Providers (at least one)
GROQ_API_KEY=gsk_...
# or OPENAI_API_KEY=sk-...
# or ANTHROPIC_API_KEY=sk-ant-...

# Storage
STORAGE_MODE=local  # or 'supabase'

# Server
PORT=3000
HOST=0.0.0.0
```

---

## Verification Commands

### Test AI Features
```bash
# Check AI status
curl https://brandforge.gg/api/ai/status

# Test brief generation
curl -X POST https://brandforge.gg/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"tool":"brief","input":"I need a mobile app for fitness tracking"}'
```

### Test Feed
```bash
# Get feed
curl https://brandforge.gg/api/feed
```

---

## Troubleshooting

### Build Fails
- Check Node version: Must be 20.x (NOT 22+)
- Clear cache: `npm run clean`
- Reinstall: `rm -rf node_modules && npm install`

### AI Not Working
- Verify `GROQ_API_KEY` is set
- Check `/api/ai/status` endpoint
- Check server logs for errors

### Auth Issues
- Verify Supabase URL and keys
- Check redirect URLs in Supabase dashboard
- Ensure cookies are properly configured

---

## Post-Deploy Checklist

- [ ] Homepage loads
- [ ] Login works (social & email)
- [ ] AI Brief Generator works
- [ ] AI Proposal Writer works
- [ ] AI Career Assistant works
- [ ] Feed displays correctly
- [ ] Profile pages load with OG tags
- [ ] Settings page accessible
- [ ] Marketplace/search functional

---

**Deploy with confidence! 🚀**
