-- 021_evidence_target_families.sql
-- Target Family Versions and TargetFamily-Circuit Relationships
-- Conforms to Section 43, 44 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE TABLE IF NOT EXISTS evidence.target_family_series (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS evidence.target_family_versions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  target_family_series_id UUID NOT NULL
    REFERENCES evidence.target_family_series(id) ON DELETE RESTRICT,
  version TEXT NOT NULL,
  mode system.magniom_mode NOT NULL,
  evidence_tier evidence.evidence_tier NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  laterality TEXT NOT NULL,
  anatomical_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  candidate_generation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
  payload_sha256 BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (target_family_series_id, version)
);

CREATE TABLE IF NOT EXISTS evidence.target_family_circuits (
  target_family_version_id UUID NOT NULL
    REFERENCES evidence.target_family_versions(id) ON DELETE CASCADE,
  circuit_version_id UUID NOT NULL
    REFERENCES evidence.circuit_versions(id) ON DELETE CASCADE,
  PRIMARY KEY (target_family_version_id, circuit_version_id)
);

CREATE TRIGGER trg_target_family_versions_immutable
  BEFORE UPDATE OR DELETE ON evidence.target_family_versions
  FOR EACH ROW EXECUTE FUNCTION evidence.prevent_scientific_version_mutation();

-- Enable RLS
ALTER TABLE evidence.target_family_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.target_family_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.target_family_circuits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "target_family_series_read_policy" ON evidence.target_family_series FOR SELECT TO authenticated USING (true);
CREATE POLICY "target_family_versions_read_policy" ON evidence.target_family_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "target_family_circuits_read_policy" ON evidence.target_family_circuits FOR SELECT TO authenticated USING (true);

CREATE POLICY "target_family_series_write_policy" ON evidence.target_family_series FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));

CREATE POLICY "target_family_versions_write_policy" ON evidence.target_family_versions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));

CREATE POLICY "target_family_circuits_write_policy" ON evidence.target_family_circuits FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('evidence_curator', 'evidence_approver', 'system_admin')));
