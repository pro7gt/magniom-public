-- 005_permissions.sql
-- Permissions tables, role mappings, and grants
-- Conforms to Sections 10, 16, 17, 68 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE TABLE IF NOT EXISTS identity.permissions (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS identity.role_permissions (
  role identity.app_role NOT NULL,
  permission_code TEXT NOT NULL
    REFERENCES identity.permissions(code) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (role, permission_code)
);

-- Seed canonical system permissions
INSERT INTO identity.permissions (code, description) VALUES
  ('case.read', 'View clinical case records and summaries'),
  ('case.create', 'Create new clinical cases'),
  ('case.update', 'Update clinical case metadata and notes'),
  ('phenotype.edit', 'Edit assessment observations and draft phenotypes'),
  ('phenotype.approve', 'Approve PhenotypeSnapshot formulation'),
  ('imaging.read', 'View neuroimaging studies, series, and artifacts'),
  ('imaging.upload', 'Upload neuroimaging files and DICOM packages'),
  ('imaging.qc_review', 'Review and approve neuroimaging quality control'),
  ('connectome.read', 'View functional connectome runs and metrics'),
  ('target.generate', 'Request algorithmic target slate generation'),
  ('target.read', 'View target candidates, slates, and convergence metrics'),
  ('target.review', 'Document clinical review on target candidates'),
  ('decision.create', 'Draft clinician target selection decision'),
  ('decision.sign', 'Sign immutable clinical target decision'),
  ('treatment.read', 'View treatment course and session logs'),
  ('treatment.write', 'Record treatment delivery details'),
  ('outcome.read', 'View clinical outcome assessments'),
  ('outcome.write', 'Record post-treatment outcome evaluations'),
  ('evidence.read', 'View evidence knowledge graph and circuit library'),
  ('evidence.draft', 'Draft evidence claims, circuits, and target families'),
  ('evidence.approve', 'Formally approve evidence library release'),
  ('research.read', 'View de-identified research cohorts'),
  ('research.export', 'Export research datasets'),
  ('organisation.manage', 'Manage organisation members, sites, and settings')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- Seed role-permission bindings
INSERT INTO identity.role_permissions (role, permission_code) VALUES
  -- TMS Specialist
  ('tms_specialist', 'case.read'),
  ('tms_specialist', 'case.create'),
  ('tms_specialist', 'case.update'),
  ('tms_specialist', 'phenotype.edit'),
  ('tms_specialist', 'phenotype.approve'),
  ('tms_specialist', 'imaging.read'),
  ('tms_specialist', 'imaging.qc_review'),
  ('tms_specialist', 'connectome.read'),
  ('tms_specialist', 'target.generate'),
  ('tms_specialist', 'target.read'),
  ('tms_specialist', 'target.review'),
  ('tms_specialist', 'decision.create'),
  ('tms_specialist', 'decision.sign'),
  ('tms_specialist', 'treatment.read'),
  ('tms_specialist', 'treatment.write'),
  ('tms_specialist', 'outcome.read'),
  ('tms_specialist', 'outcome.write'),
  ('tms_specialist', 'evidence.read'),

  -- Clinical Reviewer
  ('clinical_reviewer', 'case.read'),
  ('clinical_reviewer', 'case.create'),
  ('clinical_reviewer', 'case.update'),
  ('clinical_reviewer', 'phenotype.edit'),
  ('clinical_reviewer', 'phenotype.approve'),
  ('clinical_reviewer', 'imaging.read'),
  ('clinical_reviewer', 'connectome.read'),
  ('clinical_reviewer', 'target.read'),
  ('clinical_reviewer', 'target.review'),
  ('clinical_reviewer', 'decision.create'),
  ('clinical_reviewer', 'treatment.read'),
  ('clinical_reviewer', 'outcome.read'),
  ('clinical_reviewer', 'outcome.write'),
  ('clinical_reviewer', 'evidence.read'),

  -- Imaging Specialist
  ('imaging_specialist', 'case.read'),
  ('imaging_specialist', 'imaging.read'),
  ('imaging_specialist', 'imaging.upload'),
  ('imaging_specialist', 'imaging.qc_review'),
  ('imaging_specialist', 'connectome.read'),
  ('imaging_specialist', 'target.read'),
  ('imaging_specialist', 'evidence.read'),

  -- Researcher
  ('researcher', 'research.read'),
  ('researcher', 'research.export'),
  ('researcher', 'evidence.read'),

  -- Evidence Curator
  ('evidence_curator', 'evidence.read'),
  ('evidence_curator', 'evidence.draft'),

  -- Evidence Approver
  ('evidence_approver', 'evidence.read'),
  ('evidence_approver', 'evidence.draft'),
  ('evidence_approver', 'evidence.approve'),

  -- Organisation Admin
  ('organisation_admin', 'organisation.manage'),

  -- Service Worker
  ('service_worker', 'case.read'),
  ('service_worker', 'case.update'),
  ('service_worker', 'imaging.read'),
  ('service_worker', 'connectome.read'),
  ('service_worker', 'target.generate'),
  ('service_worker', 'target.read'),

  -- System Admin (Full Capabilities)
  ('system_admin', 'case.read'),
  ('system_admin', 'case.create'),
  ('system_admin', 'case.update'),
  ('system_admin', 'phenotype.edit'),
  ('system_admin', 'phenotype.approve'),
  ('system_admin', 'imaging.read'),
  ('system_admin', 'imaging.upload'),
  ('system_admin', 'imaging.qc_review'),
  ('system_admin', 'connectome.read'),
  ('system_admin', 'target.generate'),
  ('system_admin', 'target.read'),
  ('system_admin', 'target.review'),
  ('system_admin', 'decision.create'),
  ('system_admin', 'decision.sign'),
  ('system_admin', 'treatment.read'),
  ('system_admin', 'treatment.write'),
  ('system_admin', 'outcome.read'),
  ('system_admin', 'outcome.write'),
  ('system_admin', 'evidence.read'),
  ('system_admin', 'evidence.draft'),
  ('system_admin', 'evidence.approve'),
  ('system_admin', 'research.read'),
  ('system_admin', 'research.export'),
  ('system_admin', 'organisation.manage')
ON CONFLICT (role, permission_code) DO NOTHING;

-- Schema usage grants
GRANT USAGE ON SCHEMA identity, clinical, phenotype, evidence, targeting, treatment_outcomes, workflow, audit, system, security, api TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA identity, clinical, phenotype, evidence, targeting, treatment_outcomes, workflow, audit, system, security, api TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA identity, clinical, phenotype, evidence, targeting, treatment_outcomes, workflow, audit, system, security, api TO authenticated;

