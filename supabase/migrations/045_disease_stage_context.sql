-- 045_disease_stage_context.sql
-- Step 3 in Section 18: Disease-Stage Context
-- Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§19-22)

CREATE TABLE IF NOT EXISTS evidence.disease_stage_definitions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  version TEXT NOT NULL,
  indication_module_release_id UUID NOT NULL
    REFERENCES clinical.indication_module_releases(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  temporal_bounds JSONB,
  description TEXT NOT NULL,
  evidence_claim_ids UUID[] DEFAULT '{}',
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS clinical.disease_stage_contexts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  version TEXT NOT NULL DEFAULT '1.0.0',
  case_indication_id UUID NOT NULL
    REFERENCES clinical.case_indications(id) ON DELETE CASCADE,
  stage_definition_id UUID NOT NULL
    REFERENCES evidence.disease_stage_definitions(id) ON DELETE RESTRICT,
  onset_date DATE,
  calculated_duration_days INTEGER,
  current_stage_code TEXT NOT NULL,
  current_stage_label TEXT NOT NULL,
  determination_method TEXT NOT NULL CHECK (determination_method IN ('date_based', 'clinician_assessed', 'combined')),
  confidence TEXT NOT NULL CHECK (confidence IN ('HIGH', 'MODERATE', 'LOW', 'VERY_LOW', 'high', 'moderate', 'low', 'not_assessable')),
  data_quality TEXT NOT NULL DEFAULT 'reviewed' CHECK (data_quality IN ('verified', 'reviewed', 'unverified', 'incomplete', 'invalid')),
  approved_by UUID REFERENCES identity.clinicians(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_disease_stage_contexts_indication ON clinical.disease_stage_contexts(case_indication_id);

-- Enable Row Level Security
ALTER TABLE evidence.disease_stage_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.disease_stage_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "disease_stage_definitions_read_policy" ON evidence.disease_stage_definitions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "disease_stage_definitions_write_policy" ON evidence.disease_stage_definitions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "disease_stage_contexts_read_policy" ON clinical.disease_stage_contexts
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.case_indications ci
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE ci.id = disease_stage_contexts.case_indication_id AND m.user_id = auth.uid() AND m.active = true
  ));

CREATE POLICY "disease_stage_contexts_write_policy" ON clinical.disease_stage_contexts
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.case_indications ci
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE ci.id = disease_stage_contexts.case_indication_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'clinical_reviewer', 'system_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clinical.case_indications ci
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE ci.id = disease_stage_contexts.case_indication_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'clinical_reviewer', 'system_admin')
  ));
