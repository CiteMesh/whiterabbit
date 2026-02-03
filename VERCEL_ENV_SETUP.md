# Vercel Environment Variables Setup

## Quick Setup for Vercel

### Option 1: Via Vercel Dashboard (Easiest)

1. **Go to your Vercel project**: https://vercel.com/dashboard
2. **Select your project** (or create new one)
3. **Go to Settings → Environment Variables**
4. **Add the following variables:**

```env
NEXT_PUBLIC_WRBT_API_BASE=https://your-replit-url.repl.co
```

**Important**: Replace `your-replit-url` with your actual Replit deployment URL!

### Option 2: Via Vercel CLI

First, install and authenticate:
```bash
npm install -g vercel
vercel login
```

Then set environment variables:
```bash
# Link to your Vercel project (one-time setup)
cd /Users/graemeauchterlonie/EVIDENTEX/EV-ROOT-FS01__hub/WRBT_01/whiterabbit
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_WRBT_API_BASE
# When prompted, enter: https://your-replit-url.repl.co
# Select: Production, Preview, Development (select all three)
```

### Option 3: Create Local .env.local (Development Only)

For local frontend development:
```bash
cd apps/wrbt-web
cat > .env.local << 'EOF'
NEXT_PUBLIC_WRBT_API_BASE=http://localhost:5001
EOF
```

## Environment Variable Reference

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `NEXT_PUBLIC_WRBT_API_BASE` | Backend API URL | `https://your-app.repl.co` | ✅ Yes |
| `NEXT_PUBLIC_WRBT_API_KEY` | API key for frontend ingestion | `wrbt_abc123...` | ❌ Optional |

## How to Get Your Replit URL

After deploying to Replit:
1. **Run the backend** with `npm run dev:api`
2. **Replit automatically exposes** a public URL like:
   - `https://wrbt-api-username.repl.co`
   - Or custom domain if configured
3. **Copy this URL** and use it as `NEXT_PUBLIC_WRBT_API_BASE`

## Deploy to Vercel

### First Time Deployment

```bash
cd /Users/graemeauchterlonie/EVIDENTEX/EV-ROOT-FS01__hub/WRBT_01/whiterabbit

# Deploy to Vercel
vercel --prod
```

Vercel will:
- ✅ Auto-detect Next.js project at `apps/wrbt-web`
- ✅ Build the frontend
- ✅ Deploy to production URL
- ✅ Give you a URL like `https://whiterabbit-xyz.vercel.app`

### Subsequent Deployments

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on every push (if connected)
```

Or deploy manually:
```bash
vercel --prod
```

## Vercel Project Configuration

If Vercel doesn't auto-detect the project structure, create `vercel.json`:

```json
{
  "buildCommand": "npm run build --workspace=apps/wrbt-web",
  "outputDirectory": "apps/wrbt-web/.next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-replit-url.repl.co/api/:path*"
    }
  ]
}
```

**This rewrites API calls** so frontend can call `/api/*` and Vercel proxies to Replit backend.

## Testing the Connection

After deployment:

```bash
# Test frontend loads
curl https://your-vercel-app.vercel.app

# Test API proxy works (if rewrites configured)
curl https://your-vercel-app.vercel.app/api/healthz
# Should proxy to Replit backend

# Or test direct backend call
curl https://your-replit-url.repl.co/api/healthz
```

## CORS Configuration (If Needed)

If Vercel frontend → Replit backend gives CORS errors:

**Add to `apps/wrbt-api/server/index.ts`:**
```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000',              // Local dev
    'https://your-app.vercel.app',        // Production
    'https://your-app-*.vercel.app',      // Preview deployments
  ],
  credentials: true,
}));
```

**Install cors:**
```bash
cd apps/wrbt-api
npm install cors
npm install --save-dev @types/cors
```

## Environment Variables Best Practices

### Development (Local)
```env
NEXT_PUBLIC_WRBT_API_BASE=http://localhost:5001
```

### Preview (Vercel Preview Deployments)
```env
NEXT_PUBLIC_WRBT_API_BASE=https://your-staging-replit.repl.co
```

### Production (Vercel Production)
```env
NEXT_PUBLIC_WRBT_API_BASE=https://api.wrbt.example.com
```

## Troubleshooting

### "API calls returning 404"
→ Check `NEXT_PUBLIC_WRBT_API_BASE` is set correctly
→ Verify Replit backend is running

### "CORS errors in browser console"
→ Add Vercel domain to CORS whitelist in Express backend

### "Environment variables not updating"
→ After changing env vars in Vercel, trigger a new deployment
→ Run `vercel --prod` to redeploy

### "Module not found during build"
→ Run `npm install` locally first
→ Ensure all dependencies in `apps/wrbt-web/package.json`

## Next Steps

1. ✅ Set `NEXT_PUBLIC_WRBT_API_BASE` in Vercel dashboard
2. ✅ Deploy with `vercel --prod`
3. ✅ Test frontend at your Vercel URL
4. ✅ Test admin dashboard at `https://your-vercel-url.vercel.app/admin/bots`

## Complete Deployment Checklist

- [ ] Replit backend deployed with DATABASE_URL
- [ ] Replit backend running at public URL
- [ ] Copy Replit URL
- [ ] Set `NEXT_PUBLIC_WRBT_API_BASE` in Vercel
- [ ] Deploy frontend: `vercel --prod`
- [ ] Test `/api/healthz` endpoint
- [ ] Test admin dashboard `/admin/bots`
- [ ] Configure CORS if needed
