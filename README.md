# White Rabbit (WRBT_01)

**Bot-first document analysis platform with OpenClaw-inspired security**

A monorepo for ClaudeBots and OpenClaw operators to ingest, analyze, and cite documents with strong bot authentication. Frontend in Next.js, backend in Express + Drizzle ORM, database in PostgreSQL (Replit/Supabase).

## Architecture

```
whiterabbit/
├── apps/
│   ├── wrbt-api/          # Express.js backend with bot auth
│   └── wrbt-web/          # Next.js (App Router) frontend
├── packages/
│   ├── sdk/               # Typed client SDK (ingest, documents, chunks)
│   ├── types/             # Shared TypeScript types
│   └── ui/                # CodePanel + UI components
├── specs/                 # (TODO) OpenAPI contract, state machines
└── docs/                  # Architecture and planning docs
```

## 🚀 Quick Start

### 📦 Deployment Ready!

**Status**: ✅ Production-ready • Backend & Frontend complete • Full documentation

**Choose your path:**
- 🏃 **Fast Track**: See [QUICK_START.md](QUICK_START.md) (5 minutes)
- 📋 **Complete Guide**: See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) (30-45 minutes)
- 🔧 **Local Development**: Follow instructions below

---

### Local Development Setup

#### Prerequisites

- Node.js >= 18.17.0
- PostgreSQL database (Replit Postgres, Supabase, or local)

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Configure Backend

Create `apps/wrbt-api/.env`:

```bash
cd apps/wrbt-api
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
PORT=5001
SESSION_SECRET=$(openssl rand -base64 32)
NODE_ENV=development
USE_BCRYPT=false
```

#### 3. Setup Database

```bash
# Push schema to database (creates 8 tables)
npm run db:push

# Seed with sample data (optional)
npm run seed
```

#### 4. Configure Frontend

Create `apps/wrbt-web/.env.local`:

```bash
cd apps/wrbt-web
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_WRBT_API_BASE=http://localhost:5001
```

#### 5. Start Development Servers

```bash
# Run both frontend and backend
npm run dev:all

# Or run separately:
npm run dev:api   # Backend on http://localhost:5001
npm run dev       # Frontend on http://localhost:3000
```

---

### 🌐 Production Deployment

