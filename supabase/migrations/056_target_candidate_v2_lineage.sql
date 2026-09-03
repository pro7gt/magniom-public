-- 056_target_candidate_v2_lineage.sql
-- Step 14 in Section 18: Target Candidate v2 Lineage and Non-Destructive v1 Coexistence
-- Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§70-80)
-- and Section 19 (Historical v1 TargetCandidates remain historically valid)

CREATE TABLE IF NOT EXISTS targeting.target_candidates_v2 (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  version TEXT NOT NULL DEFAULT '2.0.0',
  case_id UUID NOT NULL REFERENCES clinical.cases(id) ON DELETE CASCADE,
  case_indication_id UUID NOT NULL REFERENCES clinical.case_indications(id) ON DELETE CASCADE,
  assessment_id UUID,
  mode system.magniom_mode NOT NULL DEFAULT 'clinical',
  indication_module_release_id UUID NOT NULL
    REFERENCES clinical.indication_module_releases(id) ON DELETE RESTRICT,
  scientific_policy_release_id UUID NOT NULL,
  generation_status targeting.candidate_status NOT NULL DEFAULT 'generated',
  candidate_role TEXT NOT NULL CHECK (candidate_role IN (
    'evidence_anchor', 'phenotype_specific', 'connectome_refinement',
    'somatotopic_target', 'ipsilesional_strategy', 'contralesional_strategy',
    'lesion_network_target', 'field_target', 'network_alternative',
    'clinical_alternative', 'research_hypothesis'
  )),
  target_family_id TEXT NOT NULL,
  therapeutic_circuit_ids TEXT[] NOT NULL DEFAULT '{}',
  clinical_objective_ids UUID[] NOT NULL DEFAULT '{}',
  target_geometry_id UUID NOT NULL REFERENCES targeting.target_geometries(id) ON DELETE RESTRICT,
  standard_space_geometry_id UUID REFERENCES targeting.target_geometries(id) ON DELETE SET NULL,
  atlas_annotations JSONB NOT NULL DEFAULT '[]'::jsonb,
  clinical_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  disease_stage_context_id UUID REFERENCES clinical.disease_stage_contexts(id) ON DELETE SET NULL,
  lesion_context_ids UUID[] DEFAULT '{}',
  measurement_bundle_id UUID NOT NULL REFERENCES measurement.measurement_bundles(id) ON DELETE RESTRICT,
  reliability_bundle_id UUID REFERENCES measurement.reliability_bundles(id) ON DELETE SET NULL,
  relied_on_measurement_ids UUID[] NOT NULL DEFAULT '{}',
  relied_on_reliability_ids UUID[] NOT NULL DEFAULT '{}',
  nomination_rationale TEXT NOT NULL,
  counterarguments JSONB NOT NULL DEFAULT '[]'::jsonb,
  supporting_evidence_claim_ids UUID[] NOT NULL DEFAULT '{}',
  conflicting_evidence_claim_ids UUID[] NOT NULL DEFAULT '{}',
  target_engine_version_id TEXT NOT NULL,
  evidence_library_release_id UUID NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_candidates_v2_case ON targeting.target_candidates_v2(case_id);
CREATE INDEX IF NOT EXISTS idx_candidates_v2_indication ON targeting.target_candidates_v2(case_indication_id);
CREATE INDEX IF NOT EXISTS idx_candidates_v2_module ON targeting.target_candidates_v2(indication_module_release_id);

-- Enable Row Level Security
ALTER TABLE targeting.target_candidates_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "candidates_v2_read_policy" ON targeting.target_candidates_v2
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = target_candidates_v2.case_id AND m.user_id = auth.uid() AND m.active = true
  ));

CREATE POLICY "candidates_v2_write_policy" ON targeting.target_candidates_v2
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = target_candidates_v2.case_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'service_worker', 'system_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = target_candidates_v2.case_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'service_worker', 'system_admin')
  ));

-- Non-destructive v1 compatibility view: projects historical v1 target candidates without alteration
CREATE OR REPLACE VIEW targeting.v_target_candidates_v2_adapter AS
SELECT
  tc.id,
  '1.0.0-compat' AS version,
  tc.case_id,
  NULL::uuid AS case_indication_id,
  tc.organisation_id,
  'CLINICAL'::system.magniom_mode AS mode,
  CASE
    WHEN tc.target_method = 'CONNECTOME_REFINED' THEN 'connectome_refinement'
    WHEN tc.target_method = 'EVIDENCE_ONLY_PRIOR' THEN 'evidence_anchor'
    ELSE 'phenotype_specific'
  END AS candidate_role,
  tc.target_family_code AS target_family_id,
  ARRAY[tc.circuit_code] AS therapeutic_circuit_ids,
  tc.subject_coordinate,
  tc.mni_coordinate,
  tc.evidence_score,
  tc.phenotype_concordance_score,
  tc.connectome_refinement_score,
  tc.overall_score,
  tc.rationale AS nomination_rationale,
  tc.counterarguments,
  tc.created_at
FROM targeting.target_candidates tc;
