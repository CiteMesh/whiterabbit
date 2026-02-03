# WRBT_01 Quick Start Guide

## 🎯 What You Need Right Now

### For Replit (Backend API)

**Add these 5 secrets in Replit** (click 🔒 icon):

```env
DATABASE_URL=<get from PostgreSQL panel after adding it>
PORT=5001
SESSION_SECRET=uUfdWxBq4IswtDKOL6Q4kIE/SWRnQQ7OthGHbqhg000=
NODE_ENV=development
USE_BCRYPT=false
```

**Then run**:
```bash
npm install
npm run db:push    # Creates database tables
npm run dev:api    # Starts server on port 5001
```

**Copy your Replit URL**: `https://YOUR-REPLIT-URL.repl.co`

---

### For Vercel (Frontend Dashboard)

**Step 1**: Update `vercel.json` (line 7):
```json
"destination": "https://YOUR-ACTUAL-REPLIT-URL.repl.co/api/:path*"
```

**Step 2**: Set environment variable in Vercel:
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add: `NEXT_PUBLIC_WRBT_API_BASE` = `https://YOUR-REPLIT-URL.repl.co`

**Step 3**: Deploy:
```bash
vercel --prod
```

---

## 📋 Complete Guides

| What | Where |
|------|-------|
| Replit setup | `REPLIT_ENV_SETUP.md` |
| Vercel setup | `VERCEL_ENV_SETUP.md` |
| Full deployment | `DEPLOYMENT_CHECKLIST.md` |
| Legacy handoff | `REPLIT_HANDOFF.md` |

---

## ✅ Quick Test After Deployment

```bash
# Test backend health
curl https://YOUR-REPLIT-URL.repl.co/api/healthz

# Test frontend
open https://YOUR-VERCEL-URL.vercel.app/admin/bots
```

---

## 🚨 Common First Issues

| Problem | Solution |
|---------|----------|
| "DATABASE_URL not set" | Add it to Replit Secrets from PostgreSQL panel |
| "relation 'bots' does not exist" | Run `npm run db:push` |
| "API calls return 404" from Vercel | Check `NEXT_PUBLIC_WRBT_API_BASE` is set |
| Vercel build fails | Update `vercel.json` with correct Replit URL |

---

## 📦 What This Is

**Backend** (Replit): Express.js + Drizzle ORM + PostgreSQL
- Bot pairing-code authentication
- Document ingestion API
- Admin approval endpoints

**Frontend** (Vercel): Next.js 14 + Tailwind CSS
- Admin dashboard at `/admin/bots`
- Bot approval UI
- Stats and filtering

---

## 🔗 Architecture

```
Bot Client
    ↓
Express API (Replit:5001)
    ↓
PostgreSQL (Replit/Neon)

Admin User
    ↓
Next.js UI (Vercel)
    ↓
Express API (Replit:5001)
```

---

## ⚡ Fast Track (Already Have Everything Set Up?)

```bash
# Backend
npm run db:push && npm run dev:api

# Frontend
vercel --prod

# Test
curl https://YOUR-REPLIT-URL.repl.co/api/healthz
```

Done! 🎉
