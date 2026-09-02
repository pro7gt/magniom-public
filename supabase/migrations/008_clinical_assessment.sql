-- 008_clinical_assessment.sql
-- Structured clinical assessments, observations, and functional goals
-- Conforms to Sections 23, 24, 25 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE TABLE IF NOT EXISTS clinical.assessments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL
    REFERENCES clinical.cases(id) ON DELETE CASCADE,
  clinician_id UUID
    REFERENCES identity.clinicians(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'completed', 'superseded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS clinical.observations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL
    REFERENCES clinical.cases(id) ON DELETE CASCADE,
  assessment_id UUID
    REFERENCES clinical.assessments(id) ON DELETE SET NULL,
  concept_code TEXT NOT NULL,
  observation_type TEXT NOT NULL DEFAULT 'symptom_score',
  numeric_value NUMERIC,
  text_value TEXT,
  boolean_value BOOLEAN,
  unit TEXT,
  instrument TEXT,
  quality_state system.data_quality_state NOT NULL DEFAULT 'unverified',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  entered_by UUID
    REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CHECK (
    num_nonnulls(
      numeric_value,
      text_value,
      boolean_value
    ) = 1
  )
);

CREATE TABLE IF NOT EXISTS clinical.functional_goals (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL
    REFERENCES clinical.cases(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  patient_priority SMALLINT
    CHECK (patient_priority BETWEEN 1 AND 5),
  clinician_priority SMALLINT
    CHECK (clinician_priority BETWEEN 1 AND 5),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_assessments_case ON clinical.assessments(case_id);
CREATE INDEX IF NOT EXISTS idx_observations_case ON clinical.observations(case_id);
CREATE INDEX IF NOT EXISTS idx_observations_assessment ON clinical.observations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_functional_goals_case ON clinical.functional_goals(case_id);
