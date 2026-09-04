/**
 * MAGNIOM Canonical Scientific Policy Release v2.0.0
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0
 * Integrates all 8 Indication Module Bindings, Parameters, Prohibitions, Approvals, and Signatures
 */

import type {
  ScientificPolicyReleaseV2,
  ScientificPolicyParameter,
  ProhibitedScientificConfiguration,
  ScientificPolicyApproval,
  ScientificPolicySignature,
} from '@magniom/domain';
import { computeSha256 } from '../policy-hasher.js';

import { MDD_INDICATION_POLICY_BINDING, MDD_COMPATIBILITY_CONFIGURATIONS } from './mdd-policy.js';
import {
  PAIN_INDICATION_POLICY_BINDING,
  PAIN_COMPATIBILITY_CONFIGURATIONS,
} from './pain-policy.js';
import {
  STROKE_MOTOR_INDICATION_POLICY_BINDING,
  STROKE_MOTOR_COMPATIBILITY_CONFIGURATIONS,
} from './stroke-motor-policy.js';
import {
  APHASIA_INDICATION_POLICY_BINDING,
  APHASIA_COMPATIBILITY_CONFIGURATIONS,
} from './stroke-aphasia-policy.js';
import { OCD_INDICATION_POLICY_BINDING, OCD_COMPATIBILITY_CONFIGURATIONS } from './ocd-policy.js';
import { TBI_INDICATION_POLICY_BINDING, TBI_COMPATIBILITY_CONFIGURATIONS } from './tbi-policy.js';
import {
  PTSD_INDICATION_POLICY_BINDING,
  PTSD_COMPATIBILITY_CONFIGURATIONS,
} from './ptsd-policy.js';
import {
  TINNITUS_INDICATION_POLICY_BINDING,
  TINNITUS_COMPATIBILITY_CONFIGURATIONS,
} from './tinnitus-policy.js';

export const CANONICAL_POLICY_V2_ID = '00000000-0000-0000-0000-000000000099';
export const CANONICAL_POLICY_V2_CODE = 'MAGNIOM-POLICY-V2.0.0';

