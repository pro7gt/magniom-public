-- 052_evidence_paths_and_governance.sql
-- Step 10 in Section 18: Evidence Governance Classifications and Evidence Paths
-- Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§7, 95)

CREATE TABLE IF NOT EXISTS evidence.governance_classifications (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  evidence_claim_id UUID NOT NULL,
  claim_version TEXT NOT NULL,
  classification_status TEXT NOT NULL CHECK (classification_status IN ('unassigned', 'under_review', 'assigned', 'deferred', 'withdrawn')),
  magniom_evidence_tier TEXT CHECK (magniom_evidence_tier IN ('A', 'B', 'C', 'D', 'R')),
  permitted_roles JSONB NOT NULL DEFAULT '{"standalone_primary": true, "standalone_additional": true, "supporting_context": true, "refinement_of_parent_claims": true, "research_candidate_generation": true}'::jsonb,
  reviewer_ids UUID[] NOT NULL DEFAULT '{}',
  rationale TEXT,
  supporting_synthesis_id UUID,
  assigned_at TIMESTAMPTZ,
  supersedes_classification_id UUID REFERENCES evidence.governance_classifications(id) ON DELETE SET NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS evidence.evidence_paths (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  indication_module_release_id UUID NOT NULL REFERENCES clinical.indication_module_releases(id) ON DELETE RESTRICT,
  evidence_claim_ids UUID[] NOT NULL,
  population_id UUID NOT NULL,
  clinical_objective_id UUID NOT NULL,
  disease_stage_id UUID,
  therapeutic_circuit_id UUID REFERENCES evidence.circuits(id) ON DELETE SET NULL,
  target_family_id TEXT NOT NULL,
  targeting_strategy_id TEXT NOT NULL,
  target_geometry_type TEXT NOT NULL CHECK (target_geometry_type IN ('point', 'surface_roi', 'volumetric_roi', 'somatotopic', 'coil_field', 'network')),
  treatment_context_requirement_ids UUID[] DEFAULT '{}',
  governance_classification_ids UUID[] NOT NULL DEFAULT '{}',
  path_status TEXT NOT NULL CHECK (path_status IN ('staging', 'research_permitted', 'validation_permitted', 'clinical_permitted', 'suspended')),
  scientific_policy_release_id UUID,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Immutability enforcement trigger
CREATE OR REPLACE FUNCTION evidence.prevent_evidence_path_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.path_status = 'clinical_permitted') THEN
    RAISE EXCEPTION 'EvidencePath is immutable once clinical_permitted. Create a new evidence path version.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_evidence_paths_immutable ON evidence.evidence_paths;
CREATE TRIGGER trg_evidence_paths_immutable
  BEFORE UPDATE ON evidence.evidence_paths
  FOR EACH ROW EXECUTE FUNCTION evidence.prevent_evidence_path_mutation();

CREATE INDEX IF NOT EXISTS idx_governance_classifications_claim ON evidence.governance_classifications(evidence_claim_id);
CREATE INDEX IF NOT EXISTS idx_evidence_paths_module ON evidence.evidence_paths(indication_module_release_id);

-- Enable Row Level Security
ALTER TABLE evidence.governance_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.evidence_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "governance_classifications_read_policy" ON evidence.governance_classifications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "evidence_paths_read_policy" ON evidence.evidence_paths
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "governance_classifications_write_policy" ON evidence.governance_classifications
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "evidence_paths_write_policy" ON evidence.evidence_paths
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));
