/**
 * @magniom/test-fixtures - Phase 5 MDD Golden Suite Fixtures (Roadmap §33)
 * Retaining and migrating applicable v1 cases covering the 10 canonical MDD scenarios.
 */

import { MDD_MODULE_RELEASE_ID } from '@magniom/target-engine';
import {
  type SyntheticGoldenCaseDefinition,
  createMockPhenotypeSnapshot,
  createMockClinicalObjective,
  createMockMeasurementBundle,
  createMockReliabilityBundle,
  createMockEvidencePath,
} from './fixture-builders.js';

export { type SyntheticGoldenCaseDefinition };

function createBaseMddInput(
  caseId: string,
): import('@magniom/target-engine').SyntheticVerticalSliceInput {
  const phenotypeSnapshot = createMockPhenotypeSnapshot({
    id: `ps-${caseId}`,
    primaryDiagnosis: 'Major Depressive Disorder, Recurrent, Severe',
  });

  const clinicalObjectives = [
    createMockClinicalObjective({
      id: `obj-${caseId}-core`,
      caseIndicationId: `ci-${caseId}`,
      code: 'OBJ-MDD-CORE',
      display: 'Remission of Core Depressive Symptoms',
    }),
  ];

  const measurementBundle = createMockMeasurementBundle({
    id: `mb-${caseId}`,
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    phenotypeSnapshotId: phenotypeSnapshot.id,
    modality: 'resting_state_fmri',
  });

  const reliabilityBundle = createMockReliabilityBundle({
    id: `rel-${caseId}`,
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    measurementBundleId: measurementBundle.id,
  });

  const authorizedEvidencePaths = [
    createMockEvidencePath({
      id: 'EP-MDD-LDLPFC-001',
      indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      clinicalObjectiveId: clinicalObjectives[0]!.id,
      targetGeometryType: 'point',
    }),
    createMockEvidencePath({
      id: 'EP-MDD-DMPFC-002',
      indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
      targetFamilyId: 'TF-MDD-DMPFC-001',
      clinicalObjectiveId: clinicalObjectives[0]!.id,
      targetGeometryType: 'point',
    }),
  ];

  return {
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationCode: 'MDD',
    mode: 'clinical',
    clinicalContext: {
      phenotypeSnapshot,
    },
    clinicalObjectives,
    measurementBundle,
    reliabilityBundle,
    authorizedEvidencePaths,
  };
}

