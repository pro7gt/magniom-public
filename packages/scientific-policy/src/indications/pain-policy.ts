/**
 * MAGNIOM Initial Scientific Policy — Neuropathic Pain
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§23, §114, §146, §186)
 */

import type {
  IndicationPolicyBinding,
  ScientificCompatibilityConfiguration,
} from '@magniom/domain';

export const PAIN_MODULE_RELEASE_ID = '00000000-0000-0000-0000-000000000002';
export const PAIN_CONFIG_VALIDATION_ID = '00000000-0000-0000-0000-000000000303';
export const PAIN_CONFIG_BASELINE_ID = '00000000-0000-0000-0000-000000000304';

export const PAIN_COMPATIBILITY_CONFIGURATIONS: readonly ScientificCompatibilityConfiguration[] = [
  {
    id: PAIN_CONFIG_VALIDATION_ID,
    code: 'PAIN-MOTOR-MAP-VALIDATION-2.0',
    version: '2.0.0',
    scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000099',
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    mode: 'validation',
    evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000102',
    targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
    targetingPlugin: {
      componentType: 'TARGETING_PLUGIN',
      componentId: 'plugin-pain',
      componentVersion: '2.0.0',
      manifestSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    candidateGenerators: [
      {
        componentType: 'CANDIDATE_GENERATOR',
        componentId: 'gen-pain-somatotopic-baseline',
        componentVersion: '2.0.0',
      },
      {
        componentType: 'CANDIDATE_GENERATOR',
        componentId: 'gen-pain-motor-map-refinement',
        componentVersion: '2.0.0',
      },
    ],
    measurementProviders: [
      { componentType: 'structural_mri', requirement: 'required' },
      { componentType: 'motor_mapping', requirement: 'required' },
      { componentType: 'mep', requirement: 'optional' },
      { componentType: 'resting_state_fmri', requirement: 'disabled' },
    ],
    reliabilityMethods: [{ componentType: 'hotspot_repeatability', requirement: 'required' }],
    phenotypeOntologyReleaseId: '00000000-0000-0000-0000-000000000402',
    atlasReleases: [{ componentType: 'hcp_mmp1', requirement: 'required' }],
    normativeModels: [],
    deviceCapabilityProfiles: [{ componentType: 'figure8_standard', requirement: 'required' }],
    acquisitionProfiles: [{ componentType: 'pain_structural_profile_v1', requirement: 'required' }],
    compatibilityStatus: 'validated',
    validationEvidenceIds: ['VAL-PAIN-001'],
    configurationSha256: '9999999999999999999999999999999999999999999999999999999999999903',
  },
  {
    id: PAIN_CONFIG_BASELINE_ID,
    code: 'PAIN-SOMATOTOPIC-BASELINE-2.0',
    version: '2.0.0',
    scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000099',
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    mode: 'validation',
    evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000102',
    targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
    targetingPlugin: {
      componentType: 'TARGETING_PLUGIN',
      componentId: 'plugin-pain',
      componentVersion: '2.0.0',
      manifestSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    candidateGenerators: [
      {
        componentType: 'CANDIDATE_GENERATOR',
        componentId: 'gen-pain-somatotopic-baseline',
        componentVersion: '2.0.0',
      },
    ],
    measurementProviders: [
      { componentType: 'structural_mri', requirement: 'required' },
      { componentType: 'motor_mapping', requirement: 'disabled' },
    ],
    reliabilityMethods: [],
    phenotypeOntologyReleaseId: '00000000-0000-0000-0000-000000000402',
    atlasReleases: [{ componentType: 'hcp_mmp1', requirement: 'required' }],
    normativeModels: [],
    deviceCapabilityProfiles: [],
    acquisitionProfiles: [{ componentType: 'pain_structural_profile_v1', requirement: 'required' }],
    compatibilityStatus: 'validated',
    validationEvidenceIds: ['VAL-PAIN-001'],
    configurationSha256: '9999999999999999999999999999999999999999999999999999999999999904',
  },
];

export const PAIN_INDICATION_POLICY_BINDING: IndicationPolicyBinding = {
  id: '00000000-0000-0000-0000-000000000502',
  indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
  modulePermission: 'validation_only',
  permittedModes: ['validation', 'research'],
  evidencePathPermissions: [
    {
      evidencePathId: 'ep-pain-contralateral-m1',
      permittedModes: ['validation', 'research'],
      candidateRoles: ['somatotopic_target'],
      candidateGenerationMethodIds: [
        'gen-pain-somatotopic-baseline',
        'gen-pain-motor-map-refinement',
      ],
      standalonePrimary: true,
      standaloneAdditional: true,
      supportingContext: true,
      targetGeometryTypes: ['point'],
      limitations: ['Target must be contralateral to reported pain side.'],
    },
  ],
  targetGeometryPolicy: {
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    targetFamilyPermissions: [
      {
        targetFamilyId: 'tf-pain-m1-somatotopic',
        permittedGeometryTypes: ['point'],
        permittedGeneratorIds: ['gen-pain-somatotopic-baseline', 'gen-pain-motor-map-refinement'],
      },
    ],
  },
  measurementPolicy: {
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    requirements: [
      {
        capabilityCode: 'structural_mri',
        modality: 'structural_mri',
        requirement: 'required',
        permittedCandidateRoles: ['PRIMARY_1', 'PRIMARY_2'],
        permittedGeneratorIds: ['gen-pain-somatotopic-baseline'],
        missingMeasurementBehaviour: 'block',
        limitations: [],
      },
      {
        capabilityCode: 'motor_hotspot_refinement',
        modality: 'motor_mapping',
        requirement: 'required_for_refinement',
        permittedCandidateRoles: ['PRIMARY_1'],
        permittedGeneratorIds: ['gen-pain-motor-map-refinement'],
        missingMeasurementBehaviour: 'fallback',
        limitations: ['Motor hotspot repeatability must be <= 5.0 mm.'],
      },
    ],
    multimodalFusionPolicy: 'prohibited',
    fallbackRules: [
      {
        triggeringConditionCode: 'MOTOR_HOTSPOT_UNRELIABLE',
        fromCapability: 'motor_hotspot_refinement',
        fallbackConfigurationId: PAIN_CONFIG_BASELINE_ID,
        resultingCapabilityState: 'fallback_only',
        explanationTemplateId: 'tpl-pain-hotspot-fallback',
      },
    ],
  },
  reliabilityPolicy: {
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    capabilityRules: [
      {
        capabilityCode: 'motor_hotspot_refinement',
        reliabilityMethodIds: ['hotspot_repeatability'],
        minimumParameterRefs: ['param.pain.max_hotspot_repeatability_mm'],
        failureBehaviour: 'fallback',
        limitations: ['Repeatability exceeding 5.0 mm triggers fallback to somatotopic baseline.'],
      },
    ],
    overallBundleBehaviour: 'capability_specific',
  },
  candidateGenerationPolicy: {
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    pluginReleaseId: 'plugin-pain',
    generators: [
      {
        generatorId: 'gen-pain-somatotopic-baseline',
        generatorVersion: '2.0.0',
        status: 'permitted',
        candidateRoles: ['PRIMARY_1', 'PRIMARY_2'],
        evidencePathIds: ['ep-pain-contralateral-m1'],
        targetFamilyIds: ['tf-pain-m1-somatotopic'],
        geometryTypes: ['point'],
        requiredCapabilityCodes: ['structural_mri'],
      },
      {
        generatorId: 'gen-pain-motor-map-refinement',
        generatorVersion: '2.0.0',
        status: 'permitted',
        candidateRoles: ['PRIMARY_1'],
        evidencePathIds: ['ep-pain-contralateral-m1'],
        targetFamilyIds: ['tf-pain-m1-somatotopic'],
        geometryTypes: ['point'],
        requiredCapabilityCodes: ['motor_hotspot_refinement'],
      },
    ],
  },
  rankingPolicy: {
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    comparisonDomainPermissions: [
      {
        domainCode: 'dom-pain-m1',
        permittedModes: ['validation', 'research'],
        allowedBasis: 'same_target_family_variants',
      },
    ],
    rankingProfiles: [
      {
        profileId: 'prof-pain-lexicographic',
        modelType: 'lexicographic',
        tieBreakingRuleId: 'tie-pain-default',
      },
    ],
    crossDomainScalarRanking: 'prohibited',
  },
  refinementPolicy: {
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    profiles: [
      {
        id: 'prof-pain-motor-refinement',
        refinementKind: 'motor_mapping',
        baselineRole: 'PRIMARY_2',
        refinedRole: 'PRIMARY_1',
        requiredCapabilityCodes: ['motor_hotspot_refinement'],
        permittedTargetFamilyIds: ['tf-pain-m1-somatotopic'],
        minimumIncrementalValueParameterRefs: ['param.pain.min_incremental_gain'],
        adoptionBehaviour: 'prefer_if_all_pass',
        fallbackBehaviour: 'retain_baseline',
      },
    ],
  },
  redundancyPolicy: {
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    spatialDistanceThresholdMmParameterRef: 'param.pain.spatial_redundancy_mm',
    clinicalDiversityRule: 'enforce_distinct_anatomical_families',
  },
  slateAssemblyPolicy: {
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    minCandidates: 1,
    maxCandidates: 3,
    primarySlotsCount: 1,
    allowPartialPrimarySlots: true,
    allowEmptySlateWithAbstention: true,
  },
  abstentionPolicy: {
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    allowedAbstentionClasses: ['NO_QUALIFIED_CANDIDATES', 'LATERALITY_AMBIGUOUS'],
    supportPartialAbstention: true,
    mandatoryClinicianAdvisory: true,
  },
  explanationPolicy: {
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    requiredSections: ['clinical_rationale', 'somatotopic_correspondence'],
    disclaimers: ['Somatotopic M1 target does not replace neurological pain evaluation.'],
  },
  permittedCompatibilityConfigurationIds: [PAIN_CONFIG_VALIDATION_ID, PAIN_CONFIG_BASELINE_ID],
  limitations: [
    'Research/Validation use only; Clinical mode disabled (§186).',
    'Somatotopic target strictly contralateral to reported pain limb.',
  ],
};

export const NEUROPATHIC_PAIN_INDICATION_POLICY_BINDING = PAIN_INDICATION_POLICY_BINDING;
