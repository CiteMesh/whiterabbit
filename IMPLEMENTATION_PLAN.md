# WRBT_01 Implementation Plan
## Task Roadmap (Waiting for CODEX Baseline)

**Status:** 🟡 Paused - Waiting for CODEX to complete baseline
**Last Updated:** 2026-02-03

---

## Current Situation

- ✅ **Replit stack reviewed** (Express + Vite + Drizzle + PostgreSQL)
- ✅ **OpenClaw security model studied** (DM pairing, allowlists, tiers)
- ✅ **Clawdbot formal verification patterns reviewed** (TLA+ security claims)
- ✅ **Architecture designed** (see SECURITY_ARCHITECTURE.md)
- ⏸️ **Implementation blocked** - Waiting for CODEX baseline

### Why We're Waiting

You said:
> "i would like to wait until codex is finished its work before we continue to work, so i can push to origin and ensure everyone is working on the same baseline"

**CODEX is building:**
- Repo structure (apps/, packages/, specs/)
- OpenAPI contract (specs/openapi.yaml)
- Next.js frontend skeleton
- SDK package
- Vercel deployment config

**Once CODEX finishes:**
- Push to GitHub origin
- We'll pull the baseline
- Begin implementing security layers

---

## Task List (Prioritized)

### 🟢 Phase 1: Foundation (Do First)

#### Task #3: Sync WRBT_01 with GitHub-connected Replit
**Status:** Pending CODEX completion
**Dependencies:** None
**Estimated Time:** 30 minutes

**Steps:**
1. CODEX pushes baseline to GitHub
2. Pull latest from origin to local WRBT_01
3. Verify Replit is pulling from correct GitHub repo
4. Test bidirectional sync (local → GitHub → Replit)
5. Document sync workflow in README

**Deliverables:**
- Verified git remote configuration
- Updated README with sync instructions

---

#### Task #5: Add contract-first OpenAPI spec with security schemas
**Status:** Pending CODEX completion
**Dependencies:** Task #3 (baseline)
**Estimated Time:** 2 hours

**Steps:**
1. Review CODEX-generated specs/openapi.yaml
2. Add security schemas (bot authentication)
3. Add rate limit definitions
4. Add bot tier definitions
5. Validate spec with Swagger validator

**Deliverables:**
- specs/openapi.yaml with security extensions
- Swagger UI at /api/docs
- Schema validation tests

**Implementation:**
```yaml
# specs/openapi.yaml (additions)
components:
  securitySchemes:
    BotAuth:
      type: apiKey
      in: header
      name: X-Bot-Token
      description: Bot authentication token from pairing flow

    AdminSession:
      type: apiKey
      in: cookie
      name: wrbt_admin_session

  schemas:
    BotRegistration:
      type: object
      required: [name]
      properties:
        name:
          type: string
          minLength: 3
          maxLength: 100
        contact_email:
          type: string
          format: email
        user_agent:
          type: string

    PairingResponse:
      type: object
      properties:
        pairing_code:
          type: string
          pattern: '^[0-9]{6}$'
        status_url:
          type: string
          format: uri
        expires_at:
          type: string
          format: date-time
```

---

### 🟡 Phase 2: Core Security (After Baseline)

#### Task #1: Remove user auth from WRBT_01
**Status:** In Progress
**Dependencies:** Task #3, #5
**Estimated Time:** 3 hours