export const MDD_GOLDEN_SUITE: readonly SyntheticGoldenCaseDefinition[] = [
  // 1. MDD-GC-01: High Convergence (G02)
  {
    id: 'MDD-GC-01',
    name: 'High Convergence Personalisation',
    indicationCode: 'MDD',
    section: '§33',
    description:
      'Connectome-refined candidate converges within 8.25mm of evidence prior with +0.18 circuit gain.',
    input: createBaseMddInput('mdd-gc-01'),
    decisionIntent: {
      clinicianId: 'clinician-mdd-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-mdd-ldlpfc-refined'],
      overallReasoning:
        'Accepting convergent connectome-refined left DLPFC candidate based on robust sgACC anticorrelation.',
      magniomInfluence: 'major',
    },
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-MDD-LDLPFC-EST-001'],
      expectedGeometries: ['point'],
    },
  },

  // 2. MDD-GC-02: Large Evidence-vs-FC Displacement (G09)
  {
    id: 'MDD-GC-02',
    name: 'Large Evidence-vs-FC Displacement (>30mm)',
    indicationCode: 'MDD',
    section: '§33',
    description: 'Connectome hotspot divergent by >30mm is suppressed by anatomical envelope gate.',
    input: createBaseMddInput('mdd-gc-02'),
    decisionIntent: {
      clinicianId: 'clinician-mdd-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-mdd-ldlpfc-baseline'],
      overallReasoning:
        'Adopting standard evidence anchor because individual FC hotspot was anatomically divergent.',
      magniomInfluence: 'moderate',
    },
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-MDD-LDLPFC-EST-001'],
    },
  },

  // 3. MDD-GC-03: High Quality but No Useful Personalisation (G03)
  {
    id: 'MDD-GC-03',
    name: 'High Quality but Low Incremental Value',
    indicationCode: 'MDD',
    section: '§33',
    description:
      'Connectome offers only +0.04 incremental gain (< 0.10 threshold); baseline prior retained.',
    input: createBaseMddInput('mdd-gc-03'),
    decisionIntent: {
      clinicianId: 'clinician-mdd-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-mdd-ldlpfc-baseline'],
      overallReasoning:
        'Baseline evidence anchor retained because connectome refinement lacked incremental clinical value.',
      magniomInfluence: 'minor',
    },
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-MDD-LDLPFC-EST-001'],
    },
  },

  // 4. MDD-GC-04: Poor Imaging Fallback (G04)
  {
    id: 'MDD-GC-04',
    name: 'Poor Imaging Fallback to Evidence Prior',
    indicationCode: 'MDD',
    section: '§33',
    description:
      'High-motion fMRI (reliability 0.42 < 0.70) falls back safely to evidence baseline prior.',
    input: createBaseMddInput('mdd-gc-04'),
    decisionIntent: {
      clinicianId: 'clinician-mdd-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-mdd-ldlpfc-baseline'],
      overallReasoning:
        'Imaging discarded due to excessive patient head motion; baseline prior adopted.',
      magniomInfluence: 'minor',
    },
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-MDD-LDLPFC-EST-001'],
    },
  },

  // 5. MDD-GC-05: Only One Meaningful Target (G06)
  {
    id: 'MDD-GC-05',
    name: 'Dysphoric-Dominant Single Circuit',
    indicationCode: 'MDD',
    section: '§33',
    description:
      'Pure dysphoric presentation generates single primary Left DLPFC candidate without secondary circuits.',
    input: createBaseMddInput('mdd-gc-05'),
    decisionIntent: {
      clinicianId: 'clinician-mdd-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-mdd-ldlpfc-baseline'],
      overallReasoning: 'Single left DLPFC target fits pure dysphoric phenotype.',
      magniomInfluence: 'moderate',
    },
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-MDD-LDLPFC-EST-001'],
    },
  },

  // 6. MDD-GC-06: Two Clinically Distinct Circuits (G05/G07)
  {
    id: 'MDD-GC-06',
    name: 'Two Clinically Distinct Circuits',
    indicationCode: 'MDD',
    section: '§33',
    description:
      'Mixed dysphoric and anxiosomatic phenotype allocates Left DLPFC (Primary 1) and DMPFC (Primary 2).',
    input: createBaseMddInput('mdd-gc-06'),
    decisionIntent: {
      clinicianId: 'clinician-mdd-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-mdd-ldlpfc-baseline'],
      overallReasoning:
        'Dual circuit slate reviewed; selecting primary Left DLPFC for initial treatment phase.',
      magniomInfluence: 'moderate',
    },
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-MDD-LDLPFC-EST-001'],
    },
  },

  // 7. MDD-GC-07: Research Anomaly (G08)
  {
    id: 'MDD-GC-07',
    name: 'Research Target Blocked in Clinical Mode',
    indicationCode: 'MDD',
    section: '§33',
    description:
      'Exploratory Tier 4 targets (Area 8Av) strictly blocked from clinical mode slates.',
    input: createBaseMddInput('mdd-gc-07'),
    expected: {
      primaryCandidateCount: 1,
      researchOnlyBlockedInClinical: true,
    },
  },

  // 8. MDD-GC-08: Clinician Rejects Primary 1
  {
    id: 'MDD-GC-08',
    name: 'Clinician Rejects Primary 1',
    indicationCode: 'MDD',
    section: '§33',
    description:
      'Clinician rejects algorithmic Primary 1 candidate, documents required divergence rationale.',
    input: createBaseMddInput('mdd-gc-08'),
    decisionIntent: {
      clinicianId: 'clinician-mdd-01',
      decisionType: 'REJECTED',
      selectedCandidateIds: [],
      candidateDispositions: [
        {
          candidateId: 'cand-mdd-ldlpfc-baseline',
          action: 'reject',
          reasonCodes: ['Patient anatomical / skull depth concern'],
          freeTextReason: 'Severe left temporal skull defect near DLPFC window.',
        },
      ],
      overallReasoning:
        'Primary 1 rejected due to anatomical contraindication in left prefrontal bone window.',
      magniomInfluence: 'none',
      disagreementWithMagniom:
        'Algorithmic nomination did not account for local craniotomy margin.',
    },
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // 9. MDD-GC-09: Clinician Selects Alternate Target
  {
    id: 'MDD-GC-09',
    name: 'Clinician Selects Alternate Target',
    indicationCode: 'MDD',
    section: '§33',
    description:
      'Clinician rejects Primary 1 and accepts counterfactual Additional candidate as final treatment target.',
    input: createBaseMddInput('mdd-gc-09'),
    decisionIntent: {
      clinicianId: 'clinician-mdd-01',
      decisionType: 'SUBSTITUTED_ALTERNATIVE',
      selectedCandidateIds: ['cand-mdd-ldlpfc-alt'],
      candidateDispositions: [
        {
          candidateId: 'cand-mdd-ldlpfc-baseline',
          action: 'reject',
          reasonCodes: ['Documented prior treatment non-response'],
          freeTextReason: 'Patient previously failed 30 sessions at F3 beam coordinate.',
        },
        {
          candidateId: 'cand-mdd-ldlpfc-alt',
          action: 'accept',
          reasonCodes: ['Optimal anatomical depth & accessibility'],
        },
      ],
      overallReasoning:
        'Selected alternate anterior target due to prior failure of standard F3 stimulation.',
      magniomInfluence: 'minor',
    },
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // 10. MDD-GC-10: Historical Evidence Version Change (G16)
  {
    id: 'MDD-GC-10',
    name: 'Historical Evidence Version Change',
    indicationCode: 'MDD',
    section: '§33',
    description:
      'Historical slate outputs remain immutable across Evidence Library version upgrades.',
    input: createBaseMddInput('mdd-gc-10'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-MDD-LDLPFC-EST-001'],
    },
  },
];
