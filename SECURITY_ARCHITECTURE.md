# WRBT_01 Security Architecture
## OpenClaw-Inspired Bot-Friendly Design

**Version:** 0.1
**Date:** 2026-02-03
**Status:** Design Phase (Waiting for CODEX baseline)

---

## Table of Contents

1. [Overview](#overview)
2. [Security Model](#security-model)
3. [Authentication Flows](#authentication-flows)
4. [Bot Integration Patterns](#bot-integration-patterns)
5. [Implementation Roadmap](#implementation-roadmap)
6. [References](#references)

---

## Overview

WRBT_01 is a **bot-friendly document analysis platform** designed to encourage AI agent interactions while maintaining security through:

- **Tiered Trust**: Admin → Approved Bots → Public (read-only)
- **Explicit Consent**: Pairing codes for bot registration (inspired by OpenClaw)
- **Capability Restrictions**: Read-only vs write access tiers
- **Session Isolation**: RLS policies prevent cross-session data leakage
- **Multi-Platform Support**: Discord, Claude API, HTTP REST

### Design Principles

1. **Bot-First**: Treat bots as primary users, not adversaries
2. **Secure by Default**: Public read-only, explicit approval for writes
3. **OpenClaw Compatibility**: Support OpenClaw skills and MCP protocol
4. **Zero-Trust Public**: Any public data is safe to expose (no secrets in responses)

---

## Security Model

### Threat Model

**What We Protect Against:**
- ✅ Unauthorized writes (POST/PUT/DELETE)
- ✅ Cross-session data leakage
- ✅ Rate limit abuse / DoS
- ✅ Malicious bot registration spam

**What We Don't Protect Against:**
- ❌ Public data scraping (this is encouraged!)
- ❌ Prompt injection on public content
- ❌ Bot training on public data (explicitly allowed)

### Trust Hierarchy

```
┌─────────────────────────────────────┐
│  ADMIN (Human)                      │
│  - Full access to /admin/*          │
│  - Approve/revoke bot registrations │
│  - View analytics and logs          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  APPROVED BOTS                      │
│  - Read + Write (tier-dependent)    │
│  - Rate-limited per tier            │
│  - Audit logged                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  PUBLIC (Crawlers, LLMs)            │
│  - Read-only GET endpoints          │
│  - Strict rate limits               │
│  - No authentication required       │
└─────────────────────────────────────┘
```

### Security Layers (Defense-in-Depth)

| Layer | Mechanism | Implementation |
|-------|-----------|----------------|
| **1. Ingress Gating** | Rate limiting by IP | Express middleware + Redis |
| **2. Authentication** | Bot pairing codes | X-Bot-ID + X-Bot-Token headers |
| **3. Authorization** | Tier-based capabilities | Bot tier → endpoint allowlist |
| **4. Isolation** | Session-scoped data | Supabase RLS policies |
| **5. Audit** | Request logging | bot_requests table |

---

## Authentication Flows

### 1. Admin Authentication (Passport.js)

**Route:** `/admin/login`

```
Admin → POST /admin/login {email, password} →
Passport.js verifies credentials →
express-session stores admin session →
Admin redirected to /admin/dashboard
```

**Session Management:**
- express-session + memorystore (dev) or connect-pg-simple (prod)
- Session cookie: `wrbt_admin_session`
- Expires: 7 days of inactivity

### 2. Bot Registration (Pairing Flow)

**Inspired by:** [OpenClaw DM Pairing](https://docs.openclaw.ai/gateway/security)

```
┌─────────────────────────────────────────────────────────────┐
│  1. Bot sends POST /api/bots/register                       │
│     Body: { name, contact_email, user_agent }               │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. System generates 6-digit pairing code                   │
│     - Expires in 1 hour                                     │
│     - Max 3 pending codes per IP                            │
│     - Returns: { pairing_code, status_url }                 │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Bot polls GET /api/bots/status/:code                    │
│     - Returns: { status: "pending" | "approved" | "revoked" }│
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Admin views /admin/bots/pending                         │
│     - Sees: name, email, user_agent, request time           │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Admin clicks "Approve" with tier selection              │
│     POST /admin/bots/approve/:code { tier: "READ_ONLY" }    │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Bot polls status again, receives:                       │
│     { status: "approved", bot_id: "uuid", token: "secret" } │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│  7. Bot stores credentials and uses for all requests:       │
│     Headers: X-Bot-ID, X-Bot-Token                          │
└─────────────────────────────────────────────────────────────┘
```

### 3. Public Access (No Auth)

**Routes:** All `GET /api/*` endpoints

```
Public user/bot → GET /api/documents →
No authentication required →
Returns public data (no sensitive info)
```

---

## Bot Integration Patterns

### Pattern 1: Direct HTTP API

**Use Case:** Generic bots, scrapers, LLMs

```bash
# 1. Register
curl -X POST https://wrbt.example.com/api/bots/register \
  -H "Content-Type: application/json" \
  -d '{"name": "MyBot", "contact_email": "bot@example.com"}'
# Returns: { pairing_code: "123456", status_url: "..." }

# 2. Check status (poll every 10s)
curl https://wrbt.example.com/api/bots/status/123456
# Returns: { status: "pending" } → { status: "approved", bot_id: "...", token: "..." }

# 3. Use API
curl -X GET https://wrbt.example.com/api/documents \
  -H "X-Bot-ID: uuid" \
  -H "X-Bot-Token: secret"
```

### Pattern 2: Discord Bot

**Use Case:** Discord server integration

```javascript
// Discord bot receives message
client.on('messageCreate', async (message) => {
  if (message.content.startsWith('/wrbt')) {
    const command = message.content.slice(6).trim()

    // Call WRBT_01 API
    const response = await fetch('https://wrbt.example.com/api/integrations/discord/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Discord-Signature': signature,
      },
      body: JSON.stringify({
        user_id: message.author.id,
        channel_id: message.channel.id,
        content: command,
      })
    })

    const data = await response.json()
    message.reply(data.response)
  }
})
```

**Security:**
- Verify Discord signature on all webhooks
- DM pairing: first message from new user requires admin approval
- Rate limit: 10 req/min per Discord user

### Pattern 3: Claude Bot (MCP Protocol)

**Use Case:** OpenClaw skills, Claude Code tools

```typescript
// MCP tool definition
export const wrbtTools = {
  wrbt_analyze: {
    description: "Analyze a document with WRBT_01",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Document text or URL" },
        title: { type: "string", description: "Optional title" }
      },
      required: ["content"]
    }
  }
}

// Tool execution
async function callWrbtAnalyze(args) {
  const response = await fetch('https://wrbt.example.com/api/integrations/claude/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Bot-Token': process.env.WRBT_BOT_TOKEN
    },
    body: JSON.stringify({
      method: 'tools/call',
      params: {
        name: 'wrbt_analyze',
        arguments: args
      }
    })
  })

  return await response.json()
}
```

**OpenClaw Skill Installation:**
```bash
openclaw skills install wrbt
# Prompts for pairing code or API token
# Registers as bot with WRBT_01
```

---

## Implementation Roadmap

### Phase 1: Foundation (Do First, Wait for CODEX)
- [ ] **Task #3**: Sync WRBT_01 with GitHub-connected Replit
- [ ] **Task #5**: Add contract-first OpenAPI spec with security schemas
- [ ] Verify Replit backend is stable baseline
- [ ] Push to GitHub origin

### Phase 2: Core Security (After CODEX Baseline)
- [ ] **Task #1**: Keep admin auth, remove user auth, add bot pairing
- [ ] **Task #4**: Create bot-policy.ts capability framework
- [ ] **Task #6**: Implement session isolation with Supabase RLS
- [ ] **Task #8**: Create security documentation (SECURITY.md + GOVERNANCE.md)

### Phase 3: Bot Integrations
- [ ] **Task #9**: Add Discord bot integration endpoint
- [ ] **Task #10**: Add Claude bot API integration endpoint
- [ ] **Task #7**: Add structured data markup for bot discovery

### Phase 4: Optimization & Launch
- [ ] **Task #2**: Design bot-friendly scraper/crawler architecture
- [ ] Deploy to production
- [ ] Publish OpenClaw skill to ClawHub
- [ ] Write bot integration guides

---

## Database Schema

### Bots Table

```sql
CREATE TABLE bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  user_agent TEXT,
  token TEXT UNIQUE NOT NULL, -- API key (bcrypt hashed)
  tier TEXT DEFAULT 'READ_ONLY', -- READ_ONLY | WRITE_LIMITED
  status TEXT DEFAULT 'pending', -- pending | approved | revoked
  pairing_code TEXT UNIQUE, -- 6-digit code
  pairing_expires_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  revoked_at TIMESTAMP,
  revoked_reason TEXT,
  metadata JSONB, -- { platform: "discord", discord_user_id: "..." }
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bots_pairing_code ON bots(pairing_code) WHERE status = 'pending';
CREATE INDEX idx_bots_token ON bots(token) WHERE status = 'approved';
```

### Bot Requests (Audit Log)

```sql
CREATE TABLE bot_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES bots(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  request_body JSONB,
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bot_requests_bot_id ON bot_requests(bot_id, created_at DESC);
CREATE INDEX idx_bot_requests_created_at ON bot_requests(created_at DESC);
```

### Bot Integrations (Platform-Specific)

```sql
CREATE TABLE bot_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES bots(id),
  platform TEXT NOT NULL, -- discord | slack | telegram | claude
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  status TEXT DEFAULT 'pending', -- pending | approved | revoked
  pairing_code TEXT,
  approved_at TIMESTAMP,
  metadata JSONB, -- { server_id, channel_id, etc. }
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform, platform_user_id)
);
```

---

## API Endpoints

### Public Endpoints (No Auth)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/api/documents` | List public documents | 100/min |
| GET | `/api/documents/:id` | Get document details | 100/min |
| GET | `/api/documents/:id/chunks` | Get document chunks | 100/min |
| GET | `/api/sessions` | List public sessions | 100/min |
| GET | `/api/citations` | Search citations | 100/min |
| GET | `/schema-report` | API introspection | 10/min |

### Bot Registration Endpoints (No Auth)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/bots/register` | Request pairing code | 3/hour per IP |
| GET | `/api/bots/status/:code` | Check approval status | 60/hour |

### Bot-Authenticated Endpoints

| Method | Endpoint | Tier Required | Rate Limit |
|--------|----------|---------------|------------|
| POST | `/api/ingest` | WRITE_LIMITED | 10/min |
| GET | `/api/bots/me` | Any | 60/min |

### Admin Endpoints (Session Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Analytics overview |
| GET | `/admin/bots/pending` | View pending bot registrations |
| POST | `/admin/bots/approve/:code` | Approve bot registration |
| POST | `/admin/bots/revoke/:id` | Revoke bot access |
| GET | `/admin/bots/:id/requests` | View bot request history |

### Integration Endpoints (Platform-Specific Auth)

| Method | Endpoint | Auth Method | Description |
|--------|----------|-------------|-------------|
| POST | `/api/integrations/discord/webhook` | Discord signature | Discord bot webhook |
| POST | `/api/integrations/claude/mcp` | X-Bot-Token | MCP protocol endpoint |

---

## Bot Capability Tiers

### READ_ONLY (Default)

**Allowed Endpoints:**
- GET /api/documents
- GET /api/documents/:id
- GET /api/documents/:id/chunks
- GET /api/sessions
- GET /api/citations

**Rate Limits:**
- 60 requests/minute
- 1000 requests/hour

**Use Cases:**
- Web scrapers
- Search engine crawlers
- LLM training data collection
- Analytics bots

### WRITE_LIMITED (Requires Approval)

**Allowed Endpoints:**
- All READ_ONLY endpoints
- POST /api/ingest (document submission)

**Rate Limits:**
- 10 requests/minute
- 100 requests/hour

**Use Cases:**
- Discord bots (user-triggered ingestion)
- Claude bots (document analysis)
- Automation pipelines

---

## Security Claims (Formal Properties)

Inspired by [Clawdbot Formal Models](https://github.com/vignesh07/clawdbot-formal-models/blob/main/docs/security-claims.md)

### C1: Bot Registration Gating
> "A bot cannot write to the system without explicit admin approval via pairing flow"

**Verification:** Check that POST /api/ingest returns 401 without valid X-Bot-Token

### C2: Session Isolation
> "A bot querying document X cannot access data from document Y unless both are public"

**Verification:** RLS policies enforce user_id/org_id filtering

### C3: Rate Limit Enforcement
> "No bot can exceed tier-specific rate limits across all endpoints"

**Verification:** Middleware rejects requests when limits exceeded

### C4: Audit Trail Completeness
> "All bot requests are logged with bot_id, endpoint, timestamp, and IP"

**Verification:** bot_requests table has entries for all bot-authenticated requests

### C5: Pairing Code Expiration
> "Pairing codes expire after 1 hour and cannot be reused after approval"

**Verification:** Check pairing_expires_at and status fields

---

## References

### OpenClaw Security Model
- **Getting Started:** https://docs.openclaw.ai/start/getting-started
- **Security Documentation:** https://docs.openclaw.ai/gateway/security
- **GitHub Repository:** https://github.com/openclaw/openclaw
- **Discord Community:** https://discord.com/invite/clawd

### Clawdbot Formal Models (TLA+ Verification)
- **Repository:** https://github.com/vignesh07/clawdbot-formal-models
- **Security Claims:** [/docs/security-claims.md](https://github.com/vignesh07/clawdbot-formal-models/blob/main/docs/security-claims.md)
- **Formal Models:** [/docs/formal-models.md](https://github.com/vignesh07/clawdbot-formal-models/blob/main/docs/formal-models.md)

### Recent Security Incidents (Learn From)
- **OpenClaw RCE Vulnerability (CVE-2026-25253):** [The Hacker News Article](https://thehackernews.com/2026/02/openclaw-bug-enables-one-click-remote.html)
- **Malicious Skills on ClawHub:** [Tom's Hardware Report](https://www.tomshardware.com/tech-industry/cyber-security/malicious-moltbot-skill-targets-crypto-users-on-clawhub)

**Lessons Learned:**
- Validate all skill/plugin inputs
- Sandbox untrusted code execution
- Audit third-party integrations
- Rate limit registration endpoints

---

## Next Steps

1. ✅ **Wait for CODEX** to finish baseline implementation
2. ✅ **Review this document** and approve approach
3. 🔧 **Push to GitHub** origin from Replit
4. 🔧 **Begin Phase 2** implementation (bot authentication)

---

**Document Maintained By:** Claude Sonnet 4.5
**Last Updated:** 2026-02-03
**Status:** Draft → Awaiting Review