export const CANONICAL_POLICY_V2_PARAMETERS: readonly ScientificPolicyParameter[] = [
  {
    id: 'param-mdd-fc-rel',
    code: 'param.mdd.fc_reliability_threshold',
    namespace: 'mdd',
    valueType: 'number',
    defaultValue: 0.7,
    bounds: { minValue: 0.5, maxValue: 0.95, unit: 'correlation_r' },
    clinicalJustification:
      'Validated minimum split-half sgACC-DLPFC concordance for patient-specific refinement.',
    frozen: true,
  },
  {
    id: 'param-mdd-inc-gain',
    code: 'param.mdd.min_incremental_gain',
    namespace: 'mdd',
    valueType: 'number',
    defaultValue: 0.1,
    bounds: { minValue: 0.01, maxValue: 0.5, unit: 'delta_utility' },
    clinicalJustification:
      'Minimum incremental value required for refinement to displace evidence baseline (§64).',
    frozen: true,
  },
  {
    id: 'param-mdd-redundancy',
    code: 'param.mdd.spatial_redundancy_mm',
    namespace: 'mdd',
    valueType: 'number',
    defaultValue: 15.0,
    bounds: { minValue: 5.0, maxValue: 30.0, unit: 'mm' },
    clinicalJustification: 'Spatial suppression distance for redundant DLPFC candidates.',
    frozen: true,
  },
  {
    id: 'param-pain-hotspot-rep',
    code: 'param.pain.max_hotspot_repeatability_mm',
    namespace: 'pain',
    valueType: 'number',
    defaultValue: 5.0,
    bounds: { minValue: 1.0, maxValue: 10.0, unit: 'mm' },
    clinicalJustification:
      'Maximum allowed motor hotspot test-retest displacement for refinement qualification (§146).',
    frozen: true,
  },
  {
    id: 'param-pain-inc-gain',
    code: 'param.pain.min_incremental_gain',
    namespace: 'pain',
    valueType: 'number',
    defaultValue: 0.15,
    bounds: { minValue: 0.05, maxValue: 0.5, unit: 'delta_utility' },
    clinicalJustification: 'Minimum gain for motor-map refinement over somatotopic M1 baseline.',
    frozen: true,
  },
  {
    id: 'param-pain-redundancy',
    code: 'param.pain.spatial_redundancy_mm',
    namespace: 'pain',
    valueType: 'number',
    defaultValue: 12.0,
    bounds: { minValue: 5.0, maxValue: 25.0, unit: 'mm' },
    clinicalJustification: 'Spatial clustering threshold for M1 somatotopic targets.',
    frozen: true,
  },
  {
    id: 'param-stroke-dice',
    code: 'param.stroke.min_lesion_dice',
    namespace: 'stroke',
    valueType: 'number',
    defaultValue: 0.8,
    bounds: { minValue: 0.6, maxValue: 0.99, unit: 'dice_coefficient' },
    clinicalJustification:
      'Minimum lesion segmentation agreement required for stroke motor targeting (§147).',
    frozen: true,
  },
  {
    id: 'param-stroke-redundancy',
    code: 'param.stroke.spatial_redundancy_mm',
    namespace: 'stroke',
    valueType: 'number',
    defaultValue: 20.0,
    bounds: { minValue: 10.0, maxValue: 40.0, unit: 'mm' },
    clinicalJustification:
      'Suppression radius between ipsilesional and contralesional motor candidates.',
    frozen: true,
  },
  {
    id: 'param-aphasia-redundancy',
    code: 'param.aphasia.spatial_redundancy_mm',
    namespace: 'aphasia',
    valueType: 'number',
    defaultValue: 15.0,
    bounds: { minValue: 5.0, maxValue: 30.0, unit: 'mm' },
    clinicalJustification: 'Spatial diversity radius for right IFG language candidates.',
    frozen: true,
  },
  {
    id: 'param-ocd-redundancy',
    code: 'param.ocd.spatial_redundancy_mm',
    namespace: 'ocd',
    valueType: 'number',
    defaultValue: 25.0,
    bounds: { minValue: 15.0, maxValue: 50.0, unit: 'mm' },
    clinicalJustification: 'Coil-field spatial diversity distance.',
    frozen: true,
  },
  {
    id: 'param-tbi-redundancy',
    code: 'param.tbi.spatial_redundancy_mm',
    namespace: 'tbi',
    valueType: 'number',
    defaultValue: 15.0,
    bounds: { minValue: 5.0, maxValue: 30.0, unit: 'mm' },
    clinicalJustification: 'TBI network diversity threshold.',
    frozen: true,
  },
  {
    id: 'param-ptsd-redundancy',
    code: 'param.ptsd.spatial_redundancy_mm',
    namespace: 'ptsd',
    valueType: 'number',
    defaultValue: 15.0,
    bounds: { minValue: 5.0, maxValue: 30.0, unit: 'mm' },
    clinicalJustification: 'PTSD circuit diversity threshold.',
    frozen: true,
  },
  {
    id: 'param-tinnitus-redundancy',
    code: 'param.tinnitus.spatial_redundancy_mm',
    namespace: 'tinnitus',
    valueType: 'number',
    defaultValue: 15.0,
    bounds: { minValue: 5.0, maxValue: 30.0, unit: 'mm' },
    clinicalJustification: 'Temporoparietal diversity threshold.',
    frozen: true,
  },
];

