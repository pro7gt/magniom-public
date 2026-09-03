-- 059_validation_study_manifests.sql
-- Step 17 in Section 18: Validation-Study Manifests and Case Associations
-- Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§18, 64-70)

CREATE SCHEMA IF NOT EXISTS validation;

CREATE TABLE IF NOT EXISTS validation.study_manifests (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  study_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  indication_module_release_id UUID NOT NULL
    REFERENCES clinical.indication_module_releases(id) ON DELETE RESTRICT,
  target_qualification_level TEXT NOT NULL CHECK (target_qualification_level IN ('Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8')),
  study_type TEXT NOT NULL CHECK (study_type IN ('synthetic_golden_cases', 'retrospective', 'human_factors', 'silent_prospective', 'clinician_assisted', 'clinical_performance')),
  locked_dataset_hash BYTEA NOT NULL,
  frozen_configuration_hash BYTEA NOT NULL,
  protocol_reference TEXT NOT NULL,
  ethics_approval_id TEXT,
  study_status TEXT NOT NULL CHECK (study_status IN ('designed', 'active', 'completed', 'halted', 'superseded')),
  manifest_sha256 BYTEA NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS validation.study_case_associations (
  study_manifest_id UUID NOT NULL REFERENCES validation.study_manifests(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES clinical.cases(id) ON DELETE RESTRICT,
  dataset_role TEXT NOT NULL CHECK (dataset_role IN ('development', 'locked_validation', 'verification_probe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (study_manifest_id, case_id)
);

-- Immutability enforcement trigger for completed validation study manifests
CREATE OR REPLACE FUNCTION validation.prevent_study_manifest_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.study_status IN ('completed', 'active')) THEN
    RAISE EXCEPTION 'Active or completed ValidationStudyManifest is immutable under scientific change control.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validation_study_manifests_immutable ON validation.study_manifests;
CREATE TRIGGER trg_validation_study_manifests_immutable
  BEFORE UPDATE ON validation.study_manifests
  FOR EACH ROW EXECUTE FUNCTION validation.prevent_study_manifest_mutation();

CREATE INDEX IF NOT EXISTS idx_validation_study_module ON validation.study_manifests(indication_module_release_id);

-- Enable Row Level Security
ALTER TABLE validation.study_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation.study_case_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "validation_study_manifests_read_policy" ON validation.study_manifests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "study_case_associations_read_policy" ON validation.study_case_associations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "validation_study_manifests_write_policy" ON validation.study_manifests
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_approver', 'researcher')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_approver', 'researcher')));

CREATE POLICY "study_case_associations_write_policy" ON validation.study_case_associations
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_approver', 'researcher')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_approver', 'researcher')));
