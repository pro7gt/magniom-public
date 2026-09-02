-- 024_target_candidates.sql
-- Target Candidate persistence, candidate claims linkage, and counterargument enforcement
-- Conforms to Sections 50, 51, 52, 53, 70 of MAGNIOM-Supabase Database & Security Specification v1.0

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'candidate_status') THEN
    CREATE TYPE targeting.candidate_status AS ENUM (
      'generated',
      'eligible',
      'ineligible',
      'suppressed',
      'research_only'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS targeting.target_candidates (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL
    REFERENCES clinical.cases(id) ON DELETE CASCADE,
  phenotype_snapshot_id UUID NOT NULL
    REFERENCES clinical.phenotype_snapshots(id) ON DELETE RESTRICT,
  evidence_release_id UUID NOT NULL
    REFERENCES evidence.library_releases(id) ON DELETE RESTRICT,
  target_family_code TEXT NOT NULL,
  circuit_code TEXT NOT NULL,
  candidate_code TEXT NOT NULL,
  candidate_role targeting.candidate_role NOT NULL,
  target_method targeting.target_method NOT NULL,
  evidence_tier evidence.evidence_tier NOT NULL,
  status targeting.candidate_status NOT NULL DEFAULT 'generated',
  eligible BOOLEAN NOT NULL DEFAULT true,
  suppression_reason TEXT,
  subject_coordinate JSONB,
  mni_coordinate JSONB NOT NULL,
  surface_vertex JSONB,
  evidence_score NUMERIC(5,4) NOT NULL,
  phenotype_concordance_score NUMERIC(5,4) NOT NULL,
  connectome_refinement_score NUMERIC(5,4),
  overall_score NUMERIC(5,4) NOT NULL,
  rationale TEXT NOT NULL,
  counterarguments JSONB NOT NULL DEFAULT '[]'::jsonb,
  contraindications_or_conflicts JSONB NOT NULL DEFAULT '[]'::jsonb,
  convergence_profile JSONB,
  ranking_features JSONB,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT candidate_counterarguments_required
    CHECK (jsonb_typeof(counterarguments) = 'array'),
  CONSTRAINT unq_candidate_case_snapshot_code
    UNIQUE (case_id, phenotype_snapshot_id, candidate_code)
);

CREATE TABLE IF NOT EXISTS targeting.candidate_claims (
  target_candidate_id UUID NOT NULL
    REFERENCES targeting.target_candidates(id) ON DELETE CASCADE,
  claim_version_id UUID
    REFERENCES evidence.claim_versions(id) ON DELETE RESTRICT,
  claim_code TEXT NOT NULL,
  relationship TEXT NOT NULL
    CHECK (relationship IN ('supporting', 'conflicting', 'context')),
  PRIMARY KEY (target_candidate_id, claim_code, relationship)
);

CREATE INDEX IF NOT EXISTS idx_target_candidates_case ON targeting.target_candidates(case_id);
CREATE INDEX IF NOT EXISTS idx_target_candidates_org ON targeting.target_candidates(organisation_id);
CREATE INDEX IF NOT EXISTS idx_target_candidates_snapshot ON targeting.target_candidates(phenotype_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_candidate_claims_candidate ON targeting.candidate_claims(target_candidate_id);

-- Enable RLS
ALTER TABLE targeting.target_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE targeting.candidate_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "target_candidates_read_policy" ON targeting.target_candidates
  FOR SELECT TO authenticated
  USING (
    security.has_permission(organisation_id, 'target.read')
    OR EXISTS (
      SELECT 1 FROM identity.memberships m
      WHERE m.user_id = auth.uid()
        AND m.organisation_id = target_candidates.organisation_id
        AND m.active = true
    )
  );

CREATE POLICY "target_candidates_write_policy" ON targeting.target_candidates
  FOR ALL TO authenticated
  USING (
    security.has_permission(organisation_id, 'target.generate')
    OR EXISTS (
      SELECT 1 FROM identity.memberships m
      WHERE m.user_id = auth.uid()
        AND m.organisation_id = target_candidates.organisation_id
        AND m.active = true
        AND m.role IN ('tms_specialist', 'system_admin', 'service_worker')
    )
  )
  WITH CHECK (
    security.has_permission(organisation_id, 'target.generate')
    OR EXISTS (
      SELECT 1 FROM identity.memberships m
      WHERE m.user_id = auth.uid()
        AND m.organisation_id = target_candidates.organisation_id
        AND m.active = true
        AND m.role IN ('tms_specialist', 'system_admin', 'service_worker')
    )
  );

CREATE POLICY "candidate_claims_read_policy" ON targeting.candidate_claims
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "candidate_claims_write_policy" ON targeting.candidate_claims
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
