import type { ScientificPolicyRelease } from './policy.js';
import { computeSha256 } from './policy-hasher.js';

const policyPayload = {
  id: 'pol-mdd-v1.0.0',
  code: 'MAGNIOM-POLICY-MDD-1.0.0',
  semanticVersion: '1.0.0',
  title: 'Canonical MDD Decision Support Scientific Policy Release v1.0',
  description: 'Governs evidence-based and connectome-refined target selection for Major Depressive Disorder',
  lifecycleStatus: 'ACTIVE' as const,
  validationStatus: 'VALIDATED' as const,
  modeScope: ['CLINICAL', 'RESEARCH', 'VALIDATION'] as const,
  indicationScope: [
    {
      system: 'DSM-5' as const,
      code: '296.23',
      display: 'Major Depressive Disorder, Single Episode, Severe without Psychotic Features',
    },
    {
      system: 'ICD-11' as const,
      code: '6A70',
      display: 'Single episode depressive disorder',
    },
  ],
  compatibilityProfiles: [
    {
      id: 'prof-mdd-evidence-only',
      code: 'PROF-MDD-EVIDENCE-ONLY-1.0',
      indication: {
        system: 'DSM-5' as const,
        code: '296.23',
        display: 'Major Depressive Disorder',
      },
      mode: 'CLINICAL' as const,
      capability: 'evidence_only' as const,
      evidenceLibraryReleaseId: 'ev-rel-mdd-1.0.0',
      targetEngineVersionId: 'te-v1.0.0',
      pipeline: {
        requirement: 'disabled' as const,
        permittedVersionIds: [],
      },
      normativeModel: {
        requirement: 'disabled' as const,
        permittedVersionIds: [],
      },
      efieldEngine: {
        requirement: 'disabled' as const,
        permittedVersionIds: [],
      },
      phenotypeOntologyVersionId: 'ont-mdd-1.0.0',
      compatible: true,
      validationEvidenceIds: ['val-g01-evidence-only'],
      limitations: ['Personalisation not available without resting-state fMRI.'],
    },
    {
      id: 'prof-mdd-connectome-refined',
      code: 'PROF-MDD-CONNECTOME-REFINED-1.0',
      indication: {
        system: 'DSM-5' as const,
        code: '296.23',
        display: 'Major Depressive Disorder',
      },
      mode: 'CLINICAL' as const,
      capability: 'connectome_refined' as const,
      evidenceLibraryReleaseId: 'ev-rel-mdd-1.0.0',
      targetEngineVersionId: 'te-v1.0.0',
      pipeline: {
        requirement: 'required' as const,
        permittedVersionIds: ['pipe-fmriprep-23.2.0'],
      },
      normativeModel: {
        requirement: 'optional' as const,
        permittedVersionIds: ['norm-hcp-ya-1.0.0'],
      },
      efieldEngine: {
        requirement: 'optional' as const,
        permittedVersionIds: ['simnibs-4.0.0'],
      },
      phenotypeOntologyVersionId: 'ont-mdd-1.0.0',
      compatible: true,
      validationEvidenceIds: ['val-g02-personalisation'],
      limitations: ['Requires minimum 10 min usable fMRI and mean FD <= 0.20 mm.'],
    },
  ],
  evidencePolicy: {
    tierPermissions: [
      {
        tier: 'T1' as const,
        standalonePrimary: true,
        standaloneAdditional: true,
        mayRefineParentTiers: [],
        maySupplySupportingContext: true,
        permittedCandidateRoles: ['PRIMARY_1', 'PRIMARY_2', 'PRIMARY_3', 'ADDITIONAL_A', 'ADDITIONAL_B'] as const,
        permittedGenerationMethods: ['EVIDENCE_ONLY_PRIOR', 'CONNECTOME_REFINED'] as const,
      },
      {
        tier: 'T2' as const,
        standalonePrimary: true,
        standaloneAdditional: true,
        mayRefineParentTiers: ['T1'] as const,
        maySupplySupportingContext: true,
        permittedCandidateRoles: ['PRIMARY_2', 'PRIMARY_3', 'ADDITIONAL_A', 'ADDITIONAL_B'] as const,
        permittedGenerationMethods: ['EVIDENCE_ONLY_PRIOR', 'CONNECTOME_REFINED'] as const,
      },
      {
        tier: 'T3' as const,
        standalonePrimary: false,
        standaloneAdditional: true,
        mayRefineParentTiers: ['T1', 'T2'] as const,
        maySupplySupportingContext: true,
        permittedCandidateRoles: ['ADDITIONAL_A', 'ADDITIONAL_B'] as const,
        permittedGenerationMethods: ['EVIDENCE_ONLY_PRIOR'] as const,
      },
      {
        tier: 'T4' as const,
        standalonePrimary: false,
        standaloneAdditional: false,
        mayRefineParentTiers: [],
        maySupplySupportingContext: true,
        permittedCandidateRoles: [],
        permittedGenerationMethods: [],
      },
      {
        tier: 'T_EXP' as const,
        standalonePrimary: false,
        standaloneAdditional: false,
        mayRefineParentTiers: [],
        maySupplySupportingContext: false,
        permittedCandidateRoles: [],
        permittedGenerationMethods: [],
      },
    ],
    minReliabilityForPersonalisation: 0.70,
    minIncrementalGainThreshold: 0.10,
  },
  parameters: {
    maxAllowableDisplacementMm: 15.0,
    minScanDurationMinutes: 8.0,
    maxMeanFramewiseDisplacementMm: 0.25,
    minRetainedFramesPercentage: 80.0,
    minTemporalSnr: 30.0,
    maxSplitHalfDistanceMm: 12.0,
    defaultEvidenceBaselineMni: '[-38, 44, 30]',
  },
  createdAt: '2026-09-01T00:00:00.000Z',
  releasedAt: '2026-09-01T00:00:00.000Z',
};

const payloadSha = computeSha256(policyPayload);
const compSha = computeSha256(policyPayload.compatibilityProfiles);
const releaseSha = computeSha256({
  payloadSha,
  compSha,
  code: policyPayload.code,
  version: policyPayload.semanticVersion,
});

export const DEFAULT_MDD_SCIENTIFIC_POLICY: ScientificPolicyRelease = {
  ...policyPayload,
  policyPayloadSha256: payloadSha,
  compatibilityManifestSha256: compSha,
  releaseManifestSha256: releaseSha,
};

export const SYNTHETIC_POLICY_V1 = {
  ...DEFAULT_MDD_SCIENTIFIC_POLICY,
  version: DEFAULT_MDD_SCIENTIFIC_POLICY.semanticVersion,
};
