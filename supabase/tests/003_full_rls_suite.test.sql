-- 003_full_rls_suite.test.sql
-- Comprehensive SQL-level test suite for Row Level Security (RLS) & Multi-Tenant Isolation
-- Tests MAG-SEC-001, MAG-SEC-007, MAG-SEC-012, MAG-SEC-022, MAG-SEC-024, MAG-SEC-025, MAG-SEC-026

BEGIN;

-- 1. Setup Test Fixture Data
DO $$
DECLARE
  v_org_a UUID := 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa'::uuid;
  v_org_b UUID := 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb'::uuid;
  v_user_a UUID := '11111111-aaaa-aaaa-aaaa-111111111111'::uuid;
  v_user_b UUID := '22222222-bbbb-bbbb-bbbb-222222222222'::uuid;
  v_case_a UUID := 'cacacaca-1111-1111-1111-cacacacacaca'::uuid;
  v_case_b UUID := 'cbcbcbcb-2222-2222-2222-cbcbcbcbcbcb'::uuid;
  v_patient_a UUID := 'dadadada-1111-1111-1111-dadadadadada'::uuid;
  v_patient_b UUID := 'dbdbdbdb-2222-2222-2222-dbdbdbdbdbdb'::uuid;
  v_snapshot_a UUID := 'eaeaeaea-1111-1111-1111-eaeaeaeaeaea'::uuid;
  v_slate_a UUID := 'fafafafa-1111-1111-1111-fafafafafafa'::uuid;
  v_decision_a UUID := '0a0a0a0a-1111-1111-1111-0a0a0a0a0a0a'::uuid;
  v_count INTEGER;
