-- 046_lesion_context.sql
-- Step 4 in Section 18: Lesion Context and Tract Findings
-- Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§23-27)

CREATE TABLE IF NOT EXISTS clinical.lesion_contexts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  version TEXT NOT NULL DEFAULT '1.0.0',
  case_indication_id UUID NOT NULL
    REFERENCES clinical.case_indications(id) ON DELETE CASCADE,
  lesion_type TEXT NOT NULL CHECK (lesion_type IN ('ischemic', 'hemorrhagic', 'traumatic', 'post_surgical', 'encephalomalacic', 'multifocal', 'other')),
  lesion_laterality TEXT NOT NULL CHECK (lesion_laterality IN ('left', 'right', 'bilateral', 'midline', 'multifocal', 'not_assessable')),
  lesion_mask_artifact_id UUID REFERENCES imaging.artifacts(id) ON DELETE SET NULL,
  source_imaging_study_ids UUID[] NOT NULL DEFAULT '{}',
  lesion_volume_cm3 NUMERIC(10, 3),
  cortical_regions_affected JSONB NOT NULL DEFAULT '[]'::jsonb,
  subcortical_regions_affected JSONB NOT NULL DEFAULT '[]'::jsonb,
  skull_abnormality JSONB,
  structural_distortion TEXT NOT NULL CHECK (structural_distortion IN ('HIGH', 'MODERATE', 'LOW', 'VERY_LOW', 'high', 'moderate', 'low', 'not_assessable')),
  registration_quality TEXT NOT NULL CHECK (registration_quality IN ('high', 'moderate', 'low', 'fail')),
  segmentation_quality TEXT NOT NULL CHECK (segmentation_quality IN ('high', 'moderate', 'low', 'fail')),
  efield_relevance TEXT NOT NULL CHECK (efield_relevance IN ('none_known', 'potential', 'material', 'not_assessable')),
  target_region_exclusions JSONB DEFAULT '[]'::jsonb,
  data_quality TEXT NOT NULL DEFAULT 'reviewed' CHECK (data_quality IN ('verified', 'reviewed', 'unverified', 'incomplete', 'invalid')),
  interpretation TEXT NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS clinical.lesion_tract_findings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  lesion_context_id UUID NOT NULL
    REFERENCES clinical.lesion_contexts(id) ON DELETE CASCADE,
  tract_code TEXT NOT NULL,
  tract_name TEXT NOT NULL,
  atlas_code TEXT NOT NULL,
  involvement TEXT NOT NULL CHECK (involvement IN ('none', 'partial', 'substantial', 'complete', 'uncertain')),
  measurement_method TEXT,
  source_measurement_id UUID,
  confidence TEXT NOT NULL CHECK (confidence IN ('HIGH', 'MODERATE', 'LOW', 'VERY_LOW', 'high', 'moderate', 'low', 'not_assessable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lesion_contexts_indication ON clinical.lesion_contexts(case_indication_id);
CREATE INDEX IF NOT EXISTS idx_lesion_tracts_context ON clinical.lesion_tract_findings(lesion_context_id);

-- Enable Row Level Security
ALTER TABLE clinical.lesion_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.lesion_tract_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesion_contexts_read_policy" ON clinical.lesion_contexts
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.case_indications ci
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE ci.id = lesion_contexts.case_indication_id AND m.user_id = auth.uid() AND m.active = true
  ));

CREATE POLICY "lesion_contexts_write_policy" ON clinical.lesion_contexts
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.case_indications ci
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE ci.id = lesion_contexts.case_indication_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'clinical_reviewer', 'imaging_specialist', 'system_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clinical.case_indications ci
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE ci.id = lesion_contexts.case_indication_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'clinical_reviewer', 'imaging_specialist', 'system_admin')
  ));

CREATE POLICY "lesion_tract_findings_read_policy" ON clinical.lesion_tract_findings
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.lesion_contexts lc
    JOIN clinical.case_indications ci ON ci.id = lc.case_indication_id
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE lc.id = lesion_tract_findings.lesion_context_id AND m.user_id = auth.uid() AND m.active = true
  ));

CREATE POLICY "lesion_tract_findings_write_policy" ON clinical.lesion_tract_findings
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.lesion_contexts lc
    JOIN clinical.case_indications ci ON ci.id = lc.case_indication_id
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE lc.id = lesion_tract_findings.lesion_context_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'clinical_reviewer', 'imaging_specialist', 'system_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clinical.lesion_contexts lc
    JOIN clinical.case_indications ci ON ci.id = lc.case_indication_id
    JOIN identity.memberships m ON m.organisation_id = ci.organisation_id
    WHERE lc.id = lesion_tract_findings.lesion_context_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'clinical_reviewer', 'imaging_specialist', 'system_admin')
  ));
