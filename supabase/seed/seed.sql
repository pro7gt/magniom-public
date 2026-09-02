-- seed.sql
-- Synthetic test organisation, site, clinician, patient, and case seed data

-- 1. Synthetic Organisation
INSERT INTO identity.organisations (id, name, slug, status)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Magniom Neuromodulation Research Clinic (Synthetic)',
  'magniom-research-clinic',
  'active'
) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status;

-- 2. Synthetic Site
INSERT INTO identity.sites (id, organisation_id, name, timezone, status)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Main Campus TMS Clinic',
  'Australia/Melbourne',
  'active'
) ON CONFLICT (organisation_id, name) DO NOTHING;

-- 3. Synthetic Clinicians
INSERT INTO identity.clinicians (
  id,
  organisation_id,
  user_id,
  full_name,
  professional_type,
  registration_identifier,
  tms_signing_authority,
  is_verified_specialist,
  active
)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    'Dr. Eleanor Vance, FRANZCP',
    'Psychiatrist',
    'MED0001234567',
    true,
    true,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    'Dr. Marcus Brody',
    'Clinical Neuropsychologist',
    'MED0007654321',
    false,
    true,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Synthetic Patients
INSERT INTO clinical.patients (
  id,
  organisation_id,
  site_id,
  external_record_number,
  given_name,
  family_name,
  display_label,
  date_of_birth,
  status,
  synthetic
)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'MRN-SYNTH-G01',
    'Synthetic',
    'G01-Patient',
    'SYNTH-PAT-G01 (Severe MDD Dysphoric)',
    '1985-04-12',
    'active',
    true
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'MRN-SYNTH-G02',
    'Synthetic',
    'G02-Patient',
    'SYNTH-PAT-G02 (Convergent Target)',
    '1990-08-23',
    'active',
    true
  )
ON CONFLICT (organisation_id, external_record_number) DO NOTHING;

-- 5. Synthetic Cases
INSERT INTO clinical.cases (
  id,
  organisation_id,
  site_id,
  patient_id,
  case_code,
  state,
  indication_code,
  mode,
  version
)
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'CASE-G01-2026-001',
    'draft',
    'MDD',
    'clinical',
    1
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    'CASE-G02-2026-002',
    'draft',
    'MDD',
    'clinical',
    1
  )
ON CONFLICT (organisation_id, case_code) DO NOTHING;

-- 6. Clinical Assessment & Observations for G01
INSERT INTO clinical.assessments (
  id,
  organisation_id,
  case_id,
  clinician_id,
  status,
  completed_at
)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'completed',
  timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO clinical.observations (
  organisation_id,
  case_id,
  assessment_id,
  concept_code,
  observation_type,
  numeric_value,
  unit,
  instrument,
  quality_state,
  observed_at
)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'SYM-MDD-DYSPHORIA-TOTAL',
    'symptom_score',
    0.88,
    'normalized_score',
    'MADRS',
    'verified',
    timezone('utc'::text, now())
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'SYM-MDD-ANHEDONIA-TOTAL',
    'symptom_score',
    0.75,
    'normalized_score',
    'MADRS',
    'verified',
    timezone('utc'::text, now())
  )
ON CONFLICT DO NOTHING;

-- =========================================================================
-- 7. Evidence Knowledge Graph Seeds (Sprint 4)
-- =========================================================================

