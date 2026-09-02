-- 040_full_rls_hardening.sql
-- Comprehensive Row Level Security (RLS) hardening across all 11 Magniom schemas and tables
-- Conforms to MAGNIOM-Supabase Database & Security Specification v1.0
-- (Sections 2, 5, 6, 16-19, 60-75, 80-86, 97-110, 128-141, 165-166)
-- and MAGNIOM-System Requirements Specification v1.0 (MAG-SEC-001 through MAG-SEC-035)

-- ============================================================================
-- 1. Ensure RLS is Enabled on ALL Relational Schemas
-- ============================================================================

DO $$
DECLARE
  t RECORD;
BEGIN
  -- Loop through all tables in application schemas and enable RLS
  FOR t IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN (
      'identity', 'clinical', 'imaging', 'connectomics', 'evidence',
      'targeting', 'treatment', 'outcomes', 'workflow', 'audit', 'security', 'system'
    )
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', t.schemaname, t.tablename);
    EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY;', t.schemaname, t.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- 2. Enhanced Security Helpers (Hardened SECURITY DEFINER with search_path = '')
-- ============================================================================

CREATE OR REPLACE FUNCTION security.current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION security.current_user_has_case_access(
  p_case_id UUID,
  p_required_permission TEXT DEFAULT 'case.read'
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM clinical.cases c
    JOIN identity.memberships m
      ON m.organisation_id = c.organisation_id
    JOIN identity.role_permissions rp
      ON rp.role = m.role
    WHERE c.id = p_case_id
      AND m.user_id = auth.uid()
      AND m.active = true
      AND (m.site_id IS NULL OR c.site_id IS NULL OR m.site_id = c.site_id)
      AND rp.permission_code = p_required_permission
  );
$$;

CREATE OR REPLACE FUNCTION security.current_user_has_org_access(
  p_org_id UUID,
  p_required_permission TEXT DEFAULT 'case.read'
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM identity.memberships m
    JOIN identity.role_permissions rp
      ON rp.role = m.role
    WHERE m.organisation_id = p_org_id
      AND m.user_id = auth.uid()
      AND m.active = true
      AND rp.permission_code = p_required_permission
  );
$$;

CREATE OR REPLACE FUNCTION security.is_service_worker()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM identity.memberships
    WHERE user_id = auth.uid()
      AND role = 'service_worker'::identity.app_role
      AND active = true
  );
$$;

-- ============================================================================
-- 3. Immutability Triggers for Sealed Scientific & Clinical Records
-- ============================================================================

CREATE OR REPLACE FUNCTION security.enforce_immutable_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'MAG-SEC-024: Table % is immutable. % operation is strictly prohibited.',
      TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME, TG_OP
      USING ERRCODE = '55000';
  END IF;
  RETURN NULL;
END;
$$;

-- Apply immutability trigger to sealed clinical tables
DROP TRIGGER IF EXISTS trg_immutable_phenotype_snapshots ON clinical.phenotype_snapshots;
CREATE TRIGGER trg_immutable_phenotype_snapshots
BEFORE UPDATE OR DELETE ON clinical.phenotype_snapshots
FOR EACH ROW EXECUTE FUNCTION security.enforce_immutable_record();

DROP TRIGGER IF EXISTS trg_immutable_target_slates ON targeting.target_slates;
CREATE TRIGGER trg_immutable_target_slates
BEFORE UPDATE OR DELETE ON targeting.target_slates
FOR EACH ROW EXECUTE FUNCTION security.enforce_immutable_record();

DROP TRIGGER IF EXISTS trg_immutable_target_slate_items ON targeting.target_slate_items;
CREATE TRIGGER trg_immutable_target_slate_items
BEFORE UPDATE OR DELETE ON targeting.target_slate_items
FOR EACH ROW EXECUTE FUNCTION security.enforce_immutable_record();

DROP TRIGGER IF EXISTS trg_immutable_suppressed_candidates ON targeting.suppressed_candidates;
CREATE TRIGGER trg_immutable_suppressed_candidates
BEFORE UPDATE OR DELETE ON targeting.suppressed_candidates
FOR EACH ROW EXECUTE FUNCTION security.enforce_immutable_record();

