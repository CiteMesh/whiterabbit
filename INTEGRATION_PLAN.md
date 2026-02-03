# WRBT_01 Integration Plan
## Replit Draft → Production Backend

**Date:** 2026-02-03
**Status:** Ready for Implementation

---

## Current State Summary

### What Exists (Replit Draft)

```
/Users/graemeauchterlonie/Downloads/WRBT01/
├── client/              ✅ React 19 + Vite + Wouter SPA
│   ├── Radix UI         ✅ Full component suite
│   └── TanStack Query   ✅ Data fetching ready
├── server/
│   ├── index.ts         ✅ Express + Vite middleware
│   ├── routes.ts        ❌ EMPTY (implement API here)
│   ├── storage.ts       🟡 In-memory stub (replace with Drizzle)
│   ├── schema.ts        ✅ Mock tables + seed data
│   └── static.ts        ✅ Production static serving
└── package.json         ✅ All deps installed
```

### What's Missing (Need to Implement)

1. ❌ **Real API endpoints** (routes.ts is empty)
2. ❌ **Database connection** (storage.ts is in-memory)
3. ❌ **Bot authentication** (only passport-local scaffolded)
4. ❌ **OpenAPI spec** (no contract defined)
5. ❌ **RLS policies** (no Supabase/Postgres configured)

---

## Integration Strategy

### Phase 1: Port Mock Schema → Real Database

**Goal:** Convert schema.ts mock tables to Drizzle + Postgres

#### Step 1.1: Extract Schema from Mock

**Current Mock (schema.ts):**
```typescript
const documents = [
  { id: 1, title: "Sample Doc", content: "...", user_id: 1, created_at: "..." }
]

const chunks = [
  { id: 1, document_id: 1, content: "...", position: 0 }
]

const document_jobs = [
  { id: 1, document_id: 1, status: "processing", created_at: "..." }
]
```

**Convert to Drizzle Schema:**
```typescript
// server/db/schema.ts
import { pgTable, uuid, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: text('role').notNull().default('user'), // 'admin' | 'user'
  created_at: timestamp('created_at').notNull().defaultNow(),
})

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content'),
  user_id: uuid('user_id').references(() => users.id),
  is_public: boolean('is_public').notNull().default(false),
  metadata: jsonb('metadata'), // { byte_size, content_type, etc. }
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

export const chunks = pgTable('chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  document_id: uuid('document_id').references(() => documents.id).notNull(),
  content: text('content').notNull(),
  position: integer('position').notNull(),
  metadata: jsonb('metadata'), // { tokens, char_count, etc. }
  created_at: timestamp('created_at').notNull().defaultNow(),
})

export const embeddings = pgTable('embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  chunk_id: uuid('chunk_id').references(() => chunks.id).notNull(),
  vector: text('vector').notNull(), // pgvector type in real deployment
  model: text('model').notNull().default('text-embedding-3-small'),
  created_at: timestamp('created_at').notNull().defaultNow(),
})

export const document_jobs = pgTable('document_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  document_id: uuid('document_id').references(() => documents.id).notNull(),
  status: text('status').notNull().default('queued'), // queued | processing | done | failed
  error_message: text('error_message'),
  progress: integer('progress').default(0), // 0-100
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

// NEW: Bot tables for our security model
export const bots = pgTable('bots', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  contact_email: text('contact_email'),
  token: text('token').notNull().unique(), // API key (hashed)
  tier: text('tier').notNull().default('READ_ONLY'), // READ_ONLY | WRITE_LIMITED
  status: text('status').notNull().default('pending'), // pending | approved | revoked
  pairing_code: text('pairing_code').unique(),
  pairing_expires_at: timestamp('pairing_expires_at'),
  approved_at: timestamp('approved_at'),
  approved_by: uuid('approved_by').references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
})

export const bot_requests = pgTable('bot_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  bot_id: uuid('bot_id').references(() => bots.id).notNull(),
  endpoint: text('endpoint').notNull(),
  method: text('method').notNull(),
  status_code: integer('status_code'),
  ip_address: text('ip_address'),
  created_at: timestamp('created_at').notNull().defaultNow(),
})
```

#### Step 1.2: Create Migration

```bash
# In Replit backend
npm run db:push
# Or create migration:
# npx drizzle-kit generate:pg
```

#### Step 1.3: Seed Database

