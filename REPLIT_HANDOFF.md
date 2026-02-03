# WRBT_01 Replit Workspace Handoff

**Date:** 2026-02-03
**Branch:** `wrbt01-v0.1-skeleton`
**Target Environment:** Replit workspace
**Status:** ✅ Backend compiles cleanly, ready for database setup

---

## Current State

### ✅ Completed
- **Backend:** Express + Drizzle ORM fully implemented
- **TypeScript:** All compilation errors fixed, `npm run check` passes
- **Dependencies:** All packages installed (including bcrypt)
- **Code Quality:** Clean working tree, all fixes committed
- **Build System:** Proper .gitignore for dist/ artifacts

### 🎯 What CODEX Needs to Do

**Step 1: Environment Setup**
```bash
# Create .env file from template
cd apps/wrbt-api
cp .env.example .env
```

**Step 2: Configure Database**

Edit `.env` and set:
```env
DATABASE_URL=postgresql://username:password@host:5432/database
PORT=5001
SESSION_SECRET=$(openssl rand -base64 32)
NODE_ENV=development
USE_BCRYPT=false  # Use plain text in dev for easier debugging
```

**Get DATABASE_URL from Replit:**
1. Open Replit workspace
2. Add PostgreSQL from Tools panel
3. Copy connection string from Replit Postgres panel
4. Format: `postgresql://username:password@host:5432/database`

**Step 3: Initialize Database**
```bash
# From monorepo root
npm run db:push    # Creates all 8 tables
npm run seed       # Optional: populate sample data
```

**Step 4: Start Server**
```bash
npm run dev:api    # Backend only on port 5001
# OR
npm run dev:all    # Both frontend (3000) and backend (5001)
```

**Step 5: Verify**
```bash
# Test health endpoint
curl http://localhost:5001/api/healthz
# Should return: {"status":"ok","timestamp":"..."}

# Test database connection
curl http://localhost:5001/api/readyz
# Should return: {"status":"ready"}
```

---

## Architecture Overview

### Backend Structure
```
apps/wrbt-api/
├── server/
│   ├── index.ts              # Express app entry
│   ├── db.ts                 # Database connection
│   ├── storage.ts            # Drizzle ORM queries
│   ├── routes.ts             # Main API routes
│   ├── middleware/
│   │   └── bot-auth.ts       # Auth + rate limiting
│   ├── routes/
│   │   ├── bots.ts           # Bot registration
│   │   └── admin.ts          # Admin endpoints
│   └── utils/
│       └── crypto.ts         # Pairing codes, bcrypt
├── shared/
│   └── schema.ts             # 8 tables defined
├── script/
│   └── seed-db.ts            # Database seeding
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── .env.example
```

### Database Schema (8 Tables)
1. **users** - Admin authentication
2. **bots** - Bot registration & tokens
3. **documents** - Document storage
4. **chunks** - Document chunks
5. **embeddings** - Vector embeddings (placeholder)
6. **document_jobs** - Processing status
7. **bot_requests** - Audit logging
8. **bot_integrations** - Platform integrations

---

## API Endpoints

### Public (No Auth)
- `GET /api/healthz` - Health check
- `GET /api/readyz` - Database health
- `GET /api/documents` - List public documents
- `GET /api/documents/:id` - Get document
- `GET /api/documents/:id/chunks` - Get chunks
- `GET /api/documents/:id/status` - Job status

### Bot Registration (Public, Rate-Limited)
- `POST /api/bots/register` - Register bot (get pairing code)
- `GET /api/bots/status/:code` - Check approval status

### Bot-Authenticated
- `POST /api/ingest` - Ingest document (requires Bearer token)

### Admin (⚠️ UNPROTECTED - TODO)
- `GET /api/admin/bots` - List all bots
- `POST /api/admin/bots/:id/approve` - Approve bot
- `POST /api/admin/bots/:id/revoke` - Revoke access

---

## Testing the Bot Flow

### 1. Register a Bot
```bash
curl -X POST http://localhost:5001/api/bots/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestBot",
    "contact_email": "test@example.com"
  }'
```

Response includes:
- `pairing_code`: "123456" (6 digits)
- `status_url`: "/api/bots/status/123456"
- `expires_at`: Timestamp (1 hour expiration)

### 2. Approve the Bot

**Option A: Via Database**
```sql
UPDATE bots
SET status = 'approved'
WHERE pairing_code = '123456';
```

**Option B: Via Admin API (if accessible)**
```bash
# Get bot ID first
curl http://localhost:5001/api/admin/bots | jq '.bots[] | select(.pairing_code=="123456")'

# Approve by ID
curl -X POST http://localhost:5001/api/admin/bots/{bot_id}/approve
```

### 3. Check Status
```bash
curl http://localhost:5001/api/bots/status/123456
```

When approved, response includes:
- `token`: "wrbt_abc123..." (Bearer token - shown once!)
- `status`: "approved"
- `tier`: "READ_ONLY" or "WRITE_LIMITED"

