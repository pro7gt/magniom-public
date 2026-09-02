-- 018_evidence_sources.sql
-- Evidence Knowledge Graph Sources Registry
-- Conforms to Section 40 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE TABLE IF NOT EXISTS evidence.sources (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  authors TEXT[],
  journal TEXT,
  publication_year INTEGER,
  doi TEXT,
  pubmed_id TEXT,
  citation_text TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for source lookup and de-duplication
CREATE INDEX IF NOT EXISTS idx_evidence_sources_doi ON evidence.sources(doi) WHERE doi IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_evidence_sources_pubmed_id ON evidence.sources(pubmed_id) WHERE pubmed_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_evidence_sources_pub_year ON evidence.sources(publication_year);

-- Enable RLS
ALTER TABLE evidence.sources ENABLE ROW LEVEL SECURITY;

-- Read policy: Authenticated users can read evidence sources
CREATE POLICY "evidence_sources_read_policy"
  ON evidence.sources
  FOR SELECT
  TO authenticated
  USING (true);

-- Write policy: Evidence curators, approvers, or system admins can manage sources
CREATE POLICY "evidence_sources_write_policy"
  ON evidence.sources
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM identity.memberships m
      WHERE m.user_id = auth.uid()
        AND m.active = true
        AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM identity.memberships m
      WHERE m.user_id = auth.uid()
        AND m.active = true
        AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')
    )
  );
