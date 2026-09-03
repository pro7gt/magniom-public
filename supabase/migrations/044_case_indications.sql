-- 044_case_indications.sql
-- Step 2 in Section 18: CaseIndication and Clinical Objectives
-- Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§9, 16-18)

CREATE TABLE IF NOT EXISTS evidence.clinical_objective_definitions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  version TEXT NOT NULL,
  indication_module_release_id UUID NOT NULL
    REFERENCES clinical.indication_module_releases(id) ON DELETE RESTRICT,
  concept JSONB NOT NULL,
  description TEXT NOT NULL,
  evidence_mappability TEXT NOT NULL CHECK (evidence_mappability IN ('clinical', 'supporting', 'research', 'none')),
  evidence_claim_ids UUID[] NOT NULL DEFAULT '{}',
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS clinical.case_indications (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES clinical.cases(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES identity.organisations(id) ON DELETE CASCADE,
  version TEXT NOT NULL DEFAULT '1.0.0',
  indication JSONB NOT NULL,
  indication_module_release_id UUID NOT NULL
    REFERENCES clinical.indication_module_releases(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('proposed', 'confirmed', 'inactive', 'superseded')),
  clinical_role TEXT NOT NULL CHECK (clinical_role IN ('primary_targeting_indication', 'secondary_condition', 'contextual_comorbidity')),
  confirmation_source_ids UUID[] DEFAULT '{}',
  confirmed_by UUID REFERENCES identity.clinicians(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMPTZ,
  data_quality TEXT NOT NULL DEFAULT 'reviewed' CHECK (data_quality IN ('verified', 'reviewed', 'unverified', 'incomplete', 'invalid')),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS clinical.clinical_objectives (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  case_indication_id UUID NOT NULL REFERENCES clinical.case_indications(id) ON DELETE CASCADE,
  objective_definition_id UUID NOT NULL REFERENCES evidence.clinical_objective_definitions(id) ON DELETE RESTRICT,
  concept JSONB NOT NULL,
  priority_rank INTEGER NOT NULL,
  clinician_priority INTEGER,
  patient_priority INTEGER,
  current_burden JSONB,
  functional_impact JSONB,
  target_mappability TEXT NOT NULL CHECK (target_mappability IN ('clinically_supported', 'supporting_only', 'research_only', 'not_evidence_mappable')),
  confidence TEXT NOT NULL CHECK (confidence IN ('HIGH', 'MODERATE', 'LOW', 'VERY_LOW', 'high', 'moderate', 'low', 'not_assessable')),
  rationale TEXT,
  approved_by UUID REFERENCES identity.clinicians(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_case_indications_case ON clinical.case_indications(case_id);
CREATE INDEX IF NOT EXISTS idx_case_indications_org ON clinical.case_indications(organisation_id);
CREATE INDEX IF NOT EXISTS idx_clinical_objectives_indication ON clinical.clinical_objectives(case_indication_id);

-- Enable Row Level Security
ALTER TABLE evidence.clinical_objective_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.case_indications ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.clinical_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "objective_definitions_read_policy" ON evidence.clinical_objective_definitions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "objective_definitions_write_policy" ON evidence.clinical_objective_definitions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "case_indications_read_policy" ON clinical.case_indications
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.organisation_id = case_indications.organisation_id AND m.active = true));

CREATE POLICY "case_indications_write_policy" ON clinical.case_indications
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.organisation_id = case_indications.organisation_id AND m.active = true AND m.role IN ('tms_specialist', 'clinical_reviewer', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.organisation_id = case_indications.organisation_id AND m.active = true AND m.role IN ('tms_specialist', 'clinical_reviewer', 'system_admin')));

CREATE POLICY "clinical_objectives_read_policy" ON clinical.clinical_objectives
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.case_indications ci
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE ci.id = clinical_objectives.case_indication_id AND m.user_id = auth.uid() AND m.active = true
  ));

CREATE POLICY "clinical_objectives_write_policy" ON clinical.clinical_objectives
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.case_indications ci
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE ci.id = clinical_objectives.case_indication_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'clinical_reviewer', 'system_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clinical.case_indications ci
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE ci.id = clinical_objectives.case_indication_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'clinical_reviewer', 'system_admin')
  ));