```typescript
// server/db/seed.ts
import { db } from './index'
import { users, documents, chunks } from './schema'
import bcrypt from 'bcrypt'

async function seed() {
  // Create admin user
  const [admin] = await db.insert(users).values({
    email: 'admin@wrbt.example.com',
    password_hash: await bcrypt.hash('admin123', 10),
    role: 'admin',
  }).returning()

  // Create sample document
  const [doc] = await db.insert(documents).values({
    title: 'Sample Document',
    content: 'This is a sample document for testing...',
    user_id: admin.id,
    is_public: true,
  }).returning()

  // Create chunks
  await db.insert(chunks).values([
    { document_id: doc.id, content: 'Chunk 1', position: 0 },
    { document_id: doc.id, content: 'Chunk 2', position: 1 },
  ])

  console.log('✅ Database seeded')
}

seed()
```

---

### Phase 2: Implement API Endpoints (routes.ts)

**Goal:** Implement the API contract defined in our OpenAPI spec

#### Step 2.1: Health Endpoints

```typescript
// server/routes.ts
import { Router } from 'express'
import { storage } from './storage'

export async function registerRoutes(httpServer, app) {
  const api = Router()

  // Health check
  api.get('/healthz', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  api.get('/readyz', async (req, res) => {
    try {
      await storage.healthCheck() // Ping database
      res.json({ status: 'ready' })
    } catch (err) {
      res.status(503).json({ status: 'not ready', error: err.message })
    }
  })

  // Mount API router
  app.use('/api', api)

  return httpServer
}
```

#### Step 2.2: Document Endpoints (Public Read-Only)

```typescript
// server/routes.ts (continued)

// GET /api/documents
api.get('/documents', async (req, res) => {
  const { limit = 10, offset = 0 } = req.query

  const docs = await storage.getPublicDocuments({
    limit: parseInt(limit),
    offset: parseInt(offset)
  })

  res.json({ documents: docs })
})

// GET /api/documents/:id
api.get('/documents/:id', async (req, res) => {
  const doc = await storage.getDocumentById(req.params.id)

  if (!doc || !doc.is_public) {
    return res.status(404).json({ error: 'Document not found' })
  }

  res.json(doc)
})

// GET /api/documents/:id/chunks
api.get('/documents/:id/chunks', async (req, res) => {
  const chunks = await storage.getChunksByDocumentId(req.params.id)
  res.json({ chunks })
})

// GET /api/documents/:id/status
api.get('/documents/:id/status', async (req, res) => {
  const job = await storage.getLatestJobByDocumentId(req.params.id)

  if (!job) {
    return res.status(404).json({ error: 'No job found' })
  }

  res.json({
    status: job.status,
    progress: job.progress,
    error: job.error_message,
    updated_at: job.updated_at
  })
})
```

#### Step 2.3: Ingest Endpoint (Bot-Authenticated)

```typescript
// server/routes.ts (continued)

import { botAuth } from './middleware/bot-auth'

// POST /api/ingest (requires bot token)
api.post('/ingest', botAuth, async (req, res) => {
  const { content, title } = req.body

  // Validate
  if (!content) {
    return res.status(400).json({ error: 'Content required' })
  }

  // Create document
  const doc = await storage.createDocument({
    title: title || 'Untitled',
    content,
    user_id: req.bot.id, // Associate with bot
    is_public: true, // Bot uploads are public
  })

  // Create job
  const job = await storage.createDocumentJob({
    document_id: doc.id,
    status: 'queued',
  })

  // TODO: Trigger background processing

  res.json({
    document_id: doc.id,
    job_id: job.id,
    status: 'queued'
  })
})
```

#### Step 2.4: Bot Registration Endpoints

