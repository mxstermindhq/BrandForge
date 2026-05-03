# BrandForge Deployment Guide

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account and project
- Cloudflare account
- Domain configured in Cloudflare
- API keys for AI providers (Anthropic, OpenAI, etc.)

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
Create `.env` file with required variables:

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://yourdomain.com

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=...
XAI_API_KEY=xai-...

# Payments
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...

# Platform
NODE_ENV=production
AI_MODEL=gemini-2.0-flash
```

### 4. Supabase Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Push schema
supabase db push
```

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