DROP TRIGGER IF EXISTS trg_immutable_clinician_decisions ON targeting.clinician_decisions;
CREATE TRIGGER trg_immutable_clinician_decisions
BEFORE UPDATE OR DELETE ON targeting.clinician_decisions
FOR EACH ROW EXECUTE FUNCTION security.enforce_immutable_record();

DROP TRIGGER IF EXISTS trg_immutable_candidate_decisions ON targeting.candidate_decisions;
CREATE TRIGGER trg_immutable_candidate_decisions
BEFORE UPDATE OR DELETE ON targeting.candidate_decisions
FOR EACH ROW EXECUTE FUNCTION security.enforce_immutable_record();

DROP TRIGGER IF EXISTS trg_immutable_final_targets ON targeting.final_targets;
CREATE TRIGGER trg_immutable_final_targets
BEFORE UPDATE OR DELETE ON targeting.final_targets
FOR EACH ROW EXECUTE FUNCTION security.enforce_immutable_record();

DROP TRIGGER IF EXISTS trg_immutable_audit_events ON audit.events;
CREATE TRIGGER trg_immutable_audit_events
BEFORE UPDATE OR DELETE ON audit.events
FOR EACH ROW EXECUTE FUNCTION security.enforce_immutable_record();

-- ============================================================================
-- 4. Evidence & Scientific Policy Immutability & Access Policies
-- ============================================================================

-- Evidence library releases policy
DROP POLICY IF EXISTS p_evidence_releases_read ON evidence.library_releases;
CREATE POLICY p_evidence_releases_read ON evidence.library_releases
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS p_evidence_releases_write ON evidence.library_releases;
CREATE POLICY p_evidence_releases_write ON evidence.library_releases
FOR ALL TO authenticated
USING (security.has_role('system_admin'::identity.app_role) OR security.has_role('evidence_curator'::identity.app_role));

-- Evidence claims policy
DROP POLICY IF EXISTS p_claim_series_read ON evidence.claim_series;
CREATE POLICY p_claim_series_read ON evidence.claim_series
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS p_claim_versions_read ON evidence.claim_versions;
CREATE POLICY p_claim_versions_read ON evidence.claim_versions
FOR SELECT TO authenticated
USING (true);

-- Evidence circuits & target families
DROP POLICY IF EXISTS p_circuit_series_read ON evidence.circuit_series;
CREATE POLICY p_circuit_series_read ON evidence.circuit_series
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS p_circuit_versions_read ON evidence.circuit_versions;
CREATE POLICY p_circuit_versions_read ON evidence.circuit_versions
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS p_target_family_series_read ON evidence.target_family_series;
CREATE POLICY p_target_family_series_read ON evidence.target_family_series
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS p_target_family_versions_read ON evidence.target_family_versions;
CREATE POLICY p_target_family_versions_read ON evidence.target_family_versions
FOR SELECT TO authenticated
USING (true);

-- ============================================================================
-- 5. Imaging & Connectomics Access Policies (Scoped to Organisation & Case)
-- ============================================================================

DROP POLICY IF EXISTS p_imaging_studies_read ON imaging.studies;
CREATE POLICY p_imaging_studies_read ON imaging.studies
FOR SELECT TO authenticated
USING (
  security.current_user_has_case_access(case_id, 'case.read')
  OR security.is_system_admin()
  OR security.is_service_worker()
);

DROP POLICY IF EXISTS p_imaging_studies_insert ON imaging.studies;
CREATE POLICY p_imaging_studies_insert ON imaging.studies
FOR INSERT TO authenticated
WITH CHECK (
  security.current_user_has_case_access(case_id, 'imaging.upload')
  OR security.is_service_worker()
);

DROP POLICY IF EXISTS p_imaging_series_read ON imaging.series;
CREATE POLICY p_imaging_series_read ON imaging.series
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM imaging.studies s
    WHERE s.id = imaging.series.study_id
      AND (
        security.current_user_has_case_access(s.case_id, 'case.read')
        OR security.is_system_admin()
        OR security.is_service_worker()
      )
  )
);

DROP POLICY IF EXISTS p_imaging_artifacts_read ON imaging.artifacts;
CREATE POLICY p_imaging_artifacts_read ON imaging.artifacts
FOR SELECT TO authenticated
USING (
  security.current_user_has_case_access(case_id, 'case.read')
  OR security.is_system_admin()
  OR security.is_service_worker()
);