```typescript
// server/routes/bots.ts

import { Router } from 'express'
import { generatePairingCode, generateApiKey } from '../utils/crypto'

const router = Router()

// POST /api/bots/register
router.post('/register', async (req, res) => {
  const { name, contact_email } = req.body

  if (!name || name.length < 3) {
    return res.status(400).json({ error: 'Name must be at least 3 characters' })
  }

  const pairingCode = generatePairingCode() // "123456"
  const expiresAt = new Date(Date.now() + 3600000) // 1 hour

  const bot = await storage.createBot({
    name,
    contact_email,
    pairing_code: pairingCode,
    pairing_expires_at: expiresAt,
    status: 'pending',
    tier: 'READ_ONLY', // Default tier
  })

  res.json({
    pairing_code: pairingCode,
    status_url: `/api/bots/status/${pairingCode}`,
    expires_at: expiresAt,
    message: 'Pairing code generated. Admin approval required.'
  })
})

// GET /api/bots/status/:code
router.get('/status/:code', async (req, res) => {
  const bot = await storage.getBotByPairingCode(req.params.code)

  if (!bot) {
    return res.status(404).json({ error: 'Invalid pairing code' })
  }

  if (new Date() > bot.pairing_expires_at) {
    return res.status(410).json({ error: 'Pairing code expired' })
  }

  if (bot.status === 'approved') {
    // Only return token ONCE when first polled after approval
    const token = bot.token || generateApiKey()

    if (!bot.token) {
      await storage.updateBot(bot.id, { token })
    }

    return res.json({
      status: 'approved',
      bot_id: bot.id,
      token, // IMPORTANT: Only shown once!
      tier: bot.tier,
      message: 'Bot approved! Save this token - it will not be shown again.'
    })
  }

  res.json({
    status: bot.status, // 'pending' | 'revoked'
    message: bot.status === 'pending'
      ? 'Awaiting admin approval'
      : 'Bot registration was revoked'
  })
})

export default router
```

#### Step 2.5: Admin Approval Endpoints

```typescript
// server/routes/admin/bots.ts

import { Router } from 'express'
import { requireAdmin } from '../../middleware/require-admin'

const router = Router()

// All admin routes require session auth
router.use(requireAdmin)

// GET /admin/bots/pending
router.get('/pending', async (req, res) => {
  const bots = await storage.getBotsByStatus('pending')

  res.json({
    bots: bots.map(b => ({
      id: b.id,
      name: b.name,
      contact_email: b.contact_email,
      pairing_code: b.pairing_code,
      requested_at: b.created_at,
      expires_at: b.pairing_expires_at,
    }))
  })
})

// POST /admin/bots/approve/:code
router.post('/approve/:code', async (req, res) => {
  const { tier = 'READ_ONLY' } = req.body

  const bot = await storage.getBotByPairingCode(req.params.code)

  if (!bot) {
    return res.status(404).json({ error: 'Invalid pairing code' })
  }

  await storage.updateBot(bot.id, {
    status: 'approved',
    tier,
    approved_by: req.user.id, // From session
    approved_at: new Date(),
  })

  res.json({ message: 'Bot approved successfully', bot_id: bot.id })
})

// POST /admin/bots/revoke/:id
router.post('/revoke/:id', async (req, res) => {
  await storage.updateBot(req.params.id, {
    status: 'revoked',
  })

  res.json({ message: 'Bot access revoked' })
})

// GET /admin/bots/:id/requests
router.get('/:id/requests', async (req, res) => {
  const requests = await storage.getBotRequests(req.params.id, {
    limit: 100,
    offset: 0
  })

  res.json({ requests })
})

export default router
```

---

### Phase 3: Implement Authentication Middleware

#### Step 3.1: Bot Auth Middleware

```typescript
// server/middleware/bot-auth.ts

import { storage } from '../storage'
import bcrypt from 'bcrypt'

export async function botAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing bot token',
      message: 'Include Authorization: Bearer <token> header'
    })
  }

  const token = authHeader.slice(7)

  // Find bot by token (hashed comparison)
  const bot = await storage.getBotByToken(token)

  if (!bot) {
    // Log failed attempt
    await storage.logBotRequest({
      bot_id: null,
      endpoint: req.path,
      method: req.method,
      status_code: 403,
      ip_address: req.ip,
    })

    return res.status(403).json({
      error: 'Invalid bot token',
      message: 'Token not recognized or revoked'
    })
  }

  if (bot.status !== 'approved') {
    return res.status(403).json({
      error: 'Bot not approved',
      status: bot.status
    })
  }

  // Attach bot to request
  req.bot = bot

  // Log request
  res.on('finish', () => {
    storage.logBotRequest({
      bot_id: bot.id,
      endpoint: req.path,
      method: req.method,
      status_code: res.statusCode,
      ip_address: req.ip,
    })
  })

  next()
}
```

#### Step 3.2: Admin Auth Middleware

```typescript
// server/middleware/require-admin.ts

export function requireAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: 'Not authenticated',
      redirect: '/admin/login'
    })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required'
    })
  }

  next()
}
```

---

### Phase 4: Update Storage Layer

**Replace in-memory storage with Drizzle queries:**