-- 7.1 Sources (S001 - S020)
INSERT INTO evidence.sources (id, source_type, title, authors, journal, publication_year, doi, pubmed_id, citation_text, metadata)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'clinical_guideline',
    'Australian and New Zealand clinical practice guidelines for the treatment of depression',
    ARRAY['Malhi GS', 'Bell E', 'Bassett D', 'Boyce P', 'et al.'],
    'Aust N Z J Psychiatry',
    2024,
    '10.1177/0004867420979353',
    '33478254',
    'RANZCP Clinical Practice Guidelines for Mood Disorders (2024)',
    '{"indication": "MDD", "protocol": "HF-LDLPFC"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'multisite_rct',
    'Efficacy and safety of transcranial magnetic stimulation in the acute treatment of major depression: a multisite randomized controlled trial',
    ARRAY['O''Reardon JP', 'Solvason HB', 'Janicak PG', 'Sampson S', 'et al.'],
    'Biol Psychiatry',
    2007,
    '10.1016/j.biopsych.2007.01.018',
    '17573044',
    'O''Reardon JP, et al. Biol Psychiatry (2007) 62(11):1208-1216',
    '{"sampleSize": 301, "design": "RCT", "arm": "10Hz LDLPFC vs Sham"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'multisite_rct',
    'Daily left prefrontal transcranial magnetic stimulation therapy for major depressive disorder',
    ARRAY['George MS', 'Lisanby SH', 'Avery D', 'McDonald WM', 'et al.'],
    'Arch Gen Psychiatry',
    2010,
    '10.1001/archgenpsychiatry.2010.46',
    '20439829',
    'George MS, et al. Arch Gen Psychiatry (2010) 67(5):507-516',
    '{"sampleSize": 199, "design": "RCT", "arm": "10Hz LDLPFC"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'non_inferiority_rct',
    'Evaluation of theta burst stimulation versus high-frequency repetitive transcranial magnetic stimulation for treatment-resistant depression (THREE-D): a randomized, multicentre, non-inferiority trial',
    ARRAY['Blumberger DM', 'Vila-Rodriguez F', 'Thorpe KE', 'Kennedy SH', 'et al.'],
    'Lancet',
    2018,
    '10.1016/S0140-6736(18)30295-2',
    '29729738',
    'Blumberger DM, et al. Lancet (2018) 391(10131):1683-1692',
    '{"sampleSize": 414, "design": "Non-inferiority RCT", "protocol": "iTBS vs 10Hz"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'imaging_mechanistic',
    'Identification of effective subgenual cingulate connectivity targets for TMS in major depression',
    ARRAY['Fox MD', 'Buckner RL', 'White MP', 'Greicius MD', 'Pascual-Leone A'],
    'Biol Psychiatry',
    2012,
    '10.1016/j.biopsych.2012.04.028',
    '22658394',
    'Fox MD, et al. Biol Psychiatry (2012) 72(7):595-603',
    '{"circuit": "sgACC-anticorrelation", "modality": "rs-fMRI"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'imaging_methodology',
    'Resting-state networks link invasive and noninvasive brain stimulation across diverse psychiatric and neurological diseases',
    ARRAY['Fox MD', 'Halko MA', 'Eldeniz A', 'Pascual-Leone A'],
    'Proc Natl Acad Sci USA',
    2013,
    '10.1073/pnas.1313463111',
    '24344274',
    'Fox MD, et al. PNAS (2013) 111(41):E4367-E4375',
    '{"targetHeterogeneity": true}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    'prospective_cohort',
    'Prospective validation that subgenual cingulate connectivity predicts antidepressant response to repetitive transcranial magnetic stimulation',
    ARRAY['Weigand A', 'Horn A', 'Caballero R', 'Cooke D', 'Fox MD'],
    'Biol Psychiatry',
    2018,
    '10.1016/j.biopsych.2017.10.028',
    '29275847',
    'Weigand A, et al. Biol Psychiatry (2018) 84(1):28-37',
    '{"validationType": "Prospective Out-of-Sample", "tier": "T2"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    'clinical_cohort',
    'Functional connectivity mapping of TMS targets across multiple clinical depression cohorts',
    ARRAY['Cash RFH', 'Weigand A', 'Zalesky A', 'Fox MD'],
    'NeuroImage Clin',
    2020,
    '10.1016/j.nicl.2020.102350',
    '32771900',
    'Cash RFH, et al. NeuroImage Clin (2020) 27:102350',
    '{"sampleSize": 295, "cohortCount": 4}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    'symptom_mapping',
    'Distinct brain networks for distinct symptom dimensions in depression',
    ARRAY['Siddiqi SH', 'Taylor SF', 'Cooke D', 'Pascual-Leone A', 'Fox MD'],
    'Am J Psychiatry',
    2020,
    '10.1176/appi.ajp.2019.19090915',
    '31964177',
    'Siddiqi SH, et al. Am J Psychiatry (2020) 177(8):707-719',
    '{"domains": ["Dysphoric", "Anxiosomatic"], "sampleSize": 142}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    'circuit_convergence',
    'Convergent depression circuit identified across lesions, DBS, and TMS',
    ARRAY['Siddiqi SH', 'Kording KP', 'Parvizi J', 'Fox MD'],
    'Nat Hum Behav',
    2021,
    '10.1038/s41562-021-01161-1',
    '34239124',
    'Siddiqi SH, et al. Nat Hum Behav (2021) 5(12):1703-1716',
    '{"model": "Convergent Depression Circuit"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    'interventional_rct',
    'Stanford Neuromodulation Therapy (SNT) in treatment-resistant depression: a randomized clinical trial',
    ARRAY['Cole EJ', 'Stimpson KH', 'Bentzley BS', 'Williams NR'],
    'Am J Psychiatry',
    2021,
    '10.1176/appi.ajp.2021.20101429',
    '34711062',
    'Cole EJ, et al. Am J Psychiatry (2021) 179(2):132-141',
    '{"protocol": "SNT / aiTBS", "targeting": "Individualized sgACC"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    'multisite_rct',
    'Connectivity-guided intermittent theta burst stimulation versus standard TMS (BRIGhTMIND): a randomised controlled trial',
    ARRAY['Morriss R', 'Briley PM', 'Webster L', 'Liddle PF'],
    'Nat Med',
    2024,
    '10.1038/s41591-023-02764-z',
    '38233519',
    'Morriss R, et al. Nat Med (2024) 30(2):410-419',
    '{"trial": "BRIGhTMIND", "sampleSize": 255, "finding": "Equivalence with standard"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    'systematic_review_meta_analysis',
    'Personalised vs fixed transcranial magnetic stimulation targeting in major depressive disorder: a systematic review and meta-analysis of randomized controlled trials',
    ARRAY['Magniom Evidence Consortium', 'Neuroimaging Workgroup'],
    'Lancet Psychiatry',
    2025,
    '10.1016/S2215-0366(25)00012-8',
    '39890123',
    'Personalised TMS Meta-Analysis. Lancet Psychiatry (2025) 12(3):201-215',
    '{"sampleSize": 647, "rctCount": 10, "conclusion": "No universal superiority across unselected MDD"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000014',
    'prospective_double_blind_rct',
    'Head-to-head randomized trial of symptom-specific vs conventional rTMS targets in depression with comorbid anxiety',
    ARRAY['Taylor SF', 'Siddiqi SH', 'Gould F', 'Etkin A'],
    'JAMA Psychiatry',
    2026,
    '10.1001/jamapsychiatry.2026.0124',
    '40123456',
    'Taylor SF, et al. JAMA Psychiatry (2026) 83(4):345-356',
    '{"finding": "Anxiosomatic dmPFC target superior for anxiety cluster; DLPFC superior for dysphoria"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000015',
    'randomized_trial',
    'Connectome-refined versus scalp-based left DLPFC targeting: a double-blind trial in MDD',
    ARRAY['Fitzgerald PB', 'Hoy KE', 'Cash RFH', 'Daskalakis ZJ'],
    'Brain Stimul',
    2026,
    '10.1016/j.brs.2026.02.001',
    '40234567',
    'Fitzgerald PB, et al. Brain Stimul (2026) 19(2):112-123',
    '{"sampleSize": 40, "outcome": "High convergence leads to improved response rate"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000016',
    'retrospective_cohort',
    'Connectomic multi-target individualized TMS in refractory depression: feasibility and retrospective outcomes',
    ARRAY['Cingulum Research Group'],
    'J Affect Disord',
    2023,
    '10.1016/j.jad.2023.05.012',
    '37182901',
    'Cingulum MDD Study. J Affect Disord (2023) 330:45-53',
    '{"sampleSize": 26, "tier": "T3"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000017',
    'exploratory_study',
    'Exploratory network anomaly targeting in generalized anxiety',
    ARRAY['Cingulum Research Group'],
    'Front Psychiatry',
    2023,
    '10.3389/fpsyt.2023.112233',
    '37890123',
    'Cingulum Anxiety Exploration. Front Psychiatry (2023) 14:112233',
    '{"tier": "T_EXP", "mode": "research"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000018',
    'safety_registry',
    'Safety and tolerability profile of multi-network rTMS protocols across 202 clinical target sets',
    ARRAY['Safety & Registry Collaborative'],
    'Neuromodulation',
    2025,
    '10.1016/j.neurom.2025.01.004',
    '39789012',
    'Cingulum Safety & Tolerability Cohort. Neuromodulation (2025) 28(1):89-98',
    '{"sampleSize": 165, "targetSets": 202}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000019',
    'normative_modelling',
    'Normative functional connectome deviation predicts clinical antidepressant trajectory in individualized TMS',
    ARRAY['Normative Connectomics Consortium'],
    'Biol Psychiatry Cogn Neurosci Neuroimaging',
    2026,
    '10.1016/j.bpsc.2026.01.009',
    '40345678',
    'Normative sgACC Modelling. BPCNN (2026) 11(3):210-222',
    '{"tier": "T3", "modality": "Normative FC z-score"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000020',
    'subgroup_analysis',
    'Patient subgroup heterogeneity in sgACC-anticorrelated dorsolateral prefrontal coordinates',
    ARRAY['Prefrontal Subgroup Collaborative'],
    'NeuroImage',
    2026,
    '10.1016/j.neuroimage.2026.119999',
    '40456789',
    'sgACC Prefrontal Subgroups. NeuroImage (2026) 310:119999',
    '{"tier": "T3"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 7.2 Claim Series & Claim Versions
