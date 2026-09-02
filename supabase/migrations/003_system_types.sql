-- 003_system_types.sql
-- System-wide enums and domain types
-- Conforms to Section 5, 9, 10 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE TYPE identity.app_role AS ENUM (
  'tms_specialist',
  'clinical_reviewer',
  'imaging_specialist',
  'researcher',
  'evidence_curator',
  'evidence_approver',
  'organisation_admin',
  'service_worker',
  'system_admin'
);

CREATE TYPE system.magniom_mode AS ENUM (
  'clinical',
  'research',
  'validation'
);

CREATE TYPE system.qualitative_confidence AS ENUM (
  'high',
  'moderate',
  'low',
  'not_assessable'
);

CREATE TYPE system.data_quality_state AS ENUM (
  'verified',
  'reviewed',
  'unverified',
  'incomplete',
  'invalid'
);

CREATE TYPE clinical.case_state AS ENUM (
  'draft',
  'phenotype_ready',
  'phenotype_approved',
  'imaging_pending',
  'imaging_processing',
  'connectome_ready',
  'target_generation_pending',
  'target_generating',
  'target_slate_ready',
  'clinician_review',
  'decision_signed',
  'personalisation_abstained',
  'targeting_abstained',
  'decision_deferred',
  'superseded',
  'closed'
);

CREATE TYPE clinical.snapshot_state AS ENUM (
  'draft',
  'ready_for_review',
  'approved',
  'superseded'
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

