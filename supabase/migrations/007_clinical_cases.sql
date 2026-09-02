-- 007_clinical_cases.sql
-- Patient identity and clinical cases with optimistic concurrency versioning
-- Conforms to Sections 20, 21, 22 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE TABLE IF NOT EXISTS clinical.patients (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  site_id UUID
    REFERENCES identity.sites(id) ON DELETE SET NULL,
  external_record_number TEXT,
  given_name TEXT,
  family_name TEXT,
  display_label TEXT NOT NULL,
  date_of_birth DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived')),
  synthetic BOOLEAN NOT NULL DEFAULT false,
  created_by UUID
    REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (organisation_id, external_record_number)
);

CREATE TABLE IF NOT EXISTS clinical.cases (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  site_id UUID
    REFERENCES identity.sites(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL
    REFERENCES clinical.patients(id) ON DELETE RESTRICT,
  case_code TEXT NOT NULL,
  state clinical.case_state NOT NULL DEFAULT 'draft',
  indication_code TEXT NOT NULL DEFAULT 'MDD',
  mode system.magniom_mode NOT NULL DEFAULT 'clinical',
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  current_phenotype_snapshot_id UUID,
  current_target_slate_id UUID,
  created_by UUID
    REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  closed_at TIMESTAMPTZ,
  UNIQUE (organisation_id, case_code)
);

CREATE INDEX IF NOT EXISTS idx_patients_org ON clinical.patients(organisation_id);
CREATE INDEX IF NOT EXISTS idx_patients_site ON clinical.patients(site_id);
CREATE INDEX IF NOT EXISTS idx_cases_org ON clinical.cases(organisation_id);
CREATE INDEX IF NOT EXISTS idx_cases_patient ON clinical.cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_cases_state ON clinical.cases(state);
