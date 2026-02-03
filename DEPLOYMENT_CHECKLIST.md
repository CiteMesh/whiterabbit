# WRBT_01 Deployment Checklist

Complete guide for deploying WhiteRabbit backend to Replit and frontend to Vercel.

---

## Phase 1: Replit Backend Setup (15-20 minutes)

### 1.1 Create Replit Workspace

- [ ] Go to https://replit.com
- [ ] Click "Create Repl"
- [ ] Choose "Import from GitHub"
- [ ] Enter repository URL: `https://github.com/YOUR-USERNAME/whiterabbit`
- [ ] Select branch: `main` or `wrbt01-v0.1-skeleton`
- [ ] Click "Import from GitHub"

### 1.2 Add PostgreSQL Database

- [ ] Click "Tools" icon (🔧) in left sidebar
- [ ] Search for "PostgreSQL"
- [ ] Click "Add" to provision database
- [ ] Wait for database to initialize (30-60 seconds)
- [ ] Copy the connection string shown in the Postgres panel
  - Format: `postgresql://username:password@host:5432/database`

### 1.3 Configure Environment Variables

- [ ] Click "Secrets" icon (🔒) in left sidebar (or Tools → Secrets)
- [ ] Add each variable as a separate secret:

| Key | Value | Source |
|-----|-------|--------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | From PostgreSQL panel |
| `PORT` | `5001` | Fixed value |
| `SESSION_SECRET` | `uUfdWxBq4IswtDKOL6Q4kIE/SWRnQQ7OthGHbqhg000=` | Pre-generated (or run `openssl rand -base64 32`) |
| `NODE_ENV` | `development` | Fixed value |
| `USE_BCRYPT` | `false` | Fixed value (dev mode) |

### 1.4 Initialize Database Schema

Open Replit Shell and run:

```bash
# Install dependencies
npm install

# Push database schema (creates 8 tables)
npm run db:push

# (Optional) Seed with sample data
npm run seed
```

Expected output:
```
✓ Created table: users
✓ Created table: bots
✓ Created table: documents
✓ Created table: chunks
✓ Created table: embeddings
✓ Created table: document_jobs
✓ Created table: bot_requests
✓ Created table: bot_integrations
```

### 1.5 Start Backend Server

```bash
npm run dev:api
```

Expected output:
```
> wrbt-api@0.1.0 dev
> tsx watch server/index.ts

🚀 WRBT API listening on port 5001
✓ Database connection established
```

### 1.6 Test Backend Health

Replit automatically exposes a public URL. Find it in the "Webview" panel or look for:
```
https://wrbt-api-YOUR-USERNAME.repl.co
```

Test endpoints:
```bash
# Replace with your actual Replit URL
export REPLIT_URL="https://YOUR-REPLIT-URL.repl.co"

# Test health
curl $REPLIT_URL/api/healthz
# Expected: {"status":"ok","timestamp":"..."}

# Test database
curl $REPLIT_URL/api/readyz
# Expected: {"status":"ready"}

# Test bot registration
curl -X POST $REPLIT_URL/api/bots/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestBot",
    "contact_email": "test@example.com"
  }'
# Expected: {"pairing_code":"123456",...}
```

- [ ] All health checks pass ✅
- [ ] Copy your Replit URL for next phase

---

## Phase 2: Vercel Frontend Deployment (10-15 minutes)

### 2.1 Install Vercel CLI (If Not Installed)

```bash
npm install -g vercel
vercel login
```

### 2.2 Link Project to Vercel

From monorepo root:

```bash
cd /Users/graemeauchterlonie/EVIDENTEX/EV-ROOT-FS01__hub/WRBT_01/whiterabbit

# Link to Vercel (creates .vercel directory)
vercel link
```

You'll be prompted:
- "Set up and deploy?"  → Yes
- "Which scope?" → Select your account
- "Link to existing project?" → No (first time) or Yes (if project exists)
- "What's your project's name?" → `whiterabbit` or `wrbt-web`
- "In which directory is your code located?" → `./`

### 2.3 Update vercel.json with Replit URL

- [ ] Open `vercel.json` in the project root
- [ ] Replace `REPLACE-WITH-YOUR-REPLIT-URL.repl.co` with your actual Replit URL
- [ ] Save the file

Example:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://wrbt-api-yourusername.repl.co/api/:path*"
    }
  ]
}
```

### 2.4 Set Environment Variables in Vercel

**Option A: Via CLI**
```bash
vercel env add NEXT_PUBLIC_WRBT_API_BASE
# When prompted:
# Value: https://YOUR-REPLIT-URL.repl.co
# Select: Production, Preview, Development (all three)
```

**Option B: Via Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - Key: `NEXT_PUBLIC_WRBT_API_BASE`
   - Value: `https://YOUR-REPLIT-URL.repl.co`
   - Environments: Production, Preview, Development

### 2.5 Deploy to Vercel

```bash
# Deploy to production
vercel --prod
```

Expected output:
```
🔍 Inspect: https://vercel.com/your-username/whiterabbit/...
✅ Production: https://whiterabbit-xyz.vercel.app [copied]
```

- [ ] Deployment successful
- [ ] Copy your Vercel production URL

### 2.6 Test Frontend Deployment

```bash
# Replace with your Vercel URL
export VERCEL_URL="https://YOUR-VERCEL-URL.vercel.app"

# Test homepage
curl $VERCEL_URL

# Test API proxy (if rewrites configured)
curl $VERCEL_URL/api/healthz
# Should proxy to Replit backend

# Open admin dashboard in browser
open $VERCEL_URL/admin/bots
```

---

## Phase 3: End-to-End Testing (5-10 minutes)

### 3.1 Test Bot Registration Flow

Open your Vercel URL in browser:
```
https://YOUR-VERCEL-URL.vercel.app/admin/bots
```

