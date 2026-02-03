# @wrbt/api

Express.js backend for WRBT_01 with OpenClaw-inspired bot authentication.

## Quick Start

```bash
# Install dependencies (from monorepo root)
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Push database schema
npm run db:push --workspace=@wrbt/api

# Seed database
npm run seed --workspace=@wrbt/api

# Start development server
npm run dev:api
```

## API Endpoints

### Health & Status
- `GET /api/healthz` - Basic health check
- `GET /api/readyz` - Database health check

### Public (No Auth Required)
- `GET /api/documents` - List public documents
- `GET /api/documents/:id` - Get document details
- `GET /api/documents/:id/chunks` - Get document chunks
- `GET /api/documents/:id/status` - Get processing status

### Bot Registration (Public, Rate-Limited)
- `POST /api/bots/register` - Register bot (get pairing code)
- `GET /api/bots/status/:code` - Check approval status

### Bot-Authenticated (Requires Token)
- `POST /api/ingest` - Ingest new document

## Bot Authentication Flow

1. **Register:** `POST /api/bots/register` with `{name, contact_email}`
2. **Receive:** Pairing code (6 digits, expires in 1 hour)
3. **Wait:** Admin approves via dashboard
4. **Poll:** `GET /api/bots/status/:code` until `status: "approved"`
5. **Receive:** API token (shown once!)
6. **Use:** `Authorization: Bearer <token>` on all requests

## Database Schema

See `shared/schema.ts` for full schema:
- `users` - Admin authentication
- `bots` - Bot registration & tokens
- `bot_requests` - Audit logging
- `documents` - Document storage
- `chunks` - Document chunks
- `embeddings` - Vector embeddings (placeholder)
- `document_jobs` - Processing status
- `bot_integrations` - Platform integrations (Discord, etc.)

## Security Features

### ✅ Implemented
- Bot pairing-code registration
- API key authentication (Bearer tokens)
- Rate limiting (in-memory)
- Audit logging
- Public read-only access
- Admin approval workflow

### ⏸️ TODO (Production)
- bcrypt token hashing (currently plain text)
- Redis rate limiting (currently in-memory)
- CORS configuration
- HTTPS enforcement
- Admin UI

## Environment Variables

See `.env.example` for all available configuration options.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string

**Optional:**
- `PORT` - Server port (default: 5001)
- `SESSION_SECRET` - Session encryption key
- `NODE_ENV` - Environment (development|production)

## Testing

```bash
# Run type checking
npm run check --workspace=@wrbt/api

# Test health endpoint
curl http://localhost:5001/api/healthz

# Register a bot
curl -X POST http://localhost:5001/api/bots/register \
  -H "Content-Type: application/json" \
  -d '{"name":"TestBot","contact_email":"test@example.com"}'

# Check status
curl http://localhost:5001/api/bots/status/123456
```

See `../../TESTING_GUIDE.md` for full test suite.

## Architecture

```
server/
├── index.ts              # Express app entry point
├── db.ts                 # Database connection
├── storage.ts            # Drizzle ORM queries
├── routes.ts             # Main API routes
├── middleware/
│   └── bot-auth.ts       # Authentication + rate limiting
├── routes/
│   └── bots.ts           # Bot registration endpoints
└── utils/
    └── crypto.ts         # Pairing codes, API keys

shared/
└── schema.ts             # Drizzle schema (8 tables)

script/
└── seed-db.ts            # Database seeding
```

## Related Packages

- `@wrbt/types` - Shared TypeScript types
- `apps/wrbt-web` - Next.js frontend

## Documentation

- `../../SECURITY_ARCHITECTURE.md` - Complete security model
- `../../IMPLEMENTATION_PLAN.md` - Task roadmap
- `../../INTEGRATION_PLAN.md` - Integration guide
