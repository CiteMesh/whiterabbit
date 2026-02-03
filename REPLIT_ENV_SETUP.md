# Replit Environment Variables Setup

## Quick Setup for Replit

Copy this configuration to your Replit Secrets panel (🔒 icon in left sidebar):

### Required Variables

```env
DATABASE_URL=postgresql://username:password@host:5432/database
PORT=5001
SESSION_SECRET=uUfdWxBq4IswtDKOL6Q4kIE/SWRnQQ7OthGHbqhg000=
NODE_ENV=development
USE_BCRYPT=false
```

### How to Get DATABASE_URL in Replit

1. **Open Replit workspace**
2. **Click "Tools" panel** (left sidebar)
3. **Add PostgreSQL** from available tools
4. **Copy connection string** from the Postgres panel
   - Format: `postgresql://username:password@host:5432/database`
   - Example: `postgresql://neondb_owner:abc123@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require`

### Replit Secrets vs .env File

**In Replit, use Secrets (recommended):**
- Click 🔒 icon in left sidebar
- Add each variable as a separate secret
- Replit automatically injects them as environment variables

**Alternative - .env file (not recommended in Replit):**
```bash
# Create .env file manually
cd apps/wrbt-api
cat > .env << 'EOF'
DATABASE_URL=postgresql://your-actual-connection-string
PORT=5001
SESSION_SECRET=uUfdWxBq4IswtDKOL6Q4kIE/SWRnQQ7OthGHbqhg000=
NODE_ENV=development
USE_BCRYPT=false
EOF
```

## After Setting Environment Variables

### Step 1: Initialize Database
```bash
npm run db:push
```
This creates all 8 tables in your PostgreSQL database.

### Step 2: (Optional) Seed Sample Data
```bash
npm run seed
```

### Step 3: Start the API Server
```bash
npm run dev:api
```

### Step 4: Verify It's Working
```bash
# Test health endpoint
curl https://your-replit-url.repl.co/api/healthz

# Test database connection
curl https://your-replit-url.repl.co/api/readyz
```

## Environment Variable Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PORT` | API server port | `5001` |
| `SESSION_SECRET` | Secure session signing | Generated 32-byte base64 string |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `USE_BCRYPT` | Enable token hashing | `false` (dev) or `true` (prod) |

## Security Notes

- **SESSION_SECRET**: Already generated for you above (keep it secret!)
- **USE_BCRYPT=false**: Allows plain-text token storage in development for easier debugging
- **USE_BCRYPT=true**: Automatically enabled in production (`NODE_ENV=production`)

## Troubleshooting

### "DATABASE_URL not set"
→ Add `DATABASE_URL` to Replit Secrets

### "relation 'bots' does not exist"
→ Run `npm run db:push` to create tables

### "Port 5001 already in use"
→ Change `PORT` in Replit Secrets or kill existing process

### "Module not found" errors
→ Run `npm install` in the workspace root

## Next: Deploy Frontend to Vercel

See `VERCEL_ENV_SETUP.md` for frontend deployment configuration.
