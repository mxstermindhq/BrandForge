# BrandForge Deployment Guide

**Last Updated:** May 8, 2026

Complete guide for deploying BrandForge to production.

## Prerequisites

- Node.js 20+ LTS (see `web/.nvmrc`)
- npm or pnpm
- Supabase account and project
- Cloudflare account with Workers plan
- Domain configured in Cloudflare
- API keys for AI providers (Groq, xAI, OpenRouter, Gemini, Anthropic)

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/mxstermindhq/BrandForge.git
cd BrandForge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables

#### Root `.env`
```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers (at least one required)
GROQ_API_KEY=gsk_...
XAI_API_KEY=xai-...
OPENROUTER_API_KEY=...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...

# Payments (NowPayments)
NOWPAYMENTS_API_KEY=...
NOWPAYMENTS_IPN_SECRET=...

# Email
RESEND_API_KEY=re_...

# Platform
NODE_ENV=production
```

#### Web `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Supabase Database Setup

Run migrations in order via Supabase SQL Editor:

```sql
-- Step 1: Fix profiles table columns
\i supabase/migrations/20260503a_fix_profiles.sql

-- Step 2: Create social tables (if not exists)
-- Note: If tables already exist, skip to Step 3
\i supabase/migrations/20260503b_social_tables_simple.sql

-- Step 3: Fix existing tables and add policies
\i supabase/migrations/20260503d_fix_existing_tables.sql

-- Step 4: Add storage bucket
\i supabase/migrations/20260503e_storage_bucket.sql
```

**Note:** If `supabase db push` is not available, run SQL files directly in Supabase Dashboard → SQL Editor.

## Build Process

### 1. Frontend Build
```bash
cd web
npm run build
```

### 2. OpenNext Build
```bash
npm run cf:build
```

This generates optimized Cloudflare Worker bundles in `.open-next/`

## Deployment

### 1. Cloudflare Workers
```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler auth login

# Deploy
npx wrangler deploy --config wrangler.jsonc
```

### 2. Domain Configuration
Update `wrangler.jsonc` with your domain:
```json
{
  "routes": [
    {
      "pattern": "yourdomain.com",
      "zone_id": "your_zone_id"
    }
  ]
}
```

### 3. Environment Variables in Cloudflare
Set secrets in Cloudflare Dashboard:
```bash
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put ANTHROPIC_API_KEY
# ... other secrets
```

## Database Migration

### Initial Schema
```sql
-- Run in Supabase SQL Editor
\i supabase/schema.sql
```

### Migrations
```bash
# Apply migrations
supabase db push

# Create new migration
supabase migration new migration_name
```

## Monitoring and Maintenance

### Logs
```bash
# Cloudflare Workers logs
wrangler tail

# Supabase logs
supabase logs
```

### Backups
```bash
# Database backup
supabase db dump > backup.sql

# Restore
supabase db reset
psql -f backup.sql
```

### Performance Monitoring
- Cloudflare Analytics
- Supabase Dashboard
- Custom error tracking

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version (18+)
- Clear node_modules and reinstall
- Verify environment variables

#### API Errors
- Check API keys are set correctly
- Verify Supabase connection
- Check rate limits on AI providers

#### Deployment Issues
- Ensure wrangler is authenticated
- Check Cloudflare account limits
- Verify domain DNS settings

### Rollback
```bash
# Deploy previous version
wrangler deploy --config wrangler.jsonc --version-id previous_version_id
```

## Security Checklist

- [ ] Environment variables not committed
- [ ] API keys are secrets in Cloudflare
- [ ] Database access restricted
- [ ] CORS configured correctly
- [ ] HTTPS enforced
- [ ] Rate limiting enabled

## Performance Optimization

### Frontend
- Enable static generation where possible
- Optimize images and bundles
- Use CDN for assets

### Backend
- Implement caching for API responses
- Optimize database queries
- Use connection pooling

### Database
- Add appropriate indexes
- Monitor query performance
- Implement data archiving

## Scaling

### Vertical Scaling
- Upgrade Cloudflare Workers plan
- Increase Supabase compute resources

### Horizontal Scaling
- Implement caching layers
- Use multiple database replicas
- Consider microservices architecture

## Support

For deployment issues:
- Check GitHub Issues
- Review Cloudflare Workers documentation
- Contact infrastructure team