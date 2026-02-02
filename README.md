# White Rabbit (WRBT_01) — bot-first ingestion console

Monorepo skeleton for ClaudeBots / OpenClaw operators. Frontend lives in Vercel, backend in Replit, DB in Supabase. Contracts live in `specs/openapi.yaml` and are the single source of truth.

## Layout
```
whiterabbit/
  apps/
    wrbt-web/          # Next.js (App Router) frontend
  packages/
    sdk/               # Typed client: ingest, documents, chunks, schema-report
    types/             # Shared types
    ui/                # CodePanel + tokens
  specs/
    openapi.yaml       # Backend contract (source of truth)
    db_schema.md       # Minimal table expectations
    event_states.md    # Job state machine
  .env.example         # Global env placeholders
```

## Frontend (Vercel)
- Root directory: `apps/wrbt-web`
- Build: `next build`
- Runtime env: `NEXT_PUBLIC_WRBT_API_BASE` (Replit backend), optional `WRBT_API_KEY`
- Tailwind enabled (tokens wired via `packages/ui/styles.css`)

## SDK
- All network calls go through `@wrbt/sdk` (`ingest`, `getDocument`, `getChunks`, `getSchemaReport`).
- No direct fetches in pages.
- Contract guardrail helper: `checkContract(expectedKeys, schemaReport)`.

## Privacy & safety
- Client never needs Supabase service-role keys; keep them server-side.
- Env examples only; no secrets checked in.
- Schema/report endpoint is read-only and intended for drift detection.

## Dev commands
```bash
npm install              # (workspace-aware) installs deps
npm run dev              # runs apps/wrbt-web
npm run build            # builds apps/wrbt-web
npm run lint             # lint via Next
```

## Status pages
- `/` ingest: POST /v1/ingest then link to inspector
- `/documents/[id]`: polls status, shows metadata
- `/documents/[id]/chunks`: renders ordered chunks; CSV download helper
- `/schema`: renders schema-report + drift check

## Next steps
- Replace `NEXT_PUBLIC_WRBT_API_BASE` with the Replit backend URL.
- Point Vercel project root to `apps/wrbt-web` and add the env var above.
- Publish your backend’s `/schema-report` shape and tune `expectedKeys` in `app/schema/page.tsx`.