```typescript
// server/storage.ts

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { users, bots, documents, chunks, bot_requests } from './db/schema'
import { eq, and, or } from 'drizzle-orm'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool)

export const storage = {
  // Health check
  async healthCheck() {
    await db.select().from(users).limit(1)
  },

  // Bot methods
  async createBot(data) {
    const [bot] = await db.insert(bots).values(data).returning()
    return bot
  },

  async getBotByPairingCode(code) {
    return await db.query.bots.findFirst({
      where: eq(bots.pairing_code, code)
    })
  },

  async getBotByToken(token) {
    // In production, hash comparison
    return await db.query.bots.findFirst({
      where: and(
        eq(bots.token, token),
        eq(bots.status, 'approved')
      )
    })
  },

  async updateBot(id, data) {
    await db.update(bots).set(data).where(eq(bots.id, id))
  },

  async getBotsByStatus(status) {
    return await db.query.bots.findMany({
      where: eq(bots.status, status),
      orderBy: (bots, { desc }) => [desc(bots.created_at)]
    })
  },

  async logBotRequest(data) {
    await db.insert(bot_requests).values(data)
  },

  async getBotRequests(botId, { limit, offset }) {
    return await db.query.bot_requests.findMany({
      where: eq(bot_requests.bot_id, botId),
      limit,
      offset,
      orderBy: (bot_requests, { desc }) => [desc(bot_requests.created_at)]
    })
  },

  // Document methods
  async getPublicDocuments({ limit, offset }) {
    return await db.query.documents.findMany({
      where: eq(documents.is_public, true),
      limit,
      offset,
      orderBy: (documents, { desc }) => [desc(documents.created_at)]
    })
  },

  async getDocumentById(id) {
    return await db.query.documents.findFirst({
      where: eq(documents.id, id)
    })
  },

  async createDocument(data) {
    const [doc] = await db.insert(documents).values(data).returning()
    return doc
  },

  // Chunk methods
  async getChunksByDocumentId(documentId) {
    return await db.query.chunks.findMany({
      where: eq(chunks.document_id, documentId),
      orderBy: (chunks, { asc }) => [asc(chunks.position)]
    })
  },

  // User methods (for passport)
  async getUserByEmail(email) {
    return await db.query.users.findFirst({
      where: eq(users.email, email)
    })
  },

  async getUserById(id) {
    return await db.query.users.findFirst({
      where: eq(users.id, id)
    })
  },
}
```

---

## Implementation Checklist

### ✅ Phase 1: Database Setup
- [ ] Create `server/db/schema.ts` with Drizzle tables
- [ ] Run `npm run db:push` to create tables
- [ ] Create `server/db/seed.ts` and run it
- [ ] Verify tables exist in Postgres

### ✅ Phase 2: API Endpoints
- [ ] Implement health endpoints (/healthz, /readyz)
- [ ] Implement public document endpoints (GET /api/documents)
- [ ] Implement bot registration (POST /api/bots/register)
- [ ] Implement status polling (GET /api/bots/status/:code)
- [ ] Implement ingest endpoint (POST /api/ingest)
- [ ] Implement admin approval endpoints

### ✅ Phase 3: Authentication
- [ ] Create `server/middleware/bot-auth.ts`
- [ ] Create `server/middleware/require-admin.ts`
- [ ] Update passport-local config to use real DB
- [ ] Add route guards in `server/routes.ts`

### ✅ Phase 4: Storage Layer
- [ ] Replace in-memory storage with Drizzle queries
- [ ] Add connection pooling
- [ ] Add error handling
- [ ] Add request logging

### ✅ Phase 5: Frontend
- [ ] Create admin login page (use existing passport UI)
- [ ] Create admin bot approval dashboard
- [ ] Create public bot registration form
- [ ] Add API status display

### ✅ Phase 6: Testing
- [ ] Test bot registration flow end-to-end
- [ ] Test admin approval flow
- [ ] Test bot API access with token
- [ ] Test rate limiting
- [ ] Test public read-only access

---

## Environment Variables

```bash
# .env
DATABASE_URL=postgresql://user:pass@host:5432/wrbt_db
SESSION_SECRET=your-secret-here-change-in-prod
PORT=5000
NODE_ENV=development

# Production
DATABASE_URL=postgresql://...  # Supabase connection string
SESSION_SECRET=... # Strong random secret
```

---

## Next Steps

1. **Review this plan** and approve approach
2. **Set up Postgres** (local or Supabase)
3. **Run Phase 1** (database setup)
4. **Implement Phase 2** (API endpoints)
5. **Test end-to-end** (registration → approval → API access)

---

**Status:** Ready for Implementation
**Estimated Time:** 8-12 hours
**Author:** Claude Sonnet 4.5
