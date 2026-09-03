-- 058_module_qualification_records.sql
-- Step 16 in Section 18: Module Qualification Records
-- Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§5-8)

CREATE TABLE IF NOT EXISTS clinical.module_qualification_records (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  indication_module_release_id UUID NOT NULL
    REFERENCES clinical.indication_module_releases(id) ON DELETE RESTRICT,
  qualification_level TEXT NOT NULL CHECK (qualification_level IN ('Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8')),
  evaluation_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  evaluator_ids UUID[] NOT NULL DEFAULT '{}',
  prerequisite_evidence_refs TEXT[] NOT NULL DEFAULT '{}',
  findings JSONB NOT NULL DEFAULT '{}'::jsonb,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'conditional', 'rejected', 'deferred')),
  rationale TEXT NOT NULL,
  sign_off_hash BYTEA NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Immutability enforcement trigger for qualification decisions
CREATE OR REPLACE FUNCTION clinical.prevent_qualification_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.decision = 'approved') THEN
    RAISE EXCEPTION 'Approved ModuleQualificationRecord is immutable. Create a new evaluation record.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_module_qualification_immutable ON clinical.module_qualification_records;
CREATE TRIGGER trg_module_qualification_immutable
  BEFORE UPDATE ON clinical.module_qualification_records
  FOR EACH ROW EXECUTE FUNCTION clinical.prevent_qualification_mutation();

CREATE INDEX IF NOT EXISTS idx_qualification_module ON clinical.module_qualification_records(indication_module_release_id);

-- Enable Row Level Security
ALTER TABLE clinical.module_qualification_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "module_qualification_read_policy" ON clinical.module_qualification_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "module_qualification_write_policy" ON clinical.module_qualification_records
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_approver')));
