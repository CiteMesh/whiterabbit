# WRBT_01 API Setup Guide

## Prerequisites

- Node.js >= 18.17.0
- PostgreSQL database (Replit Postgres, Supabase, or local)
- Git

## Step 1: Install Dependencies

From the monorepo root:

```bash
npm install
```

## Step 2: Configure Database

### Option A: Replit Postgres (Recommended)

1. Open your Replit workspace
2. Add a PostgreSQL database from the Tools panel
3. Copy the connection string from the Replit Postgres panel
4. Format: `postgresql://username:password@host:5432/database`

### Option B: Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → Database
3. Copy the "Connection string" (use "Connection pooling" for production)
4. Format: `postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`

### Option C: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `createdb wrbt_db`
3. Connection string: `postgresql://localhost:5432/wrbt_db`

## Step 3: Create .env File

```bash
cd apps/wrbt-api
cp .env.example .env
```

Edit `.env` and add your DATABASE_URL:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
PORT=5001
NODE_ENV=development
SESSION_SECRET=your-secret-here-use-openssl-rand-base64-32
```

**Generate SESSION_SECRET:**
```bash
openssl rand -base64 32
```

## Step 4: Push Database Schema

This creates all tables using Drizzle ORM:

```bash
# From monorepo root
npm run db:push
```

Expected output:
```
✔ Applying migrations...
✔ Successfully applied:
  - users
  - bots
  - documents
  - chunks
  - embeddings
  - document_jobs
  - bot_requests
  - bot_integrations
```

## Step 5: Seed Database (Optional)

Populate with sample data:

```bash
npm run seed
```

This creates:
- 1 admin user (`admin` / `admin123`)
- 2 sample bots (1 approved, 1 pending)
- 3 sample documents with chunks

## Step 6: Start Development Server

```bash
# API only
npm run dev:api

# Or run both frontend and API
npm run dev:all
```

Expected output:
```
9:30 AM [express] serving on port 5001
```

## Step 7: Verify Installation

Test health endpoints:

```bash
# Basic health check
curl http://localhost:5001/api/healthz

# Database health check
curl http://localhost:5001/api/readyz
```

Expected responses:
```json
{"status":"ok","timestamp":"2026-02-03T10:30:00.000Z"}
{"status":"ready"}
```

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

### 2. Approve the Bot

**Option A: Using Database**
```sql
UPDATE bots
SET status = 'approved',
    token = 'wrbt_testtoken123'
WHERE pairing_code = '123456';
```

**Option B: Admin Dashboard (TODO)**
- Navigate to `http://localhost:3000/admin/bots`
- Click "Approve" next to the bot
- Copy the generated token

### 3. Check Status

```bash
curl http://localhost:5001/api/bots/status/123456
```

Response (when approved):
```json
{
  "status": "approved",
  "bot_id": "uuid-here",
  "token": "wrbt_testtoken123",
  "tier": "READ_ONLY",
  "message": "Bot approved. Save this token - it won't be shown again!"
}
```

### 4. Use the Token

```bash
curl -X POST http://localhost:5001/api/ingest \
  -H "Authorization: Bearer wrbt_testtoken123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Document",
    "content": "This is a test document."
  }'
```

## Common Issues

### Error: "DATABASE_URL not set"

Fix: Create `.env` file with valid `DATABASE_URL`

### Error: "relation 'bots' does not exist"

Fix: Run `npm run db:push` to create tables

### Error: "Connection refused"

Fix: Verify database is running and connection string is correct

### Error: "Port 5001 already in use"

Fix: Change `PORT` in `.env` or stop the other process

## Production Checklist

Before deploying to production:

- [ ] Replace in-memory rate limiting with Redis
- [ ] Implement bcrypt token hashing (see `server/utils/crypto.ts` TODOs)
- [ ] Configure CORS whitelist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `SESSION_SECRET`
- [ ] Enable HTTPS
- [ ] Add monitoring (Sentry, DataDog, etc.)
- [ ] Set up database backups
- [ ] Configure firewall rules

## Next Steps

- **Frontend:** Start Next.js frontend with `npm run dev`
- **Admin UI:** Implement bot approval dashboard
- **Discord Integration:** Set up Discord bot webhook
- **Claude MCP:** Publish OpenClaw skill package

## Documentation

- [README](./README.md) - API endpoints and architecture
- [SECURITY_ARCHITECTURE](../../SECURITY_ARCHITECTURE.md) - Security model
- [IMPLEMENTATION_PLAN](../../IMPLEMENTATION_PLAN.md) - Development roadmap
- [TESTING_GUIDE](../../TESTING_GUIDE.md) - Comprehensive test suite

## Support

Questions? Check:
- GitHub Issues
- Security issues: security@citemesh.com (TODO)
- Discord: #wrbt-01 channel (TODO)
