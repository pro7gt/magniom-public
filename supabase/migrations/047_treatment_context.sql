-- 047_treatment_context.sql
-- Step 5 in Section 18: Treatment Context Requirements and Snapshots
-- Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§46-50)

CREATE TABLE IF NOT EXISTS evidence.treatment_context_requirements (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  version TEXT NOT NULL,
  indication_module_release_id UUID NOT NULL
    REFERENCES clinical.indication_module_releases(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  context_type TEXT NOT NULL CHECK (context_type IN ('concurrent_rehabilitation', 'behavioural_activation', 'symptom_provocation', 'task_state', 'device_class', 'coil_class', 'protocol_precedent', 'other')),
  role TEXT NOT NULL CHECK (role IN ('required_by_evidence', 'recommended_by_evidence', 'context_only')),
  description TEXT NOT NULL,
  evidence_claim_ids UUID[] NOT NULL DEFAULT '{}',
  absence_behaviour TEXT NOT NULL CHECK (absence_behaviour IN ('ineligible', 'downgrade_evidence_applicability', 'show_limitation', 'research_only')),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS clinical.treatment_context_snapshots (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  version TEXT NOT NULL DEFAULT '1.0.0',
  case_indication_id UUID NOT NULL
    REFERENCES clinical.case_indications(id) ON DELETE CASCADE,
  requirement_evaluations JSONB NOT NULL DEFAULT '[]'::jsonb,
  approved_by UUID REFERENCES identity.clinicians(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  payload_sha256 BYTEA NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Immutability enforcement trigger
CREATE OR REPLACE FUNCTION clinical.prevent_treatment_context_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.approved_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Approved TreatmentContextSnapshot is immutable. Create a new snapshot instead.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_treatment_context_snapshots_immutable ON clinical.treatment_context_snapshots;
CREATE TRIGGER trg_treatment_context_snapshots_immutable
  BEFORE UPDATE ON clinical.treatment_context_snapshots
  FOR EACH ROW EXECUTE FUNCTION clinical.prevent_treatment_context_mutation();

CREATE INDEX IF NOT EXISTS idx_treatment_context_snapshots_indication ON clinical.treatment_context_snapshots(case_indication_id);

-- Enable Row Level Security
ALTER TABLE evidence.treatment_context_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.treatment_context_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "treatment_context_requirements_read_policy" ON evidence.treatment_context_requirements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "treatment_context_requirements_write_policy" ON evidence.treatment_context_requirements
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "treatment_context_snapshots_read_policy" ON clinical.treatment_context_snapshots
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.case_indications ci
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE ci.id = treatment_context_snapshots.case_indication_id AND m.user_id = auth.uid() AND m.active = true
  ));

CREATE POLICY "treatment_context_snapshots_write_policy" ON clinical.treatment_context_snapshots
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.case_indications ci
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE ci.id = treatment_context_snapshots.case_indication_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'clinical_reviewer', 'system_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clinical.case_indications ci
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE ci.id = treatment_context_snapshots.case_indication_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'clinical_reviewer', 'system_admin')
  ));
