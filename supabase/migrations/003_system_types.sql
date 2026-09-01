-- 003_system_types.sql
-- System-wide enums and domain types
-- Conforms to Section 5 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE TYPE identity.app_role AS ENUM (
  'system_admin',
  'org_admin',
  'tms_specialist',
  'clinical_reviewer',
  'imaging_specialist',
  'evidence_reviewer',
  'auditor',
  'service_worker'
);

CREATE TYPE clinical.magniom_mode AS ENUM (
  'RESEARCH',
  'CLINICAL',
  'VALIDATION'
);

CREATE TYPE targeting.candidate_role AS ENUM (
  'PRIMARY_1',
  'PRIMARY_2',
  'PRIMARY_3',
  'ADDITIONAL_A',
  'ADDITIONAL_B',
  'RESERVE'
);

CREATE TYPE evidence.evidence_tier AS ENUM (
  'T1',
  'T2',
  'T3',
  'T4',
  'T_EXP'
);

CREATE TYPE targeting.target_method AS ENUM (
  'EVIDENCE_ONLY_PRIOR',
  'STRUCTURAL_ANATOMICAL',
  'CONNECTOME_REFINED',
  'ELECTRIC_FIELD_OPTIMIZED'
);

CREATE TYPE targeting.decision_type AS ENUM (
  'ACCEPTED_PRIMARY',
  'ACCEPTED_ADDITIONAL',
  'SUBSTITUTED_ALTERNATIVE',
  'MANUAL_OVERRIDE',
  'DEFERRED',
  'REJECTED'
);