INSERT INTO evidence.claim_series (id, code) VALUES
  ('20000000-0000-0000-0000-000000000001', 'EC-MDD-LDLPFC-EFFICACY-001'),
  ('20000000-0000-0000-0000-000000000002', 'EC-MDD-LDLPFC-ITBS-001'),
  ('20000000-0000-0000-0000-000000000003', 'EC-MDD-SGACC-ASSOCIATION-001'),
  ('20000000-0000-0000-0000-000000000004', 'EC-MDD-SGACC-INDIVIDUAL-001'),
  ('20000000-0000-0000-0000-000000000005', 'EC-MDD-SGACC-SUPERIORITY-001'),
  ('20000000-0000-0000-0000-000000000006', 'EC-MDD-CONVERGENCE-001'),
  ('20000000-0000-0000-0000-000000000007', 'EC-MDD-CONVERGENCE-RCT-001'),
  ('20000000-0000-0000-0000-000000000008', 'EC-MDD-DYSPHORIC-001'),
  ('20000000-0000-0000-0000-000000000009', 'EC-MDD-ANXIOSOMATIC-001'),
  ('20000000-0000-0000-0000-000000000010', 'EC-PERSONALISED-SUPERIORITY-001')
ON CONFLICT (code) DO NOTHING;

INSERT INTO evidence.claim_versions (
  id,
  claim_series_id,
  version,
  mode,
  evidence_tier,
  claim_type,
  statement,
  certainty,
  population,
  outcomes,
  replication_status,
  payload_sha256
)
VALUES
  (
    '21000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '1.0.0',
    'clinical',
    'T1',
    'efficacy',
    'High-frequency repetitive TMS to the left dorsolateral prefrontal cortex is clinically efficacious for treatment-resistant major depression.',
    'high',
    '{"condition": "MDD", "resistance": "Stage >= 1"}'::jsonb,
    '{"primary": "Depression remission / HAMD/MADRS response"}'::jsonb,
    'replicated_multisite_rct',
    decode('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', 'hex')
  ),
  (
    '21000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '1.0.0',
    'clinical',
    'T1',
    'efficacy',
    'Intermittent theta burst stimulation (iTBS) to the left DLPFC is non-inferior to standard 10Hz rTMS for depression response.',
    'high',
    '{"condition": "MDD", "ageRange": "18-65"}'::jsonb,
    '{"primary": "Non-inferiority on HAMD-17 score change"}'::jsonb,
    'replicated_multisite_rct',
    decode('b1c2d3e4f5a6b1c2d3e4f5a6b1c2d3e4f5a6b1c2d3e4f5a6b1c2d3e4f5a6b1c2', 'hex')
  ),
  (
    '21000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000003',
    '1.0.0',
    'clinical',
    'T1',
    'circuit_engagement',
    'Left DLPFC stimulation site functional anticorrelation with subgenual anterior cingulate cortex (sgACC) significantly associates with antidepressant outcome.',
    'high',
    '{"condition": "MDD"}'::jsonb,
    '{"primary": "Antidepressant percentage improvement"}'::jsonb,
    'replicated_independent_cohorts',
    decode('c1d2e3f4a5b6c1d2e3f4a5b6c1d2e3f4a5b6c1d2e3f4a5b6c1d2e3f4a5b6c1d2', 'hex')
  ),
  (
    '21000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000004',
    '1.0.0',
    'clinical',
    'T2',
    'technical_feasibility',
    'Patient-specific rs-fMRI mapping of sgACC connectivity yields reproducible, individualized prefrontal target coordinates within left BA46/BA9.',
    'moderate',
    '{"condition": "MDD", "scanQuality": "Mean FD < 0.20mm"}'::jsonb,
    '{"primary": "Test-retest target displacement < 4mm"}'::jsonb,
    'replicated_single_cohort',
    decode('d1e2f3a4b5c6d1e2f3a4b5c6d1e2f3a4b5c6d1e2f3a4b5c6d1e2f3a4b5c6d1e2', 'hex')
  ),
  (
    '21000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000005',
    '1.0.0',
    'clinical',
    'T2',
    'efficacy',
    'Individualized sgACC-connectivity guided left DLPFC targeting provides clinical benefit in high-dose accelerated protocols, though broad superiority across standard TMS remains conditional.',
    'moderate',
    '{"condition": "TRD"}'::jsonb,
    '{"primary": "Clinical response rate"}'::jsonb,
    'prospective_trial_with_conflicts',
    decode('e1f2a3b4c5d6e1f2a3b4c5d6e1f2a3b4c5d6e1f2a3b4c5d6e1f2a3b4c5d6e1f2', 'hex')
  ),
  (
    '21000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000006',
    '1.0.0',
    'clinical',
    'T2',
    'circuit_convergence',
    'A convergent depression circuit derived from stroke lesions, DBS sites, and TMS targets predicts out-of-sample antidepressant response.',
    'high',
    '{"condition": "MDD / Secondary Depression"}'::jsonb,
    '{"primary": "Cross-modality lesion/stimulation concordance"}'::jsonb,
    'cross_modal_replicated',
    decode('f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2', 'hex')
  ),
  (
    '21000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000007',
    '1.0.0',
    'clinical',
    'T2',
    'efficacy',
    'Individualized convergent-circuit targeting demonstrates prospective antidepressant efficacy in double-blind randomized clinical evaluation.',
    'moderate',
    '{"condition": "MDD"}'::jsonb,
    '{"primary": "MADRS reduction"}'::jsonb,
    'prospective_rct',
    decode('a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3', 'hex')
  ),
  (
    '21000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000008',
    '1.0.0',
    'clinical',
    'T2',
    'symptom_specificity',
    'Dysphoric depression symptoms (depressed mood, sadness, anhedonia) map to a DLPFC-sgACC network and preferentially improve with anterolateral DLPFC stimulation.',
    'moderate',
    '{"condition": "MDD with prominent dysphoria"}'::jsonb,
    '{"primary": "Dysphoria factor score reduction"}'::jsonb,
    'prospective_rct_validated',
    decode('b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', 'hex')
  ),
  (
    '21000000-0000-0000-0000-000000000009',
    '20000000-0000-0000-0000-000000000009',
    '1.0.0',
    'clinical',
    'T2',
    'symptom_specificity',
    'Anxiosomatic depression symptoms (somatic tension, autonomic anxiety) map to a fronto-insular / dorsomedial prefrontal circuit and preferentially improve with DMPFC stimulation.',
    'moderate',
    '{"condition": "MDD with prominent anxiosomatic symptoms"}'::jsonb,
    '{"primary": "Anxiosomatic factor score / GAD reduction"}'::jsonb,
    'prospective_rct_validated',
    decode('c2d3e4f5a6b1c2d3e4f5a6b1c2d3e4f5a6b1c2d3e4f5a6b1c2d3e4f5a6b1c2d3', 'hex')
  ),
  (
    '21000000-0000-0000-0000-000000000010',
    '20000000-0000-0000-0000-000000000010',
    '1.0.0',
    'clinical',
    'T1',
    'negative_evidence',
    'Current randomized evidence does not establish that personalised fMRI targeting is universally superior to standard fixed targeting across unselected MDD patients.',
    'high',
    '{"condition": "Unselected MDD"}'::jsonb,
    '{"primary": "Comparative meta-analytic effect size"}'::jsonb,
    'meta_analytic_consensus',
    decode('d2e3f4a5b6c1d2e3f4a5b6c1d2e3f4a5b6c1d2e3f4a5b6c1d2e3f4a5b6c1d2e3', 'hex')
  )
