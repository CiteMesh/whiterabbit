# WRBT_01 Minimal Tables (baseline)

This is a non-authoritative convenience view. Backend remains source of truth via migrations.

## orgs
- id (uuid, pk)
- name (text)
- created_at (timestamptz, default now())

## users
- id (uuid, pk)
- org_id (uuid, fk orgs.id)
- email (text)
- created_at (timestamptz, default now())

## documents
- id (uuid, pk)
- org_id (uuid, fk orgs.id, nullable)
- user_id (uuid, fk users.id, nullable)
- title (text, nullable)
- status (enum: queued|processing|done|failed)
- job_id (uuid, nullable)
- created_at (timestamptz, default now())
- error_code (text, nullable)
- error_message (text, nullable)

## chunks
- id (uuid, pk)
- document_id (uuid, fk documents.id)
- index (int)
- content (text)
- token_count (int, nullable)
- embedding_status (text, nullable)

## jobs
- id (uuid, pk)
- document_id (uuid, fk documents.id)
- status (enum: queued|processing|done|failed)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
- error_code (text, nullable)
- error_message (text, nullable)