export const CANONICAL_POLICY_V2_GLOBAL_PROHIBITIONS: readonly ProhibitedScientificConfiguration[] =
  [
    {
      id: 'prohib-01',
      code: 'PROHIBIT_RESEARCH_MODULE_IN_CLINICAL',
      description: 'Research-only IndicationModule cannot be executed in Clinical Mode (§103).',
      conditionPredicate: 'mode === clinical && module.maturity === research_only',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-02',
      code: 'PROHIBIT_RESEARCH_EVIDENCE_PATH_IN_CLINICAL',
      description: 'Research-only EvidencePath cannot establish Clinical targets (§103).',
      conditionPredicate: 'mode === clinical && path.permittedModes.includes(clinical) === false',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-03',
      code: 'PROHIBIT_UNASSIGNED_EVIDENCE_IN_CLINICAL',
      description:
        'Unassigned evidence governance classification cannot confer Clinical authority (§32, §103, §154).',
      conditionPredicate: 'mode === clinical && evidence.classification === unassigned',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-04',
      code: 'PROHIBIT_UNAPPROVED_TARGETING_PLUGIN',
      description:
        'Unapproved or integrity-corrupted targeting plugin is prohibited in all modes (§53, §103, §156).',
      conditionPredicate: 'plugin.status !== approved || plugin.sha256Mismatch === true',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-05',
      code: 'PROHIBIT_UNAPPROVED_CANDIDATE_GENERATOR',
      description: 'Unapproved candidate generator cannot nominate Clinical targets (§52, §103).',
      conditionPredicate:
        'mode === clinical && generator.status !== permitted && generator.status !== required',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-06',
      code: 'PROHIBIT_GENERATOR_MODULE_MISMATCH',
      description:
        'Candidate generator not explicitly registered to IndicationModule is prohibited (§103).',
      conditionPredicate: 'generator.moduleReleaseId !== module.releaseId',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-07',
      code: 'PROHIBIT_MODULE_INDICATION_MISMATCH',
      description:
        'Module execution on unaligned patient indication diagnosis is prohibited (§103, §104).',
      conditionPredicate: 'patient.indicationCode !== module.indicationCode',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-08',
      code: 'PROHIBIT_UNAPPROVED_TARGET_GEOMETRY',
      description:
        'Target geometry unapproved for the active target family is prohibited (§36, §103, §149).',
      conditionPredicate: 'family.permittedGeometries.includes(target.geometry) === false',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-09',
      code: 'PROHIBIT_RESEARCH_MEASUREMENT_IN_CLINICAL',
      description:
        'Research-only measurement capability cannot be used for Clinical targets (§41, §103).',
      conditionPredicate: 'mode === clinical && capability.requirement === research_only',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-10',
      code: 'PROHIBIT_FAILED_REQUIRED_RELIABILITY',
      description:
        'Measurement capability with failed reliability check cannot be used without fallback (§42, §103, §145).',
      conditionPredicate: 'reliability.passed === false && fallbackRule === undefined',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-11',
      code: 'PROHIBIT_INCOMPATIBLE_MEASUREMENT_PROVIDER',
      description:
        'Measurement provider not listed in compatibility configuration is prohibited (§11, §103).',
      conditionPredicate: 'provider.isWhitelisted === false',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-12',
      code: 'PROHIBIT_INCOMPATIBLE_ACQUISITION_PROFILE',
      description:
        'Acquisition profile violating minimum protocol requirements is prohibited (§103).',
      conditionPredicate: 'acquisition.meetsMinimumRequirements === false',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-13',
      code: 'PROHIBIT_INCOMPATIBLE_NORMATIVE_MODEL',
      description:
        'Normative model not explicitly authorized for the active indication is prohibited (§73, §103).',
      conditionPredicate: 'normativeModel.authorizedForIndication === false',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-14',
      code: 'PROHIBIT_INCOMPATIBLE_EFIELD_ENGINE',
      description:
        'E-field simulation engine unverified for clinical target family is prohibited (§75, §103).',
      conditionPredicate: 'efieldEngine.authorized === false',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-15',
      code: 'PROHIBIT_INCOMPATIBLE_DEVICE_COIL',
      description:
        'TMS device or coil class incompatible with target semantics is prohibited (§78, §103).',
      conditionPredicate: 'device.isCompatibleWithTargetFamily === false',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-16',
      code: 'PROHIBIT_OUT_OF_BOUNDS_PARAMETER',
      description:
        'Scientific parameter outside validated bounds is rejected; silent clamping is prohibited (§91, §103, §157).',
      conditionPredicate: 'param.value < param.min || param.value > param.max',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-17',
      code: 'PROHIBIT_MISSING_SCIENTIFIC_PROVENANCE',
      description:
        'Entity lacking complete cryptographically traceable provenance is prohibited (§103, §125).',
      conditionPredicate: 'provenance.missingOrInvalid === true',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-18',
      code: 'PROHIBIT_UNSIGNED_INVALID_POLICY_RELEASE',
      description:
        'Scientific policy release lacking required cryptographic signatures or hash integrity is prohibited (§103, §126, §127).',
      conditionPredicate: 'policy.integrityValid === false || policy.signaturesValid === false',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-19',
      code: 'PROHIBIT_UNPINNED_SCIENTIFIC_SELECTOR',
      description:
        'Dynamic unpinned component version selectors (latest, ^, *) are strictly prohibited (§103).',
      conditionPredicate: 'version.isSemverPinned === false',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-20',
      code: 'PROHIBIT_DYNAMIC_PUBMED_INPUT',
      description:
        'Runtime dynamic scraping of scientific literature into targeting decisions is prohibited (§103).',
      conditionPredicate: 'dynamicLiteratureScrapeAttempted === true',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-21',
      code: 'PROHIBIT_LLM_GENERATED_RANKING',
      description:
        'Unverifiable LLM-generated coordinates or ranking outputs are prohibited (§103).',
      conditionPredicate: 'llmGeneratedCoordinatesAttempted === true',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-22',
      code: 'PROHIBIT_RUNTIME_RANDOM_INPUT',
      description:
        'Non-deterministic runtime random numbers in clinical candidate generation are prohibited (§103).',
      conditionPredicate: 'nonDeterministicRandomUsed === true',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-23',
      code: 'PROHIBIT_ONLINE_AUTO_LEARNING',
      description:
        'Dynamic or outcome-driven weight auto-learning in clinical mode is strictly prohibited (§103, §108).',
      conditionPredicate: 'mode === clinical && auto_learning === true',
      severity: 'FATAL_REJECT',
    },
    {
      id: 'prohib-24',
      code: 'PROHIBIT_ORGANISATION_LOCAL_OVERRIDE',
      description:
        'Administrative or UI override of frozen scientific thresholds is strictly prohibited (§103, §109).',
      conditionPredicate: 'localScientificOverrideAttempted === true',
      severity: 'FATAL_REJECT',
    },
  ];

