-- 020_evidence_circuits.sql
-- Therapeutic Circuit Versions and Circuit-Claim Relationships
-- Conforms to Section 42, 44 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE TABLE IF NOT EXISTS evidence.circuit_series (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS evidence.circuit_versions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  circuit_series_id UUID NOT NULL
    REFERENCES evidence.circuit_series(id) ON DELETE RESTRICT,
  version TEXT NOT NULL,
  mode system.magniom_mode NOT NULL,
  evidence_tier evidence.evidence_tier NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  validation_status TEXT NOT NULL,
  circuit_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
  payload_sha256 BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (circuit_series_id, version)
);

CREATE TABLE IF NOT EXISTS evidence.circuit_claims (
  circuit_version_id UUID NOT NULL
    REFERENCES evidence.circuit_versions(id) ON DELETE CASCADE,
  claim_version_id UUID NOT NULL
    REFERENCES evidence.claim_versions(id) ON DELETE CASCADE,
  PRIMARY KEY (circuit_version_id, claim_version_id)
);

CREATE TRIGGER trg_circuit_versions_immutable
  BEFORE UPDATE OR DELETE ON evidence.circuit_versions
  FOR EACH ROW EXECUTE FUNCTION evidence.prevent_scientific_version_mutation();

-- Enable RLS
ALTER TABLE evidence.circuit_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.circuit_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.circuit_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "circuit_series_read_policy" ON evidence.circuit_series FOR SELECT TO authenticated USING (true);
CREATE POLICY "circuit_versions_read_policy" ON evidence.circuit_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "circuit_claims_read_policy" ON evidence.circuit_claims FOR SELECT TO authenticated USING (true);

CREATE POLICY "circuit_series_write_policy" ON evidence.circuit_series FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));

CREATE POLICY "circuit_versions_write_policy" ON evidence.circuit_versions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));

CREATE POLICY "circuit_claims_write_policy" ON evidence.circuit_claims FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));
