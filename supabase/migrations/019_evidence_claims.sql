-- 019_evidence_claims.sql
-- Versioned Evidence Claims and Claim-Source Relationships
-- Conforms to Section 41, 44 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE TABLE IF NOT EXISTS evidence.claim_series (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS evidence.claim_versions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  claim_series_id UUID NOT NULL
    REFERENCES evidence.claim_series(id) ON DELETE RESTRICT,
  version TEXT NOT NULL,
  mode system.magniom_mode NOT NULL,
  evidence_tier evidence.evidence_tier NOT NULL,
  claim_type TEXT NOT NULL,
  statement TEXT NOT NULL,
  certainty system.qualitative_confidence NOT NULL,
  population JSONB NOT NULL DEFAULT '{}'::jsonb,
  intervention JSONB,
  comparator JSONB,
  outcomes JSONB NOT NULL DEFAULT '{}'::jsonb,
  replication_status TEXT NOT NULL,
  applicability_constraints JSONB NOT NULL DEFAULT '[]'::jsonb,
  limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
  payload_sha256 BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (claim_series_id, version)
);

CREATE TABLE IF NOT EXISTS evidence.claim_sources (
  claim_version_id UUID NOT NULL
    REFERENCES evidence.claim_versions(id) ON DELETE CASCADE,
  source_id UUID NOT NULL
    REFERENCES evidence.sources(id) ON DELETE RESTRICT,
  relationship TEXT NOT NULL
    CHECK (relationship IN ('supporting', 'conflicting', 'context')),
  PRIMARY KEY (claim_version_id, source_id, relationship)
);

-- Immutability enforcement function for versioned scientific objects
CREATE OR REPLACE FUNCTION evidence.prevent_scientific_version_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Scientific version rows are immutable. Create a new version instead.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_claim_versions_immutable
  BEFORE UPDATE OR DELETE ON evidence.claim_versions
  FOR EACH ROW EXECUTE FUNCTION evidence.prevent_scientific_version_mutation();

-- Enable RLS
ALTER TABLE evidence.claim_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.claim_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.claim_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "claim_series_read_policy" ON evidence.claim_series FOR SELECT TO authenticated USING (true);
CREATE POLICY "claim_versions_read_policy" ON evidence.claim_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "claim_sources_read_policy" ON evidence.claim_sources FOR SELECT TO authenticated USING (true);

CREATE POLICY "claim_series_write_policy" ON evidence.claim_series FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));

CREATE POLICY "claim_versions_write_policy" ON evidence.claim_versions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));

CREATE POLICY "claim_sources_write_policy" ON evidence.claim_sources FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));