export const CANONICAL_POLICY_V2_APPROVALS: readonly ScientificPolicyApproval[] = [
  {
    id: 'appr-sci-01',
    policyReleaseId: CANONICAL_POLICY_V2_ID,
    approvalRole: 'scientific',
    approverId: '00000000-0000-0000-0000-000000000901',
    approverName: 'Prof. S. R. Connectomics (Chief Scientific Officer)',
    decision: 'approved',
    rationale:
      'Positive whitelisting and indication-bound authority validated across all 8 modules.',
    approvedAt: '2026-09-02T12:00:00Z',
  },
  {
    id: 'appr-clin-01',
    policyReleaseId: CANONICAL_POLICY_V2_ID,
    approvalRole: 'clinical',
    approverId: '00000000-0000-0000-0000-000000000902',
    approverName: 'Dr. M. A. Neuromodulation (Clinical Director)',
    decision: 'approved',
    rationale:
      'Approved MDD clinical continuation, Pain/Stroke/OCD validation, and TBI/PTSD/Tinnitus research boundaries.',
    approvedAt: '2026-09-02T12:30:00Z',
  },
  {
    id: 'appr-tech-01',
    policyReleaseId: CANONICAL_POLICY_V2_ID,
    approvalRole: 'technical',
    approverId: '00000000-0000-0000-0000-000000000903',
    approverName: 'Dr. E. V. Architecture (VP Software Engineering)',
    decision: 'approved',
    rationale: 'Deterministic execution and zero-clamp bounds verified.',
    approvedAt: '2026-09-02T13:00:00Z',
  },
  {
    id: 'appr-qual-01',
    policyReleaseId: CANONICAL_POLICY_V2_ID,
    approvalRole: 'quality_regulatory',
    approverId: '00000000-0000-0000-0000-000000000904',
    approverName: 'J. K. Regulatory (Quality & Regulatory Assurance Director)',
    decision: 'approved',
    rationale: 'IEC 62304 / ISO 13485 design control requirements verified.',
    approvedAt: '2026-09-02T14:00:00Z',
  },
];

export const CANONICAL_POLICY_V2_SIGNATURES: readonly ScientificPolicySignature[] = [
  {
    signerRole: 'scientific_lead',
    signerName: 'Prof. S. R. Connectomics',
    signerEmail: 'scientific.lead@magniom.org',
    keyId: 'key-ed25519-sci-lead-2026',
    algorithm: 'Ed25519',
    signature:
      '7a9c3f81e2b4d605c9a7e1f3d5b7a9c1e3f5d7b9a1c3e5f7d9b1a3c5e7f9d1b37a9c3f81e2b4d605c9a7e1f3d5b7a9c1e3f5d7b9a1c3e5f7d9b1a3c5e7f9d1b3',
    signedAt: '2026-09-02T15:00:00Z',
  },
  {
    signerRole: 'technical_lead',
    signerName: 'Dr. E. V. Architecture',
    signerEmail: 'technical.lead@magniom.org',
    keyId: 'key-ed25519-tech-lead-2026',
    algorithm: 'Ed25519',
    signature:
      '8b0d4a92f3c5e716dab8f2a4e6c8b0d2f4a6e8c0b2d4f6a8e0c2b4d6f8a0e2c48b0d4a92f3c5e716dab8f2a4e6c8b0d2f4a6e8c0b2d4f6a8e0c2b4d6f8a0e2c4',
    signedAt: '2026-09-02T15:30:00Z',
  },
];