### 4. Ingest Document
```bash
curl -X POST http://localhost:5001/api/ingest \
  -H "Authorization: Bearer wrbt_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Document",
    "content": "This is a test document for ingestion."
  }'
```

Response:
- `document_id`: UUID
- `job_id`: UUID
- `status`: "queued"
- `status_url`: "/api/documents/{id}/status"

---

## TypeScript Fixes Already Applied

### ✅ Fixed Issues
1. **Removed Vite/Static imports** - API-only server doesn't need frontend serving
2. **Fixed @shared imports** - Changed to relative `../shared/schema`
3. **Query param typing** - Added `getString()` helper for Express params
4. **User-agent nullability** - Fixed `req.headers['user-agent'] ?? null`
5. **Drizzle orderBy** - Corrected `asc(chunks.position)` syntax

### Compilation Status
```bash
npm run check --workspace=apps/wrbt-api
# ✅ Passes with zero errors
```

---

## Security Features

### ✅ Implemented
- **Bot pairing-code auth** - 6-digit codes, 1-hour expiration
- **Bearer token auth** - API keys with `wrbt_` prefix
- **Rate limiting** - In-memory (per-IP)
- **Audit logging** - All bot requests logged
- **Bcrypt hashing** - Token hashing (auto-enabled in production)

### ⚠️ Development vs Production

**Development Mode** (`NODE_ENV=development`, `USE_BCRYPT=false`):
- Plain-text token storage (easier debugging)
- Console warnings shown
- In-memory rate limiting

**Production Mode** (`NODE_ENV=production` or `USE_BCRYPT=true`):
- Bcrypt token hashing (10 rounds)
- No console warnings
- TODO: Redis rate limiting (not implemented)

### 🚨 Security Warnings
1. **Admin endpoints unprotected** - Add Passport.js session auth
2. **In-memory rate limiting** - Replace with Redis for production
3. **No CORS config** - Add CORS whitelist before deployment
4. **No HTTPS enforcement** - Configure in production

---

## Frontend Integration

### Frontend URLs
- **Development:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin/bots
- **OpenAPI Spec:** http://localhost:3000/api/openapi

### Environment Variables
Create `apps/wrbt-web/.env.local`:
```env
NEXT_PUBLIC_WRBT_API_BASE=http://localhost:5001
NEXT_PUBLIC_WRBT_API_KEY=wrbt_...  # Optional: for frontend ingestion
```

### Start Frontend
```bash
npm run dev         # Frontend only
npm run dev:all     # Both frontend + backend
```

---

## Common Issues & Solutions

### Issue: "DATABASE_URL not set"
**Solution:** Create `.env` file with valid PostgreSQL connection string

### Issue: "relation 'bots' does not exist"
**Solution:** Run `npm run db:push` to create tables

### Issue: "Port 5001 already in use"
**Solution:** Change `PORT` in `.env` or kill existing process

### Issue: TypeScript errors after pulling
**Solution:** Run `npm install` to sync dependencies

### Issue: "Module not found: @shared/schema"
**Solution:** Already fixed - uses `../shared/schema` instead

---

## Git Workflow for Replit

### Before Making Changes
```bash
git pull origin wrbt01-v0.1-skeleton
```

### After Making Changes
```bash
git add <files>
git commit -m "descriptive message

Co-Authored-By: CODEX Agent <noreply@anthropic.com>"
git push origin wrbt01-v0.1-skeleton
```

### Current Branch Status
- **Branch:** `wrbt01-v0.1-skeleton`
- **Status:** Clean working tree
- **Last Commit:** `1ac39f3` - bcrypt token hashing

---

## Next Steps for CODEX

### Priority 1: Get Running
1. ✅ Verify TypeScript compiles (`npm run check`)
2. ⏳ Create `.env` with DATABASE_URL
3. ⏳ Run `npm run db:push` (create tables)
4. ⏳ Run `npm run seed` (optional sample data)
5. ⏳ Start server: `npm run dev:api`
6. ⏳ Test endpoints with curl

### Priority 2: Verify Bot Flow
1. Register a test bot
2. Approve via database or admin API
3. Poll status endpoint
4. Ingest a test document
5. Verify document appears in database

### Priority 3: Document Results
1. Record any errors encountered
2. Note successful endpoints
3. Document DATABASE_URL format used
4. Share test results

---

## Documentation References

- **README.md** - Quick Start guide
- **SETUP_GUIDE.md** - Detailed backend setup (`apps/wrbt-api/SETUP_GUIDE.md`)
- **SECURITY_ARCHITECTURE.md** - OpenClaw security model
- **IMPLEMENTATION_PLAN.md** - Development roadmap
- **TESTING_GUIDE.md** - API testing examples
- **specs/openapi.yaml** - OpenAPI 3.1 specification

---

## Support & Contact

- **GitHub:** https://github.com/CiteMesh/whiterabbit
- **Issues:** https://github.com/CiteMesh/whiterabbit/issues
- **Branch:** `wrbt01-v0.1-skeleton`

---

**Ready for database connection and end-to-end testing!** 🚀
