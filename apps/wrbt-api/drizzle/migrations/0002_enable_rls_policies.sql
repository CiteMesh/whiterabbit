-- Migration: Enable Row-Level Security (RLS) policies
-- Created: 2026-02-03
--
-- This migration implements multi-tenant data isolation using Supabase RLS.
-- All queries will be scoped to the authenticated user's organization.

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORGS TABLE POLICIES
-- ============================================================================

-- Users can only see their own organization
CREATE POLICY "users_read_own_org"
  ON orgs FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  );

-- Only admins can update their organization
CREATE POLICY "admins_update_own_org"
  ON orgs FOR UPDATE
  USING (
    id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- No one can delete orgs (must be done by superuser)
-- No insert policy (orgs created by superuser only)

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can see other users in their org
CREATE POLICY "users_read_same_org"
  ON users FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  );

-- Admins can create new users in their org
CREATE POLICY "admins_insert_users"
  ON users FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update users in their org
CREATE POLICY "admins_update_users"
  ON users FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete users in their org (except themselves)
CREATE POLICY "admins_delete_users"
  ON users FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
    AND id != auth.uid() -- Can't delete self
  );

-- ============================================================================
-- DOCUMENTS TABLE POLICIES
-- ============================================================================

-- Users can read documents in their org
CREATE POLICY "users_read_org_documents"
  ON documents FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  );

-- Bots and editors can create documents
CREATE POLICY "bots_editors_insert_documents"
  ON documents FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
        AND role IN ('bot', 'editor', 'admin')
    )
  );

-- Editors and admins can update documents in their org
CREATE POLICY "editors_update_documents"
  ON documents FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
        AND role IN ('editor', 'admin')
    )
  );

-- Admins can delete documents in their org
CREATE POLICY "admins_delete_documents"
  ON documents FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- CHUNKS TABLE POLICIES
-- ============================================================================

-- Users can read chunks from documents in their org
CREATE POLICY "users_read_org_chunks"
  ON chunks FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE org_id IN (
        SELECT org_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- System/bots can insert chunks (background job processor)
-- Note: This will be refined with service-role authentication
CREATE POLICY "system_insert_chunks"
  ON chunks FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents
      WHERE org_id IN (
        SELECT org_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Admins can update chunks
CREATE POLICY "admins_update_chunks"
  ON chunks FOR UPDATE
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE org_id IN (
        SELECT org_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Admins can delete chunks
CREATE POLICY "admins_delete_chunks"
  ON chunks FOR DELETE
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE org_id IN (
        SELECT org_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- ============================================================================
-- JOBS TABLE POLICIES
-- ============================================================================

-- Users can read jobs for documents in their org
CREATE POLICY "users_read_org_jobs"
  ON jobs FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE org_id IN (
        SELECT org_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- System can insert jobs
CREATE POLICY "system_insert_jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents
      WHERE org_id IN (
        SELECT org_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- System can update jobs (background processor)
CREATE POLICY "system_update_jobs"
  ON jobs FOR UPDATE
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE org_id IN (
        SELECT org_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Admins can delete jobs
CREATE POLICY "admins_delete_jobs"
  ON jobs FOR DELETE
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE org_id IN (
        SELECT org_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- ============================================================================
-- PAIRINGS TABLE POLICIES
-- ============================================================================

-- Users in an org can see pairings for their org
CREATE POLICY "users_read_org_pairings"
  ON pairings FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  );

-- Bots can create pairings (anonymous, no org yet)
-- This is a special case: pairings start without org_id
CREATE POLICY "anonymous_insert_pairings"
  ON pairings FOR INSERT
  WITH CHECK (true); -- Allow anonymous pairing requests

-- Admins can update pairings (approve/revoke)
CREATE POLICY "admins_update_pairings"
  ON pairings FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR org_id IS NULL -- Can approve pending pairings
  );

-- Admins can delete (revoke) pairings
CREATE POLICY "admins_delete_pairings"
  ON pairings FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- SERVICE ROLE BYPASS (for background jobs)
-- ============================================================================

-- Create a function to check if the current role is service_role
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('role', true) = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add service role bypass policies for background job processor
-- These allow the backend (using service_role key) to bypass RLS for job processing

CREATE POLICY "service_role_bypass_documents"
  ON documents FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

CREATE POLICY "service_role_bypass_chunks"
  ON chunks FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

CREATE POLICY "service_role_bypass_jobs"
  ON jobs FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current user's org_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT org_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION user_has_role(required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON POLICY "users_read_own_org" ON orgs IS
  'Users can only see their own organization';

COMMENT ON POLICY "users_read_org_documents" ON documents IS
  'Users can read documents in their org (multi-tenant isolation)';

COMMENT ON POLICY "bots_editors_insert_documents" ON documents IS
  'Bots and editors can create documents in their org';

COMMENT ON POLICY "service_role_bypass_documents" ON documents IS
  'Backend service role can bypass RLS for job processing';

-- ============================================================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================================================

-- To verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- To verify policies exist:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies WHERE schemaname = 'public';