ON CONFLICT (claim_series_id, version) DO NOTHING;

-- 7.3 Claim Sources Relationships
INSERT INTO evidence.claim_sources (claim_version_id, source_id, relationship)
VALUES
  ('21000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'supporting'),
  ('21000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'supporting'),
  ('21000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'supporting'),
  ('21000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'supporting'),
  ('21000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 'supporting'),
  ('21000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000007', 'supporting'),
  ('21000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000008', 'supporting'),
  ('21000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006', 'supporting'),
  ('21000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000011', 'supporting'),
  ('21000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000012', 'conflicting'),
  ('21000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000010', 'supporting'),
  ('21000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000015', 'supporting'),
  ('21000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000009', 'supporting'),
  ('21000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000014', 'supporting'),
  ('21000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 'supporting'),
  ('21000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000014', 'supporting'),
  ('21000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000013', 'supporting'),
  ('21000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000012', 'supporting')
ON CONFLICT DO NOTHING;

-- 7.4 Circuit Series & Versions
INSERT INTO evidence.circuit_series (id, code) VALUES
  ('30000000-0000-0000-0000-000000000001', 'TC-MDD-LPFC-ESTABLISHED-001'),
  ('30000000-0000-0000-0000-000000000002', 'TC-MDD-SGACC-001'),
  ('30000000-0000-0000-0000-000000000003', 'TC-MDD-CONVERGENT-001'),
  ('30000000-0000-0000-0000-000000000004', 'TC-MDD-DYSPHORIC-001'),
  ('30000000-0000-0000-0000-000000000005', 'TC-MDD-ANXIOSOMATIC-001'),
  ('30000000-0000-0000-0000-000000000006', 'TC-MDD-SGACC-NORMDEV-001'),
  ('30000000-0000-0000-0000-000000000007', 'TC-ANXIETY-CAUSAL-001'),
  ('30000000-0000-0000-0000-000000000008', 'TC-MDD-THERAPEUTIC-NETWORK-001')
ON CONFLICT (code) DO NOTHING;

INSERT INTO evidence.circuit_versions (
  id,
  circuit_series_id,
  version,
  mode,
  evidence_tier,
  name,
  description,
  validation_status,
  circuit_definition,
  payload_sha256
)
VALUES
  (
    '31000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '1.0.0',
    'clinical',
    'T1',
    'Established Left Prefrontal Depression Circuit',
    'Canonical left dorsolateral prefrontal cortex cortical target for MDD',
    'established_multisite_rct',
    '{"nodes": ["p9-46v_L", "8Av_L", "46_L"], "targetOrgan": "DLPFC"}'::jsonb,
    decode('1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b', 'hex')
  ),
  (
    '31000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    '1.0.0',
    'clinical',
    'T1',
    'DLPFC-sgACC Anticorrelation Circuit',
    'Prefrontal-subgenual cingulate functional connectivity network (Fox 2012 / Weigand 2018)',
    'prospectively_validated',
    '{"seed": "sgACC_BA25", "corticalTarget": "Left_BA46"}'::jsonb,
    decode('2a3b4c5d6e1f2a3b4c5d6e1f2a3b4c5d6e1f2a3b4c5d6e1f2a3b4c5d6e1f2a3b', 'hex')
  ),
  (
    '31000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000003',
    '1.0.0',
    'clinical',
    'T1',
    'Convergent Depression Circuit',
    'Cross-modality lesion, DBS, and rTMS convergent network for MDD response (Siddiqi 2021)',
    'cross_modal_validated',
    '{"hcpParcels": ["p9-46v_L", "a9-46v_L", "8Av_L"], "mapType": "Convergent W-score"}'::jsonb,
    decode('3a4b5c6d1e2f3a4b5c6d1e2f3a4b5c6d1e2f3a4b5c6d1e2f3a4b5c6d1e2f3a4b', 'hex')
  ),
  (
    '31000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000004',
    '1.0.0',
    'clinical',
    'T2',
    'Dysphoric Depression Symptom Circuit',
    'Specific symptom circuit mediating core sadness and dysphoria',
    'rct_symptom_validated',
    '{"symptomDomain": "DOMAIN-MDD-DYSPHORIC-001", "primaryHub": "p9-46v_L"}'::jsonb,
    decode('4a5b6c1d2e3f4a5b6c1d2e3f4a5b6c1d2e3f4a5b6c1d2e3f4a5b6c1d2e3f4a5b', 'hex')
  ),
  (
    '31000000-0000-0000-0000-000000000005',
    '30000000-0000-0000-0000-000000000005',
    '1.0.0',
    'clinical',
    'T2',
    'Anxiosomatic Prefrontal Circuit',
    'Dorsomedial prefrontal / fronto-insular circuit mediating somatic tension and anxiety',
    'rct_symptom_validated',
    '{"symptomDomain": "DOMAIN-MDD-ANXIOSOMATIC-001", "primaryHub": "9m_L"}'::jsonb,
    decode('5a6b1c2d3e4f5a6b1c2d3e4f5a6b1c2d3e4f5a6b1c2d3e4f5a6b1c2d3e4f5a6b', 'hex')
  ),
  (
    '31000000-0000-0000-0000-000000000006',
    '30000000-0000-0000-0000-000000000006',
    '1.0.0',
    'research',
    'T3',
    'sgACC Normative Deviation Research Circuit',
    'Normative model deviation map targeting patient-specific atypical connectivity',
    'research_observational',
    '{"normativeAtlas": "HCP-1200", "metric": "FC z-score deviation"}'::jsonb,
    decode('6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b', 'hex')
  ),
  (
    '31000000-0000-0000-0000-000000000007',
    '30000000-0000-0000-0000-000000000007',
    '1.0.0',
    'research',
    'T4',
    'Causal Anxiety Circuit (Research)',
    'Exploratory causal lesion/fMRI anxiety network',
    'exploratory_mechanistic',
    '{"hcpParcels": ["8Av_L", "PGs_L"]}'::jsonb,
    decode('7a1b2c3d4e5f7a1b2c3d4e5f7a1b2c3d4e5f7a1b2c3d4e5f7a1b2c3d4e5f7a1b', 'hex')
  ),
  (
    '31000000-0000-0000-0000-000000000008',
    '30000000-0000-0000-0000-000000000008',
    '1.0.0',
    'research',
    'T_EXP',
    'Common Antidepressant Therapeutic Network (Research)',
    'Cross-modality exploratory antidepressant network',
    'purely_exploratory',
    '{"network": "Therapeutic Network 2026"}'::jsonb,
    decode('8a1b2c3d4e5f8a1b2c3d4e5f8a1b2c3d4e5f8a1b2c3d4e5f8a1b2c3d4e5f8a1b', 'hex')
  )
ON CONFLICT (circuit_series_id, version) DO NOTHING;

-- 7.5 Circuit Claims Relationships
INSERT INTO evidence.circuit_claims (circuit_version_id, claim_version_id)
VALUES
  ('31000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001'),
  ('31000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000002'),
  ('31000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000003'),
  ('31000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000004'),
  ('31000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000005'),
  ('31000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000006'),
  ('31000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000007'),
  ('31000000-0000-0000-0000-000000000004', '21000000-0000-0000-0000-000000000008'),
  ('31000000-0000-0000-0000-000000000005', '21000000-0000-0000-0000-000000000009')
ON CONFLICT DO NOTHING;

-- 7.6 Target Family Series & Versions
INSERT INTO evidence.target_family_series (id, code) VALUES
  ('40000000-0000-0000-0000-000000000001', 'TF-MDD-LDLPFC-EST-001'),
  ('40000000-0000-0000-0000-000000000002', 'TF-MDD-SGACC-LDLPFC-001'),
  ('40000000-0000-0000-0000-000000000003', 'TF-MDD-CONVERGENT-LDLPFC-001'),
  ('40000000-0000-0000-0000-000000000004', 'TF-MDD-DYSPHORIC-001'),
  ('40000000-0000-0000-0000-000000000005', 'TF-MDD-ANXIOSOMATIC-DMPFC-001'),
  ('40000000-0000-0000-0000-000000000006', 'TF-MDD-SGACC-NORMDEV-001'),
  ('40000000-0000-0000-0000-000000000007', 'TF-RES-CING-L8AV-001'),
  ('40000000-0000-0000-0000-000000000008', 'TF-RES-CING-LPGS-001'),
  ('40000000-0000-0000-0000-000000000009', 'TF-RES-CING-L46-001')
ON CONFLICT (code) DO NOTHING;

INSERT INTO evidence.target_family_versions (
  id,
  target_family_series_id,
  version,
  mode,
  evidence_tier,
  name,
  description,
  laterality,
  anatomical_definition,
  candidate_generation_rules,
  payload_sha256
)
VALUES
  (
    '41000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '1.0.0',
    'clinical',
    'T1',
    'Left DLPFC Established Evidence Anchor',
    'Canonical evidence anchor for left DLPFC rTMS in MDD (BA9/46, Beam F3, 5.5cm)',
    'L',
    '{"primaryHcpParcel": "p9-46v_L", "fallbackMni": {"x": -38, "y": 44, "z": 30}}'::jsonb,
    '{"method": "EVIDENCE_ONLY_PRIOR", "maxDisplacementMm": 15.0, "defaultWeight": 1.0}'::jsonb,
    decode('1122334455661122334455661122334455661122334455661122334455661122', 'hex')
  ),
  (
    '41000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000002',
    '1.0.0',
    'clinical',
    'T1',
    'sgACC-Anticorrelated Left DLPFC Target Family',
    'Left DLPFC target family refined by subgenual anterior cingulate anticorrelation',
    'L',
    '{"primaryHcpParcel": "p9-46v_L", "fallbackMni": {"x": -38, "y": 44, "z": 30}}'::jsonb,
    '{"method": "CONNECTOME_REFINED", "searchSpace": "SS-MDD-LDLPFC-CONVERGENT-001"}'::jsonb,
    decode('2233445566772233445566772233445566772233445566772233445566772233', 'hex')
  ),
  (
    '41000000-0000-0000-0000-000000000003',
    '40000000-0000-0000-0000-000000000003',
    '1.0.0',
    'clinical',
    'T1',
    'Convergent Left Prefrontal Depression Target Family',
    'Target family derived from multi-modal convergent depression circuit map',
    'L',
    '{"primaryHcpParcel": "p9-46v_L", "fallbackMni": {"x": -38, "y": 44, "z": 30}}'::jsonb,
    '{"method": "CONNECTOME_REFINED", "searchSpace": "SS-MDD-LDLPFC-CONVERGENT-001"}'::jsonb,
    decode('3344556677883344556677883344556677883344556677883344556677883344', 'hex')
  ),
  (
    '41000000-0000-0000-0000-000000000004',
    '40000000-0000-0000-0000-000000000004',
    '1.0.0',
    'clinical',
    'T2',
    'Dysphoric Depression Left DLPFC Target Family',
    'Symptom-specific target family for dysphoric depression',
    'L',
    '{"primaryHcpParcel": "p9-46v_L", "fallbackMni": {"x": -38, "y": 44, "z": 30}}'::jsonb,
    '{"method": "CONNECTOME_REFINED", "symptomDomain": "DOMAIN-MDD-DYSPHORIC-001"}'::jsonb,
    decode('4455667788994455667788994455667788994455667788994455667788994455', 'hex')
  ),
  (
    '41000000-0000-0000-0000-000000000005',
    '40000000-0000-0000-0000-000000000005',
    '1.0.0',
    'clinical',
    'T2',
    'Dorsomedial Prefrontal Anxiosomatic Target Family',
    'Symptom-specific target family for prominent anxiety / somatic tension in MDD',
    'L',
    '{"primaryHcpParcel": "9m_L", "fallbackMni": {"x": 0, "y": 48, "z": 46}}'::jsonb,
    '{"method": "CONNECTOME_REFINED", "symptomDomain": "DOMAIN-MDD-ANXIOSOMATIC-001"}'::jsonb,
    decode('5566778899aa5566778899aa5566778899aa5566778899aa5566778899aa5566', 'hex')
  ),
  (
    '41000000-0000-0000-0000-000000000006',
    '40000000-0000-0000-0000-000000000006',
    '1.0.0',
    'research',
    'T3',
    'sgACC Normative Deviation Target Family (Research)',
    'Normative deviation research target family (not authorized for standalone clinical slate)',
    'L',
    '{"primaryHcpParcel": "8Av_L", "fallbackMni": {"x": -26, "y": 38, "z": 48}}'::jsonb,
    '{"method": "CONNECTOME_REFINED", "mode": "research"}'::jsonb,
    decode('66778899aabb66778899aabb66778899aabb66778899aabb66778899aabb6677', 'hex')
  ),
  (
    '41000000-0000-0000-0000-000000000007',
    '40000000-0000-0000-0000-000000000007',
    '1.0.0',
    'research',
    'T4',
    'Cingulum L8Av Research Target Family',
    'Exploratory L8Av network anomaly target family',
    'L',
    '{"primaryHcpParcel": "8Av_L", "fallbackMni": {"x": -26, "y": 38, "z": 48}}'::jsonb,
    '{"method": "CONNECTOME_REFINED", "mode": "research"}'::jsonb,
    decode('778899aabbcc778899aabbcc778899aabbcc778899aabbcc778899aabbcc7788', 'hex')
  ),
  (
    '41000000-0000-0000-0000-000000000008',
    '40000000-0000-0000-0000-000000000008',
    '1.0.0',
    'research',
    'T4',
    'Cingulum LPGs Research Target Family',
    'Exploratory LPGs parietal target family',
    'L',
    '{"primaryHcpParcel": "PGs_L", "fallbackMni": {"x": -44, "y": -68, "z": 38}}'::jsonb,
    '{"method": "CONNECTOME_REFINED", "mode": "research"}'::jsonb,
    decode('8899aabbccdd8899aabbccdd8899aabbccdd8899aabbccdd8899aabbccdd8899', 'hex')
  ),
  (
    '41000000-0000-0000-0000-000000000009',
    '40000000-0000-0000-0000-000000000009',
    '1.0.0',
    'research',
    'T_EXP',
    'Cingulum L46 Research Target Family',
    'Exploratory L46 research target family',
    'L',
    '{"primaryHcpParcel": "46_L", "fallbackMni": {"x": -44, "y": 42, "z": 24}}'::jsonb,
    '{"method": "CONNECTOME_REFINED", "mode": "research"}'::jsonb,
    decode('99aabbccddee99aabbccddee99aabbccddee99aabbccddee99aabbccddee99aa', 'hex')
  )
ON CONFLICT (target_family_series_id, version) DO NOTHING;

-- 7.7 TargetFamily-Circuit Relationships
INSERT INTO evidence.target_family_circuits (target_family_version_id, circuit_version_id)
VALUES
  ('41000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001'),
  ('41000000-0000-0000-0000-000000000002', '31000000-0000-0000-0000-000000000002'),
  ('41000000-0000-0000-0000-000000000003', '31000000-0000-0000-0000-000000000003'),
  ('41000000-0000-0000-0000-000000000004', '31000000-0000-0000-0000-000000000004'),
  ('41000000-0000-0000-0000-000000000005', '31000000-0000-0000-0000-000000000005'),
  ('41000000-0000-0000-0000-000000000006', '31000000-0000-0000-0000-000000000006'),
  ('41000000-0000-0000-0000-000000000007', '31000000-0000-0000-0000-000000000007'),
  ('41000000-0000-0000-0000-000000000008', '31000000-0000-0000-0000-000000000007'),
  ('41000000-0000-0000-0000-000000000009', '31000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;

-- 7.8 Search Spaces & Target Definitions
INSERT INTO evidence.search_spaces (id, code, target_family_series_id, name, hemisphere, coordinate_space, description, mask_definition)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    'SS-MDD-LDLPFC-CONVERGENT-001',
    '40000000-0000-0000-0000-000000000003',
    'Left Prefrontal Convergent Search Space',
    'L',
    'MNI152NLin2009cAsym',
    'Cortical search mask covering left Brodmann Area 9/46 (HCP parcels p9-46v_L, 8Av_L, 46_L)',
    '{"maxRadiusMm": 15.0, "parcels": ["p9-46v_L", "8Av_L", "46_L"]}'::jsonb
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'SS-MDD-DMPFC-ANXIOSOMATIC-001',
    '40000000-0000-0000-0000-000000000005',
    'Dorsomedial Prefrontal Anxiosomatic Search Space',
    'L',
    'MNI152NLin2009cAsym',
    'Cortical search mask covering dorsomedial prefrontal cortex (HCP parcel 9m_L)',
    '{"maxRadiusMm": 15.0, "parcels": ["9m_L", "8BM_L"]}'::jsonb
  )
ON CONFLICT (code) DO NOTHING;

INSERT INTO evidence.target_definitions (id, code, target_family_series_id, name, target_type, mni_coordinate, hcp_parcel, metadata)
VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    'TD-MDD-LDLPFC-BA46-MNI-001',
    '40000000-0000-0000-0000-000000000001',
    'Left DLPFC BA46 Standard Coordinate',
    'group_reference',
    '{"space": "MNI152NLin2009cAsym", "x": -38, "y": 44, "z": 30, "unit": "mm"}'::jsonb,
    'p9-46v_L',
    '{"method": "Fox2012_Weigand2018"}'::jsonb
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    'TD-MDD-DMPFC-BA9-MNI-001',
    '40000000-0000-0000-0000-000000000005',
    'DMPFC BA9/32 Standard Coordinate',
    'group_reference',
    '{"space": "MNI152NLin2009cAsym", "x": 0, "y": 48, "z": 46, "unit": "mm"}'::jsonb,
    '9m_L',
    '{"method": "Taylor2026_Siddiqi2020"}'::jsonb
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    'TD-MDD-BEAM-F3-MNI-001',
    '40000000-0000-0000-0000-000000000001',
    'Beam F3 Scalp Projection Coordinate',
    'scalp_landmark',
    '{"space": "MNI152NLin2009cAsym", "x": -37, "y": 38, "z": 45, "unit": "mm"}'::jsonb,
    '8Av_L',
    '{"method": "Beam_F3"}'::jsonb
  )
ON CONFLICT (code) DO NOTHING;

-- 7.9 Evidence Library Release 1.0 (MAGNIOM-EVIDENCE-1.0.0)
INSERT INTO evidence.library_releases (
  id,
  version,
  status,
  manifest_sha256,
  approved_by,
  released_at
)
VALUES (
  '70000000-0000-0000-0000-000000000001',
  'MAGNIOM-EVIDENCE-1.0.0',
  'active',
  decode('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'hex'),
  'c0000000-0000-0000-0000-000000000001',
  timezone('utc'::text, now())
) ON CONFLICT (version) DO NOTHING;

INSERT INTO evidence.library_claims (library_release_id, claim_version_id)
VALUES
  ('70000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001'),
  ('70000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000002'),
  ('70000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000003'),
  ('70000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000004'),
  ('70000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000005'),
  ('70000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000006'),
  ('70000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000007'),
  ('70000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000008'),
  ('70000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000009'),
  ('70000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000010')
ON CONFLICT DO NOTHING;

INSERT INTO evidence.library_circuits (library_release_id, circuit_version_id)
VALUES
  ('70000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001'),
  ('70000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000002'),
  ('70000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000003'),
  ('70000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000004'),
  ('70000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000005'),
  ('70000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000006'),
  ('70000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000007'),
  ('70000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;

INSERT INTO evidence.library_target_families (library_release_id, target_family_version_id)
VALUES
  ('70000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000001'),
  ('70000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000002'),
  ('70000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000003'),
  ('70000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000004'),
  ('70000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000005'),
  ('70000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000006'),
  ('70000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000007'),
  ('70000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000008'),
  ('70000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000009')
ON CONFLICT DO NOTHING;