DROP POLICY IF EXISTS p_imaging_artifacts_write ON imaging.artifacts;
CREATE POLICY p_imaging_artifacts_write ON imaging.artifacts
FOR INSERT TO authenticated
WITH CHECK (
  security.current_user_has_case_access(case_id, 'imaging.upload')
  OR security.is_service_worker()
);

DROP POLICY IF EXISTS p_qc_runs_read ON imaging.qc_runs;
CREATE POLICY p_qc_runs_read ON imaging.qc_runs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM imaging.studies s
    WHERE s.id = imaging.qc_runs.study_id
      AND (
        security.current_user_has_case_access(s.case_id, 'case.read')
        OR security.is_system_admin()
        OR security.is_service_worker()
      )
  )
);

DROP POLICY IF EXISTS p_connectomics_runs_read ON connectomics.processing_runs;
CREATE POLICY p_connectomics_runs_read ON connectomics.processing_runs
FOR SELECT TO authenticated
USING (
  security.current_user_has_case_access(case_id, 'case.read')
  OR security.is_system_admin()
  OR security.is_service_worker()
);

DROP POLICY IF EXISTS p_connectomics_runs_write ON connectomics.processing_runs;
CREATE POLICY p_connectomics_runs_write ON connectomics.processing_runs
FOR ALL TO authenticated
USING (
  security.current_user_has_case_access(case_id, 'target.generate')
  OR security.is_service_worker()
);

DROP POLICY IF EXISTS p_connectivity_metrics_read ON connectomics.connectivity_metrics;
CREATE POLICY p_connectivity_metrics_read ON connectomics.connectivity_metrics
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM connectomics.processing_runs pr
    WHERE pr.id = connectomics.connectivity_metrics.run_id
      AND (
        security.current_user_has_case_access(pr.case_id, 'case.read')
        OR security.is_system_admin()
        OR security.is_service_worker()
      )
  )
);

DROP POLICY IF EXISTS p_circuit_metrics_read ON connectomics.circuit_metrics;
CREATE POLICY p_circuit_metrics_read ON connectomics.circuit_metrics
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM connectomics.processing_runs pr
    WHERE pr.id = connectomics.circuit_metrics.run_id
      AND (
        security.current_user_has_case_access(pr.case_id, 'case.read')
        OR security.is_system_admin()
        OR security.is_service_worker()
      )
  )
);

-- ============================================================================
-- 6. Workflow, Outbox and System Tables Policies
-- ============================================================================

DROP POLICY IF EXISTS p_workflow_jobs_read ON workflow.jobs;
CREATE POLICY p_workflow_jobs_read ON workflow.jobs
FOR SELECT TO authenticated
USING (
  (case_id IS NOT NULL AND security.current_user_has_case_access(case_id, 'case.read'))
  OR (organisation_id IS NOT NULL AND security.current_user_has_org_access(organisation_id, 'case.read'))
  OR security.is_system_admin()
  OR security.is_service_worker()
);

DROP POLICY IF EXISTS p_workflow_jobs_write ON workflow.jobs;
CREATE POLICY p_workflow_jobs_write ON workflow.jobs
FOR ALL TO authenticated
USING (
  (case_id IS NOT NULL AND security.current_user_has_case_access(case_id, 'target.generate'))
  OR security.is_service_worker()
  OR security.is_system_admin()
);

DROP POLICY IF EXISTS p_workflow_outbox_read ON workflow.outbox;
CREATE POLICY p_workflow_outbox_read ON workflow.outbox
FOR SELECT TO authenticated
USING (
  security.is_service_worker()
  OR security.is_system_admin()
);

DROP POLICY IF EXISTS p_workflow_outbox_write ON workflow.outbox;
CREATE POLICY p_workflow_outbox_write ON workflow.outbox
FOR ALL TO authenticated
USING (
  security.is_service_worker()
  OR security.is_system_admin()
);

-- ============================================================================
-- 7. Anonymous Block / Default Deny Confirmation
-- ============================================================================

-- Explicit REVOKE from anon on sensitive schemas
REVOKE ALL ON ALL TABLES IN SCHEMA clinical FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA imaging FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA connectomics FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA targeting FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA workflow FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA audit FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA identity FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA security FROM anon;
