-- 064_evidence_library_v2_graph.sql
-- Evidence Knowledge Graph v2 Core Relational Tables
-- Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§6, 7, 10, 11, 12, 75, 90)

-- 1. Source Findings (Granular empirical findings extracted from sources)
CREATE TABLE IF NOT EXISTS evidence.source_findings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES evidence.sources(id) ON DELETE RESTRICT,
  finding_type TEXT NOT NULL CHECK (finding_type IN (
    'primary_outcome', 'secondary_outcome', 'subgroup', 'target_comparison',
    'safety', 'durability', 'guideline_recommendation', 'meta_analytic_estimate',
    'null_result', 'limitation'
  )),
  finding_statement TEXT NOT NULL,
  effect_estimate JSONB,
  population_id UUID,
  target_family_ids UUID[] DEFAULT '{}',
  treatment_context_ids UUID[] DEFAULT '{}',
  followup_interval JSONB,
  extraction_status TEXT NOT NULL DEFAULT 'single_curator' CHECK (extraction_status IN ('single_curator', 'double_checked', 'adjudicated')),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Claim Evidence Syntheses (Dimensional multi-attribute synthesis)
CREATE TABLE IF NOT EXISTS evidence.claim_syntheses (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  evidence_claim_id UUID NOT NULL,
  directness TEXT NOT NULL CHECK (directness IN ('strong', 'moderate', 'limited', 'uncertain')),
  replication TEXT NOT NULL CHECK (replication IN ('multiple_independent', 'replicated', 'single_source', 'mixed', 'not_assessable')),
  study_design_strength TEXT NOT NULL CHECK (study_design_strength IN ('strong', 'moderate', 'limited', 'uncertain')),
  sample_support TEXT NOT NULL CHECK (sample_support IN ('strong', 'moderate', 'limited', 'uncertain')),
  consistency TEXT NOT NULL CHECK (consistency IN ('consistent', 'mostly_consistent', 'mixed', 'mostly_negative', 'uncertain')),
  clinical_applicability TEXT NOT NULL CHECK (clinical_applicability IN ('direct', 'partial', 'limited', 'uncertain')),
  target_specificity TEXT NOT NULL CHECK (target_specificity IN ('specific', 'moderate', 'broad', 'uncertain')),
  treatment_context_dependence TEXT NOT NULL CHECK (treatment_context_dependence IN ('material', 'possible', 'minimal', 'unknown')),
  synthesis_statement TEXT NOT NULL,
  governance_tier_recommendation TEXT CHECK (governance_tier_recommendation IN ('A', 'B', 'C', 'D', 'R')),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Source Contributions (Binding sources & findings to versioned claims with overlap tracking)
CREATE TABLE IF NOT EXISTS evidence.source_contributions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  evidence_claim_id UUID NOT NULL,
  source_id UUID NOT NULL REFERENCES evidence.sources(id) ON DELETE RESTRICT,
  source_finding_ids UUID[] DEFAULT '{}',
  relationship TEXT NOT NULL CHECK (relationship IN (
    'supports', 'partially_supports', 'conflicts', 'does_not_support', 'limits_generalisation'
  )),
  independence TEXT NOT NULL DEFAULT 'independent' CHECK (independence IN (
    'independent', 'partially_overlapping', 'overlapping_dataset', 'unknown'
  )),
  relevance TEXT NOT NULL DEFAULT 'direct' CHECK (relevance IN ('direct', 'indirect', 'contextual')),
  curator_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Claim Conflict Sets (Formalized contestable scientific conflicts)
CREATE TABLE IF NOT EXISTS evidence.claim_conflicts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  subject_claim_id UUID NOT NULL,
  supporting_claim_ids UUID[] NOT NULL DEFAULT '{}',
  conflicting_claim_ids UUID[] NOT NULL DEFAULT '{}',
  conflict_type TEXT NOT NULL CHECK (conflict_type IN (
    'effect_direction', 'effect_magnitude', 'population', 'target',
    'protocol', 'durability', 'outcome_definition', 'methodology'
  )),
  reconciliation_status TEXT NOT NULL DEFAULT 'unresolved' CHECK (reconciliation_status IN (
    'unresolved', 'partially_explained', 'resolved'
  )),
  explanation TEXT,
  reviewed_by UUID[] DEFAULT '{}',
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Evidence Questions (Scoped clinical-scientific evidence questions)
CREATE TABLE IF NOT EXISTS evidence.evidence_questions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  indication_id UUID NOT NULL,
  population JSONB NOT NULL DEFAULT '{}'::jsonb,
  clinical_objective_id UUID NOT NULL,
  intervention JSONB,
  target_family_id TEXT,
  targeting_strategy_id TEXT,
  treatment_context_id UUID,
  comparator JSONB,
  outcome_domains UUID[] DEFAULT '{}',
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open', 'under_review', 'answered_provisionally', 'closed'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Evolution of claim_versions for v2 EvidenceClaim support (no mandatory tier)
DO $$
BEGIN
  -- Make evidence_tier nullable for v2 claims where tier is governed separately
  ALTER TABLE evidence.claim_versions ALTER COLUMN evidence_tier DROP NOT NULL;
  
  -- Add lifecycle_status and direction columns if not present
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'evidence' AND table_name = 'claim_versions' AND column_name = 'lifecycle_status'
  ) THEN
    ALTER TABLE evidence.claim_versions ADD COLUMN lifecycle_status TEXT NOT NULL DEFAULT 'approved_scientific_claim'
      CHECK (lifecycle_status IN ('draft', 'under_review', 'approved_scientific_claim', 'rejected', 'deprecated', 'superseded'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'evidence' AND table_name = 'claim_versions' AND column_name = 'direction'
  ) THEN
    ALTER TABLE evidence.claim_versions ADD COLUMN direction TEXT NOT NULL DEFAULT 'supports'
      CHECK (direction IN ('supports', 'does_not_support', 'mixed', 'context_dependent', 'uncertain'));
  END IF;
END $$;

-- 7. Immutability trigger for source findings and claim syntheses
CREATE OR REPLACE FUNCTION evidence.prevent_source_finding_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.extraction_status = 'adjudicated') THEN
    RAISE EXCEPTION 'Adjudicated SourceFinding rows are immutable. Create a new finding or revised finding instead.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_source_findings_immutable ON evidence.source_findings;
