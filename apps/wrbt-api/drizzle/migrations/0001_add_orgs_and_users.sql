-- Migration: Add orgs and users tables for multi-tenancy
-- Created: 2026-02-03

-- Create orgs table (multi-tenant organization isolation)
CREATE TABLE IF NOT EXISTS orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_role enum
CREATE TYPE user_role AS ENUM ('viewer', 'editor', 'admin', 'bot');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  email TEXT, -- nullable for bot users
  role user_role NOT NULL DEFAULT 'viewer',
  api_key_hash TEXT, -- bcrypt hash for bot API keys
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Add foreign key constraints to existing tables
ALTER TABLE documents
  ADD CONSTRAINT fk_documents_org_id FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_documents_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_org_id ON documents(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Add foreign key for chunks (documents already has FK via Drizzle, but ensure cascade)
ALTER TABLE chunks
  ADD CONSTRAINT fk_chunks_document_id FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);

-- Add foreign key for jobs
ALTER TABLE jobs
  ADD CONSTRAINT fk_jobs_document_id FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_jobs_document_id ON jobs(document_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status) WHERE status IN ('queued', 'processing');

-- Add org_id to pairings for multi-tenancy
ALTER TABLE pairings
  ADD COLUMN org_id UUID REFERENCES orgs(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_pairings_code ON pairings(code);
CREATE INDEX IF NOT EXISTS idx_pairings_status ON pairings(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_pairings_org_id ON pairings(org_id);

-- Create a default org for existing data (if any)
INSERT INTO orgs (id, name) VALUES ('00000000-0000-0000-0000-000000000000', 'Default Organization')
ON CONFLICT (id) DO NOTHING;

-- Create a default bot user for existing data
INSERT INTO users (id, org_id, email, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'system-bot@wrbt.example.com',
  'bot'
)
ON CONFLICT (id) DO NOTHING;