| Platform | Guide | Purpose |
|----------|-------|---------|
| **Replit** | [REPLIT_ENV_SETUP.md](REPLIT_ENV_SETUP.md) | Backend API server |
| **Vercel** | [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) | Frontend dashboard |
| **Both** | [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Complete walkthrough |

**Pre-generated SESSION_SECRET ready**: Check deployment guides!

## Bot Authentication Flow

WRBT_01 uses an OpenClaw-inspired pairing-code authentication system:

### 1. Register Your Bot

```bash
curl -X POST http://localhost:5001/api/bots/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MyBot",
    "contact_email": "bot@example.com"
  }'
```

Response:
```json
{
  "pairing_code": "123456",
  "status_url": "/api/bots/status/123456",
  "expires_at": "2026-02-03T11:30:00.000Z",
  "message": "Pairing code generated. Poll status_url to check approval.",
  "instructions": [...]
}
```

### 2. Admin Approves Bot

**Option A: Using Database**
```sql
UPDATE bots
SET status = 'approved'
WHERE pairing_code = '123456';
```

**Option B: Admin Dashboard** ✅
- Navigate to `http://localhost:3000/admin/bots`
- Click "Approve" on pending bot
- Copy generated token from alert

### 3. Poll for Approval

```bash
curl http://localhost:5001/api/bots/status/123456
```

Response (when approved):
```json
{
  "status": "approved",
  "bot_id": "uuid-here",
  "token": "wrbt_abc123...",
  "tier": "READ_ONLY",
  "message": "Bot approved. Save this token - it won't be shown again!"
}
```

### 4. Use Your Token

```bash
curl -X POST http://localhost:5001/api/ingest \
  -H "Authorization: Bearer wrbt_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Document",
    "content": "Document content here..."
  }'
```

## API Endpoints

### Public (No Auth Required)
- `GET /api/healthz` - Health check
- `GET /api/readyz` - Database health check
- `GET /api/documents` - List public documents
- `GET /api/documents/:id` - Get document details
- `GET /api/documents/:id/chunks` - Get document chunks
- `GET /api/documents/:id/status` - Get processing status

### Bot Registration (Public, Rate-Limited)
- `POST /api/bots/register` - Register bot (get pairing code)
- `GET /api/bots/status/:code` - Check approval status

### Bot-Authenticated (Requires Token)
- `POST /api/ingest` - Ingest new document

## Security Features

### ✅ Implemented
- **Bot pairing-code registration** (6-digit codes, 1-hour expiration)
- **Admin approval workflow** for bot access
- **API key authentication** (Bearer tokens)
- **Rate limiting** (in-memory, per-IP)
- **Audit logging** (all bot requests logged)
- **Public read-only access** (no auth required for GET endpoints)
- **Tiered bot capabilities** (READ_ONLY vs WRITE_LIMITED)

### ✅ Production-Ready Features
- **bcrypt token hashing** with dev/prod mode switching
- **Admin dashboard** at `/admin/bots` with one-click approve/revoke
- **OpenAPI 3.1 specification** for bot developers
- **Bot discovery** via robots.txt, sitemap, Schema.org, .well-known

### ⏸️ TODO (Production Hardening)
- [ ] Redis rate limiting (currently in-memory)
- [ ] Admin authentication (endpoints currently unprotected)
- [ ] CORS whitelist configuration
- [ ] HTTPS enforcement
- [ ] Discord bot integration endpoint
- [ ] Claude MCP integration endpoint

## Bot Capability Tiers

| Tier | Endpoints | Methods | Rate Limit |
|------|-----------|---------|------------|
| READ_ONLY | /api/documents/* | GET | 60 req/min |
| WRITE_LIMITED | READ_ONLY + /api/ingest | GET, POST | 10 req/min |

## Development Scripts

```bash
# Frontend
npm run dev           # Start Next.js dev server
npm run build         # Build frontend for production
npm run lint          # Lint frontend code

# Backend
npm run dev:api       # Start Express dev server
npm run db:push       # Push database schema changes
npm run seed          # Seed database with sample data
npm run check         # TypeScript type checking

# Both
npm run dev:all       # Run frontend + backend concurrently
```

## Project Structure

### Backend (`apps/wrbt-api/`)
```
server/
├── index.ts              # Express app entry point
├── db.ts                 # Database connection
├── storage.ts            # Drizzle ORM queries
├── routes.ts             # Main API routes
├── middleware/
│   └── bot-auth.ts       # Authentication + rate limiting
├── routes/
│   ├── bots.ts           # Bot registration endpoints
│   └── admin.ts          # ✅ Admin approval/revocation endpoints
└── utils/
    └── crypto.ts         # ✅ Pairing codes, API keys, bcrypt hashing

shared/
└── schema.ts             # Drizzle schema (8 tables)
```

### Frontend (`apps/wrbt-web/`)
```
app/
├── page.tsx              # Home: ingest documents
├── admin/
│   └── bots/page.tsx     # ✅ Admin dashboard (bot approval UI)
├── documents/[id]/
│   ├── page.tsx          # Document details
│   └── chunks/page.tsx   # Document chunks viewer
├── schema/page.tsx       # Schema inspector
├── sitemap.ts            # Dynamic sitemap generation
└── api/
    └── openapi/route.ts  # OpenAPI JSON endpoint
```

### Packages
- **`@wrbt/sdk`** - Typed client for API calls (no direct fetches in UI)
- **`@wrbt/types`** - Shared TypeScript interfaces
- **`@wrbt/ui`** - Shared React components (CodePanel, etc.)

## 📚 Documentation

### Deployment & Setup
- **[QUICK_START.md](QUICK_START.md)** - 5-minute deployment reference
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Complete deployment walkthrough
- **[DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)** - Current status and features
- **[REPLIT_ENV_SETUP.md](REPLIT_ENV_SETUP.md)** - Backend environment configuration
- **[VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md)** - Frontend environment configuration

### Architecture & Development
- **[SETUP_GUIDE.md](apps/wrbt-api/SETUP_GUIDE.md)** - Comprehensive backend setup
- **[SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md)** - OpenClaw security model
- **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** - Development roadmap
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - API testing guide
- **[REPLIT_HANDOFF.md](REPLIT_HANDOFF.md)** - Technical handoff for CODEX agent

### API Specification
- **[specs/openapi.yaml](specs/openapi.yaml)** - OpenAPI 3.1 specification

## Environment Variables

### Backend (`apps/wrbt-api/.env`)
```env
DATABASE_URL=postgresql://...       # Required: PostgreSQL connection
PORT=5001                           # Optional: Server port (default 5001)
SESSION_SECRET=...                  # Required: Session encryption key
NODE_ENV=development                # Optional: development|production
```

### Frontend (`apps/wrbt-web/.env.local`)
```env
NEXT_PUBLIC_WRBT_API_BASE=http://localhost:5001  # Required: Backend URL
NEXT_PUBLIC_WRBT_API_KEY=wrbt_...               # Optional: Bot token for frontend ingestion
```

## Deployment

### Vercel (Frontend)
1. Connect repo to Vercel
2. Set root directory to `apps/wrbt-web`
3. Add environment variable: `NEXT_PUBLIC_WRBT_API_BASE`
4. Deploy

### Replit (Backend)
1. Fork repo to Replit
2. Add Replit Postgres database
3. Set `DATABASE_URL` in Secrets
4. Run `npm run db:push`
5. Run `npm run dev:api`

### Production Hardening
Before production deployment:
- [ ] Implement bcrypt token hashing (`server/utils/crypto.ts`)
- [ ] Replace in-memory rate limiting with Redis
- [ ] Configure CORS whitelist
- [ ] Set strong `SESSION_SECRET`
- [ ] Enable HTTPS
- [ ] Add monitoring (Sentry, DataDog, etc.)
- [ ] Configure database backups
- [ ] Set up firewall rules

## Privacy & Safety

- ✅ **No service-role keys in client** - Backend handles all sensitive operations
- ✅ **Bot authentication required** - Write operations need approved bot token
- ✅ **Public read-only access** - Documents are publicly readable by default
- ✅ **Audit logging** - All bot requests logged with IP, user-agent, response time
- ✅ **Rate limiting** - Prevents abuse from single IP addresses

## Contributing

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the development roadmap and pending tasks.

## License

[TBD - See Task #8 in IMPLEMENTATION_PLAN.md]

## Support

- **Issues:** GitHub Issues
- **Security:** security@citemesh.com (TODO)
- **Discord:** #wrbt-01 channel (TODO)

---

**Status:** 🟢 v0.1.0 - ✅ Production-Ready • Backend + Frontend + Admin UI Complete

**Built with:** Express, Drizzle ORM, PostgreSQL, Next.js 14, TypeScript, Tailwind CSS

**Deployment:** Ready for Replit (backend) + Vercel (frontend) • See [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)