CREATE TRIGGER trg_source_findings_immutable
  BEFORE UPDATE ON evidence.source_findings
  FOR EACH ROW EXECUTE FUNCTION evidence.prevent_source_finding_mutation();

-- 8. Indexes for efficient lookup
CREATE INDEX IF NOT EXISTS idx_source_findings_source ON evidence.source_findings(source_id);
CREATE INDEX IF NOT EXISTS idx_source_findings_type ON evidence.source_findings(finding_type);
CREATE INDEX IF NOT EXISTS idx_claim_syntheses_claim ON evidence.claim_syntheses(evidence_claim_id);
CREATE INDEX IF NOT EXISTS idx_source_contributions_claim ON evidence.source_contributions(evidence_claim_id);
CREATE INDEX IF NOT EXISTS idx_source_contributions_source ON evidence.source_contributions(source_id);
CREATE INDEX IF NOT EXISTS idx_claim_conflicts_subject ON evidence.claim_conflicts(subject_claim_id);
CREATE INDEX IF NOT EXISTS idx_evidence_questions_indication ON evidence.evidence_questions(indication_id);

-- 9. Row Level Security
ALTER TABLE evidence.source_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.claim_syntheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.source_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.claim_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.evidence_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "source_findings_read_policy" ON evidence.source_findings FOR SELECT TO authenticated USING (true);
CREATE POLICY "claim_syntheses_read_policy" ON evidence.claim_syntheses FOR SELECT TO authenticated USING (true);
CREATE POLICY "source_contributions_read_policy" ON evidence.source_contributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "claim_conflicts_read_policy" ON evidence.claim_conflicts FOR SELECT TO authenticated USING (true);
CREATE POLICY "evidence_questions_read_policy" ON evidence.evidence_questions FOR SELECT TO authenticated USING (true);

CREATE POLICY "source_findings_write_policy" ON evidence.source_findings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "claim_syntheses_write_policy" ON evidence.claim_syntheses FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "source_contributions_write_policy" ON evidence.source_contributions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "claim_conflicts_write_policy" ON evidence.claim_conflicts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "evidence_questions_write_policy" ON evidence.evidence_questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));