const parameterValues: Record<string, number> = {
  'param.mdd.fc_reliability_threshold': 0.7,
  'param.mdd.min_incremental_gain': 0.1,
  'param.mdd.spatial_redundancy_mm': 15.0,
  'param.pain.max_hotspot_repeatability_mm': 5.0,
  'param.pain.min_incremental_gain': 0.15,
  'param.pain.spatial_redundancy_mm': 12.0,
  'param.stroke.min_lesion_dice': 0.8,
  'param.stroke.spatial_redundancy_mm': 20.0,
  'param.aphasia.spatial_redundancy_mm': 15.0,
  'param.ocd.spatial_redundancy_mm': 25.0,
  'param.tbi.spatial_redundancy_mm': 15.0,
  'param.ptsd.spatial_redundancy_mm': 15.0,
  'param.tinnitus.spatial_redundancy_mm': 15.0,
};

const allBindings = [
  MDD_INDICATION_POLICY_BINDING,
  PAIN_INDICATION_POLICY_BINDING,
  STROKE_MOTOR_INDICATION_POLICY_BINDING,
  APHASIA_INDICATION_POLICY_BINDING,
  OCD_INDICATION_POLICY_BINDING,
  TBI_INDICATION_POLICY_BINDING,
  PTSD_INDICATION_POLICY_BINDING,
  TINNITUS_INDICATION_POLICY_BINDING,
];

const allConfigurations = [
  ...MDD_COMPATIBILITY_CONFIGURATIONS,
  ...PAIN_COMPATIBILITY_CONFIGURATIONS,
  ...STROKE_MOTOR_COMPATIBILITY_CONFIGURATIONS,
  ...APHASIA_COMPATIBILITY_CONFIGURATIONS,
  ...OCD_COMPATIBILITY_CONFIGURATIONS,
  ...TBI_COMPATIBILITY_CONFIGURATIONS,
  ...PTSD_COMPATIBILITY_CONFIGURATIONS,
  ...TINNITUS_COMPATIBILITY_CONFIGURATIONS,
];

const unsignedPayloadData = {
  id: CANONICAL_POLICY_V2_ID,
  code: CANONICAL_POLICY_V2_CODE,
  semanticVersion: '2.0.0',
  title: 'Canonical Multi-Indication Decision Support Scientific Policy Release v2.0',
  description:
    'Authorizes indication-specific compatibility tuples, candidate generators, measurement capabilities, and parameters for MDD, Pain, Stroke, Aphasia, OCD, TBI, PTSD, and Tinnitus.',
  lifecycleStatus: 'active' as const,
  validationStatus: 'clinical_release_qualified' as const,
  scope: 'multi_indication' as const,
  indicationPolicyBindings: allBindings,
  compatibilityConfigurations: allConfigurations,
  globalProhibitions: CANONICAL_POLICY_V2_GLOBAL_PROHIBITIONS,
  parameterDefinitions: CANONICAL_POLICY_V2_PARAMETERS,
  parameterValues,
  validationEvidenceIds: [
    'VAL-MDD-001',
    'VAL-MDD-002',
    'VAL-PAIN-001',
    'VAL-STROKE-001',
    'VAL-APHASIA-001',
    'VAL-OCD-001',
    'VAL-PTSD-001',
  ],
  changeClassification: 'INDICATION_MODULE' as const,
  createdAt: '2026-09-02T12:00:00Z',
  releasedAt: '2026-09-02T16:00:00Z',
};

const payloadSha256 = computeSha256(unsignedPayloadData);
const compatibilityManifestSha256 = computeSha256(allConfigurations);
const releaseManifestSha256 = computeSha256({
  policyId: CANONICAL_POLICY_V2_ID,
  moduleCount: allBindings.length,
  configCount: allConfigurations.length,
  payloadSha256,
});

export const CANONICAL_SCIENTIFIC_POLICY_V2_0_0: ScientificPolicyReleaseV2 = {
  ...unsignedPayloadData,
  payloadSha256,
  compatibilityManifestSha256,
  releaseManifestSha256,
  approvals: CANONICAL_POLICY_V2_APPROVALS,
  signatures: CANONICAL_POLICY_V2_SIGNATURES,
};