You should see:
- Admin dashboard with stats cards
- Empty bot list (or test bots if seeded)
- "Pending", "Approved", "Revoked" filter tabs

### 3.2 Register a Test Bot

From terminal:
```bash
curl -X POST https://YOUR-REPLIT-URL.repl.co/api/bots/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ProductionTestBot",
    "contact_email": "test@yourdomain.com"
  }'
```

Save the `pairing_code` from response (6 digits).

### 3.3 Approve Bot via Admin UI

1. Refresh admin dashboard: `https://YOUR-VERCEL-URL.vercel.app/admin/bots`
2. Find "ProductionTestBot" in pending list
3. Click "Approve" button
4. Copy the generated token from alert (starts with `wrbt_`)
5. **IMPORTANT**: Save this token - it's only shown once!

### 3.4 Test Document Ingestion

```bash
# Replace with your token
export BOT_TOKEN="wrbt_abc123..."

curl -X POST https://YOUR-REPLIT-URL.repl.co/api/ingest \
  -H "Authorization: Bearer $BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Production Test Document",
    "content": "This is a test of the document ingestion system in production."
  }'
```

Expected response:
```json
{
  "document_id": "uuid-here",
  "job_id": "uuid-here",
  "status": "queued",
  "status_url": "/api/documents/{id}/status"
}
```

### 3.5 Verify Document in Database

Check Replit Shell:
```bash
# This would require psql access or Drizzle Studio
# For now, verify via API:
curl https://YOUR-REPLIT-URL.repl.co/api/documents
```

---

## Phase 4: Production Hardening (Optional, 15-20 minutes)

### 4.1 Enable Bcrypt in Production

In Replit Secrets:
- [ ] Change `USE_BCRYPT` from `false` to `true`
- [ ] Restart Replit server

**⚠️ WARNING**: This will invalidate all existing bot tokens. Bots must re-register.

### 4.2 Add CORS Configuration

Edit `apps/wrbt-api/server/index.ts`:

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://YOUR-VERCEL-URL.vercel.app',
    'https://YOUR-VERCEL-URL-*.vercel.app', // Preview deployments
  ],
  credentials: true,
}));
```

Install cors:
```bash
cd apps/wrbt-api
npm install cors @types/cors
```

Commit and push changes.

### 4.3 Set NODE_ENV to Production

In Replit Secrets:
- [ ] Change `NODE_ENV` from `development` to `production`

This automatically enables:
- ✅ Bcrypt token hashing
- ✅ Production error handling
- ✅ Rate limit enforcement

### 4.4 Add Admin Authentication

**TODO**: Admin endpoints are currently unprotected!

Recommended: Implement Passport.js session auth or Clerk/Auth0.

### 4.5 Configure Custom Domains (Optional)

**Replit:**
1. Go to Replit project settings
2. Click "Domains"
3. Add custom domain: `api.wrbt.yourdomain.com`

**Vercel:**
1. Go to Vercel project settings
2. Click "Domains"
3. Add custom domain: `wrbt.yourdomain.com`

Update environment variables accordingly.

---

## Troubleshooting

### Backend Issues

**"Module not found" in Replit**
```bash
npm install
npm run dev:api
```

**"Database connection failed"**
- Check `DATABASE_URL` in Replit Secrets
- Ensure PostgreSQL tool is running
- Verify connection string format

**"Port already in use"**
- Stop previous server instance in Replit
- Or change `PORT` in Secrets

### Frontend Issues

**"API calls return 404"**
- Verify `NEXT_PUBLIC_WRBT_API_BASE` in Vercel
- Check Replit backend is running
- Test direct API call: `curl $REPLIT_URL/api/healthz`

**"CORS errors in browser"**
- Add Vercel domain to CORS whitelist in Express
- Ensure `credentials: true` in cors config

**"Build failed on Vercel"**
- Check build logs in Vercel dashboard
- Verify `vercel.json` buildCommand is correct
- Run `npm run build` locally first

### Bot Authentication Issues

**"Invalid token"**
- Ensure bearer token format: `Authorization: Bearer wrbt_...`
- Check token wasn't generated with `USE_BCRYPT=false` then validated with `USE_BCRYPT=true`
- Tokens are invalidated when bcrypt setting changes

**"Pairing code expired"**
- Codes expire after 1 hour
- Register new bot to get fresh code

---

## Success Criteria ✅

- [ ] Replit backend running at public URL
- [ ] Database tables created (8 tables)
- [ ] Health endpoints returning 200 OK
- [ ] Vercel frontend deployed successfully
- [ ] Admin dashboard loads at `/admin/bots`
- [ ] Bot registration flow works end-to-end
- [ ] Document ingestion with valid token succeeds
- [ ] Audit logs captured in `bot_requests` table

---

## Post-Deployment

### Monitor Logs

**Replit:**
- View logs in Replit Shell output
- Check for database connection errors
- Monitor rate limit triggers

**Vercel:**
```bash
vercel logs --follow
```

### Regular Maintenance

- [ ] Review `bot_requests` table weekly for suspicious activity
- [ ] Revoke unused bot tokens
- [ ] Monitor database size (PostgreSQL free tier limits)
- [ ] Update dependencies: `npm update`

---

## Support Resources

- **Replit Docs**: https://docs.replit.com
- **Vercel Docs**: https://vercel.com/docs
- **WRBT_01 Setup Guide**: `REPLIT_HANDOFF.md`
- **Environment Variables**: `REPLIT_ENV_SETUP.md`, `VERCEL_ENV_SETUP.md`
- **OpenAPI Spec**: `specs/openapi.yaml`

---

**Deployment Date**: _____________________
**Deployed By**: _____________________
**Replit URL**: _____________________
**Vercel URL**: _____________________
