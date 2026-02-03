# Replit Deployment Guide

## Quick Setup

### 1. Required Secrets

Configure these in the Replit Secrets tab:

| Secret | Description | Example |
|--------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:5432/dbname` |
| `SESSION_SECRET` | Session encryption key (32+ chars) | `openssl rand -base64 32` |
| `PORT` | Server port (optional, default: 5000) | `5000` |

**Optional Secrets:**
- `NODE_ENV` - Set to `production` for deployment (auto-set by Cloud Run)
- `ALLOWED_ORIGINS` - Comma-separated CORS origins (default: `*`)
- `USE_BCRYPT` - Force bcrypt usage (`true` in production by default)
- `BCRYPT_ROUNDS` - Bcrypt cost factor (default: `10`)

### 2. Supabase Setup

If using Supabase for the database:

1. Create a new project at https://supabase.com
2. Go to Project Settings → Database
3. Copy the "Connection String" (URI mode)
4. Replace `[YOUR-PASSWORD]` with your database password
5. Add to Replit Secrets as `DATABASE_URL`

Example:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

### 3. Deployment Configuration

The `.replit` file is pre-configured for Cloud Run deployment:

**Build Command:**
```bash
npm install && npm run build:api
```

**Run Command:**
```bash
node start-api.js
```

This runs the production-ready Express server with:
- ✅ IPv6 compatibility (binds to `0.0.0.0`)
- ✅ Environment validation
- ✅ TypeScript compiled to ES modules
- ✅ Production optimizations

### 4. Deploy

1. Click **Deploy** in Replit
2. Select "Cloud Run (Autoscale)"
3. Click **Publish**

The deployment will:
1. Install dependencies
2. Compile TypeScript → JavaScript
3. Start the production server
4. Bind to port 5000 (or `$PORT`)

## Local Development

```bash
# Install dependencies
npm install

# Run dev server (hot reload)
npm run dev:api

# Type checking
npm run check

# Build for production
npm run build:api
```

## Troubleshooting

### Missing Dependencies Error

If deployment fails with `Cannot find module`:
- Verify `npm install` runs in build command
- Check `package.json` has `"type": "module"`
- Ensure TypeScript config includes all source dirs

### Port Binding Issues

Server binds to `0.0.0.0` for IPv4/IPv6 compatibility. If needed:
- Check `PORT` secret is set to `5000`
- Verify `.replit` port mapping: `localPort = 5000`

### Database Connection Errors

1. Verify `DATABASE_URL` is set in Secrets
2. Check Supabase project is running
3. Confirm password is correct in connection string
4. Test connection from Replit Shell:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

## Architecture

```
start-api.js         → Production entry point
  └─ apps/wrbt-api/dist/server/index.js  → Compiled Express server
      ├─ Express + CORS
      ├─ Database (Drizzle + PostgreSQL)
      └─ API routes
          ├─ /api/healthz
          ├─ /api/bots/*
          └─ /api/admin/*
```

## Security Notes

- **Never commit secrets** to version control
- Use Replit Secrets for all sensitive data
- `SESSION_SECRET` should be 32+ random characters
- Database connections use SSL in production
- CORS is restricted by `ALLOWED_ORIGINS` (default allows all)

## Support

- [Replit Docs](https://docs.replit.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [Express.js](https://expressjs.com)