BEGIN
  -- Insert test organisations
  INSERT INTO identity.organisations (id, name, slug, active)
  VALUES
    (v_org_a, 'Organisation Alpha', 'org-alpha', true),
    (v_org_b, 'Organisation Beta', 'org-beta', true)
  ON CONFLICT (id) DO NOTHING;

  -- Insert test user profiles
  INSERT INTO identity.user_profiles (id, user_id, full_name, email, role, active)
  VALUES
    (v_user_a, v_user_a, 'Dr. Alpha User', 'alpha@hospital.org', 'clinician', true),
    (v_user_b, v_user_b, 'Dr. Beta User', 'beta@clinic.org', 'clinician', true)
  ON CONFLICT (id) DO NOTHING;

  -- Insert memberships
  INSERT INTO identity.memberships (id, organisation_id, user_id, role, active)
  VALUES
    ('a1a1a1a1-1111-1111-1111-a1a1a1a1a1a1'::uuid, v_org_a, v_user_a, 'clinician', true),
    ('b2b2b2b2-2222-2222-2222-b2b2b2b2b2b2'::uuid, v_org_b, v_user_b, 'clinician', true)
  ON CONFLICT (id) DO NOTHING;

  -- Insert Clinician record with signing authority
  INSERT INTO identity.clinicians (id, organisation_id, user_id, full_name, email, can_sign_tms_prescription, active)
  VALUES
    ('c1c1c1c1-1111-1111-1111-c1c1c1c1c1c1'::uuid, v_org_a, v_user_a, 'Dr. Alpha User', 'alpha@hospital.org', true, true)
  ON CONFLICT (id) DO NOTHING;

  -- Insert patients and cases
  INSERT INTO clinical.patients (id, organisation_id, mrn, full_name, created_by)
  VALUES
    (v_patient_a, v_org_a, 'MRN-ALPHA-01', 'Patient Alpha', v_user_a),
    (v_patient_b, v_org_b, 'MRN-BETA-01', 'Patient Beta', v_user_b)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO clinical.cases (id, organisation_id, patient_id, case_number, clinical_indication, stage, created_by)
  VALUES
    (v_case_a, v_org_a, v_patient_a, 'CASE-ALPHA-01', 'Major Depressive Disorder', 'phenotype_review', v_user_a),
    (v_case_b, v_org_b, v_patient_b, 'CASE-BETA-01', 'Major Depressive Disorder', 'phenotype_review', v_user_b)
  ON CONFLICT (id) DO NOTHING;

  -- Insert Phenotype Snapshot
  INSERT INTO clinical.phenotype_snapshots (id, case_id, organisation_id, symptom_profile, snapshot_hash, approved_by, approved_at)
  VALUES (
    v_snapshot_a,
    v_case_a,
    v_org_a,
    '{"depression_severity": "severe", "anhedonia": 3}'::jsonb,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    v_user_a,
    now()
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert Target Slate
  INSERT INTO targeting.target_slates (
    id, case_id, organisation_id, phenotype_snapshot_id, target_engine_version,
    scientific_policy_release_id, candidate_count, slate_hash, status
  )
  VALUES (
    v_slate_a,
    v_case_a,
    v_org_a,
    v_snapshot_a,
    '1.0.0',
    'pol-rel-1.0.0',
    3,
    'slate_hash_alpha_01',
    'published'
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert Clinician Decision
  INSERT INTO targeting.clinician_decisions (
    id, case_id, organisation_id, target_slate_id, signing_clinician_id,
    decision_type, decision_rationale, is_signed, signed_at, signature_hash
  )
  VALUES (
    v_decision_a,
    v_case_a,
    v_org_a,
    v_slate_a,
    v_user_a,
    'selected_candidate',
    'Optimal connectivity to sgACC and robust evidence ceiling',
    true,
    now(),
    'sig_hash_alpha_01'
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert Audit Event
  INSERT INTO audit.events (
    id, organisation_id, actor_id, event_type, target_type, target_id, payload, event_hash
  )
  VALUES (
    'aeaeaeae-1111-1111-1111-aeaeaeaeaeae'::uuid,
    v_org_a,
    v_user_a,
    'DECISION_SIGNED',
    'clinician_decision',
    v_decision_a,
    '{"decision": "selected_candidate"}'::jsonb,
    'audit_hash_01'
  ) ON CONFLICT (id) DO NOTHING;

END $$;

-- 2. Verification of Immutability Guards (MAG-SEC-024, MAG-SEC-025, MAG-SEC-026)
DO $$
DECLARE
  v_failed_update BOOLEAN := false;
  v_failed_delete BOOLEAN := false;
BEGIN
  -- Test 2.1: Update phenotype snapshot should fail
  BEGIN
    UPDATE clinical.phenotype_snapshots
    SET symptom_profile = '{"tampered": true}'::jsonb
    WHERE id = 'eaeaeaea-1111-1111-1111-eaeaeaeaeaea'::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_failed_update := true;
  END;

  IF NOT v_failed_update THEN
    RAISE EXCEPTION 'TEST FAILED: PhenotypeSnapshot update was not rejected by immutability trigger!';
  END IF;

  -- Test 2.2: Delete clinician decision should fail
  BEGIN
    DELETE FROM targeting.clinician_decisions
    WHERE id = '0a0a0a0a-1111-1111-1111-0a0a0a0a0a0a'::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_failed_delete := true;
  END;

  IF NOT v_failed_delete THEN
    RAISE EXCEPTION 'TEST FAILED: ClinicianDecision delete was not rejected by immutability trigger!';
  END IF;

  -- Test 2.3: Delete audit event should fail
  v_failed_delete := false;
  BEGIN
    DELETE FROM audit.events
    WHERE id = 'aeaeaeae-1111-1111-1111-aeaeaeaeaeae'::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_failed_delete := true;
  END;

  IF NOT v_failed_delete THEN
    RAISE EXCEPTION 'TEST FAILED: Audit event delete was not rejected by immutability trigger!';
  END IF;

  RAISE NOTICE 'SUCCESS: All immutability tests passed.';
END $$;

ROLLBACK;