**Auth Strategy:**
- ✅ **ADMIN**: Passport.js + express-session (for /admin/* only)
- ✅ **BOTS**: X-Bot-ID + X-Bot-Token headers (pairing-approved)
- ✅ **PUBLIC**: No auth for GET endpoints (read-only)

**Implementation Files:**
```
server/
  middleware/
    require-admin.ts       # NEW: Admin session guard
    bot-auth.ts            # NEW: Bot token verification
    public-rate-limit.ts   # NEW: Public endpoint rate limiting
  routes/
    admin/
      auth.ts              # MODIFY: Admin login only
      bots.ts              # NEW: Bot approval dashboard
    bots.ts                # NEW: Bot registration endpoints
```

**Changes:**
1. Create admin-only route guard
2. Add bot authentication middleware
3. Remove user signup/login UI
4. Add bot registration UI (public)
5. Add admin bot approval dashboard

**Deliverables:**
- server/middleware/require-admin.ts
- server/middleware/bot-auth.ts
- server/routes/admin/bots.ts
- server/routes/bots.ts
- Updated server/routes.ts with route guards

---

#### Task #4: Create bot-policy.ts capability framework
**Status:** Pending
**Dependencies:** Task #1 (auth middleware)
**Estimated Time:** 4 hours

**Implementation:**
```typescript
// packages/security/bot-policy.ts

export enum BotTier {
  READ_ONLY = 'READ_ONLY',
  WRITE_LIMITED = 'WRITE_LIMITED',
}

export interface BotCapabilities {
  allowedEndpoints: string[]
  allowedMethods: string[]
  rateLimit: {
    perMinute: number
    perHour: number
  }
}

export const BOT_TIER_CAPABILITIES: Record<BotTier, BotCapabilities> = {
  [BotTier.READ_ONLY]: {
    allowedEndpoints: [
      '/api/documents',
      '/api/documents/:id',
      '/api/documents/:id/chunks',
      '/api/sessions',
      '/api/citations',
    ],
    allowedMethods: ['GET'],
    rateLimit: {
      perMinute: 60,
      perHour: 1000,
    },
  },
  [BotTier.WRITE_LIMITED]: {
    allowedEndpoints: [
      // Inherit READ_ONLY
      ...BOT_TIER_CAPABILITIES[BotTier.READ_ONLY].allowedEndpoints,
      '/api/ingest',
    ],
    allowedMethods: ['GET', 'POST'],
    rateLimit: {
      perMinute: 10,
      perHour: 100,
    },
  },
}

// Middleware
export function enforceBot Capabilities(req, res, next) {
  const bot = req.bot // Set by bot-auth middleware
  const tier = bot.tier as BotTier
  const capabilities = BOT_TIER_CAPABILITIES[tier]

  // Check endpoint allowlist
  const endpoint = req.path
  const method = req.method

  if (!capabilities.allowedMethods.includes(method)) {
    return res.status(403).json({
      error: 'Method not allowed for bot tier',
      tier,
      method,
    })
  }

  if (!matchesAllowedEndpoint(endpoint, capabilities.allowedEndpoints)) {
    return res.status(403).json({
      error: 'Endpoint not allowed for bot tier',
      tier,
      endpoint,
    })
  }

  next()
}
```

**Deliverables:**
- packages/security/bot-policy.ts
- server/middleware/enforce-capabilities.ts
- Unit tests for capability checks

---

#### Task #6: Implement session isolation with Supabase RLS
**Status:** Pending
**Dependencies:** Task #3 (baseline)
**Estimated Time:** 2 hours

**Supabase RLS Policies:**
```sql
-- Enable RLS on all tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Documents: public if is_public=true, else owned by user
CREATE POLICY "Public documents are visible to all"
  ON documents FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can access their own documents"
  ON documents FOR SELECT
  USING (user_id = auth.uid());

-- Chunks inherit document access
CREATE POLICY "Chunks inherit document access"
  ON chunks FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE is_public = true OR user_id = auth.uid()
    )
  );

-- Sessions: only owner can access
CREATE POLICY "Users can only access their own sessions"
  ON sessions FOR SELECT
  USING (user_id = auth.uid());

-- Bots table: admin-only
CREATE POLICY "Only admins can view bots"
  ON bots FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );
```

**Backend Enforcement:**
```typescript
// Additional filters beyond RLS
export async function getDocument(id: string, userId: string) {
  const doc = await db.query.documents.findFirst({
    where: and(
      eq(documents.id, id),
      or(
        eq(documents.is_public, true),
        eq(documents.user_id, userId)
      )
    )
  })

  if (!doc) {
    throw new Error('Document not found or access denied')
  }

  return doc
}
```

**Deliverables:**
- db/migrations/002_add_rls_policies.sql
- Updated server queries with session filtering
- Tests for cross-session access (should fail)

---

#### Task #8: Create security documentation (SECURITY.md + GOVERNANCE.md)
**Status:** Pending
**Dependencies:** Task #1, #4, #6 (implemented patterns)
**Estimated Time:** 2 hours

**SECURITY.md Contents:**
- Threat model
- Security claims (C1-C5)
- Responsible disclosure process
- Contact: security@citemesh.com

**GOVERNANCE.md Contents:**
- Analysis-only posture (no bulk scraping dumps)
- Provenance requirements
- No real user data (synthetic only)
- Bot interaction guidelines
- API terms of service
- Data retention policy

**LICENSE Decision:**
- MIT (most permissive)
- Apache 2.0 (patent protection)
- CC-BY-4.0 (data corpus focus)

**Deliverables:**
- SECURITY.md
- GOVERNANCE.md
- LICENSE file
- CODE_OF_CONDUCT.md

---

### 🔵 Phase 3: Bot Integrations (After Core Security)

#### Task #9: Add Discord bot integration endpoint
**Status:** Pending
**Dependencies:** Task #1, #4
**Estimated Time:** 6 hours

**Discord Webhook Flow:**
1. Discord bot sends POST /api/integrations/discord/webhook
2. Verify Discord signature (DISCORD_PUBLIC_KEY)
3. Check if Discord user is in bot_integrations (allowlist)
4. If not, send pairing code to Discord DM
5. If allowlisted, process command

**Implementation:**
```typescript
// server/routes/integrations/discord.ts

export async function handleDiscordWebhook(req, res) {
  // 1. Verify signature
  const signature = req.headers['x-signature-ed25519']
  const timestamp = req.headers['x-signature-timestamp']

  if (!verifyDiscordSignature(req.rawBody, signature, timestamp)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  // 2. Parse interaction
  const { user, channel_id, data } = req.body

  // 3. Check allowlist
  const integration = await db.query.botIntegrations.findFirst({
    where: and(
      eq(botIntegrations.platform, 'discord'),
      eq(botIntegrations.platform_user_id, user.id),
      eq(botIntegrations.status, 'approved')
    )
  })

  if (!integration) {
    // Send pairing code via DM
    const code = generatePairingCode()
    await sendDiscordDM(user.id, `Your pairing code: ${code}`)

    await db.insert(botIntegrations).values({
      platform: 'discord',
      platform_user_id: user.id,
      platform_username: user.username,
      pairing_code: code,
    })

    return res.json({
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        content: 'Check your DMs for a pairing code. An admin must approve your request.',
      }
    })
  }

  // 4. Process command
  const command = data.options[0].value // e.g., "analyze https://..."
  const result = await processWrbtCommand(command, integration.bot_id)

  return res.json({
    type: 4,
    data: {
      content: result.message,
    }
  })
}
```

**Deliverables:**
- server/routes/integrations/discord.ts
- server/services/discord-bot.ts
- Discord bot commands: /wrbt analyze, /wrbt status, /wrbt cite
- Admin approval UI for Discord integrations

---

#### Task #10: Add Claude bot API integration endpoint
**Status:** Pending
**Dependencies:** Task #1, #4
**Estimated Time:** 6 hours

**MCP Protocol Implementation:**
```typescript
// server/routes/integrations/claude.ts

export async function handleMcpRequest(req, res) {
  const { method, params } = req.body

  // Authenticate bot
  const botToken = req.headers['x-bot-token']
  const bot = await verifyBotToken(botToken)

  if (!bot) {
    return res.status(401).json({
      error: { code: -32600, message: 'Invalid bot token' }
    })
  }

  // Route to MCP handler
  switch (method) {
    case 'tools/list':
      return res.json({
        tools: [
          {
            name: 'wrbt_analyze',
            description: 'Analyze a document with WRBT_01',
            inputSchema: {
              type: 'object',
              properties: {
                content: { type: 'string' },
                title: { type: 'string' }
              },
              required: ['content']
            }
          },
          // ... more tools
        ]
      })

    case 'tools/call':
      const { name, arguments: args } = params
      const result = await executeMcpTool(name, args, bot)
      return res.json({
        content: [{ type: 'text', text: result }]
      })

    default:
      return res.status(400).json({
        error: { code: -32601, message: 'Method not found' }
      })
  }
}
```

**OpenClaw Skill Package:**
```json
// openclaw-skill-wrbt/package.json
{
  "name": "wrbt",
  "version": "1.0.0",
  "description": "WRBT_01 document analysis for OpenClaw",
  "main": "dist/index.js",
  "openclaw": {
    "tools": [
      {
        "name": "wrbt_analyze",
        "endpoint": "https://wrbt.example.com/api/integrations/claude/mcp"
      }
    ]
  }
}
```

**Deliverables:**
- server/routes/integrations/claude.ts
- server/services/mcp-handler.ts
- shared/types/mcp.ts
- openclaw-skill-wrbt/ package (publish to ClawHub)

---

#### Task #7: Add structured data markup for bot discovery
**Status:** Pending
**Dependencies:** Task #3 (baseline)
**Estimated Time:** 3 hours

**Schema.org Markup:**
```html
<!-- In Next.js pages -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "WRBT Document Analysis",
  "description": "Public document analysis with citations and evidence tracking",
  "url": "https://wrbt.example.com",
  "creator": {
    "@type": "Organization",
    "name": "CiteMesh"
  },
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "distribution": {
    "@type": "DataDownload",
    "encodingFormat": "application/json",
    "contentUrl": "https://wrbt.example.com/api/documents"
  }
}
</script>
```

**Bot Discovery Files:**
```
# robots.txt
User-agent: *
Allow: /
Crawl-delay: 1

User-agent: GPTBot
Allow: /api/*

User-agent: Claude-Web
Allow: /api/*

Sitemap: https://wrbt.example.com/sitemap.xml
```

```xml
<!-- sitemap.xml -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://wrbt.example.com/api/documents</loc>
    <changefreq>hourly</changefreq>
  </url>
  <!-- Dynamic entries for each document -->
</urlset>
```

**Deliverables:**
- robots.txt with bot-friendly rules
- sitemap.xml generator
- Schema.org markup in all pages
- OpenAPI spec at /.well-known/openapi.yaml

---

### 🟣 Phase 4: Optimization & Launch

#### Task #2: Design bot-friendly scraper/crawler architecture
**Status:** Pending
**Dependencies:** All previous tasks
**Estimated Time:** 4 hours

**Enhancements:**
- GraphQL endpoint (alternative to REST)
- Bulk export API (/api/export/documents.jsonl)
- Webhook subscriptions (notify on new documents)
- RSS/Atom feed
- Embedding API (/api/embed for iframe)

**Deliverables:**
- server/routes/graphql.ts
- server/routes/export.ts
- server/routes/webhooks.ts
- RSS feed generator
- Embedding widget

---

## Summary Statistics

**Total Tasks:** 10
- **Phase 1 (Foundation):** 2 tasks, ~2.5 hours
- **Phase 2 (Core Security):** 4 tasks, ~11 hours
- **Phase 3 (Bot Integrations):** 3 tasks, ~15 hours
- **Phase 4 (Optimization):** 1 task, ~4 hours

**Estimated Total Time:** ~32.5 hours

**Current Status:**
- ✅ Planning complete
- ✅ Architecture designed
- ⏸️ **Blocked:** Waiting for CODEX baseline

---

## Next Steps (When CODEX Finishes)

1. **Review CODEX output**
   - Verify repo structure matches expectations
   - Check OpenAPI spec quality
   - Test frontend skeleton

2. **Push to GitHub**
   - CODEX pushes baseline
   - We pull to local
   - Verify sync

3. **Begin Phase 2**
   - Start with Task #1 (auth refactor)
   - Then Task #4 (bot policy)
   - Then Task #6 (RLS)
   - Then Task #8 (docs)

4. **Phase 3 Integration**
   - Discord bot (Task #9)
   - Claude MCP (Task #10)
   - Bot discovery (Task #7)

5. **Launch**
   - Deploy to Vercel
   - Publish OpenClaw skill
   - Write integration guides
   - Announce on Discord

---

## Questions for Review

1. **Auth Strategy:** Approve admin-only + bot pairing approach?
2. **Bot Tiers:** Are READ_ONLY and WRITE_LIMITED sufficient?
3. **Discord Integration:** Should we build the Discord bot, or just provide webhook endpoint?
4. **OpenClaw Skill:** Should we publish to ClawHub immediately or wait for v1.0?
5. **Formal Verification:** Should we add TLA+ specs like Clawdbot, or skip for now?

---

**Document Status:** 🟢 Ready for Review
**Author:** Claude Sonnet 4.5
**Last Updated:** 2026-02-03
