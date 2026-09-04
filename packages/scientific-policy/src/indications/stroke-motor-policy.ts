/**
 * MAGNIOM Initial Scientific Policy — Stroke Motor Recovery
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§24, §67-68, §115, §147, §187)
 */

import type {
  IndicationPolicyBinding,
  ScientificCompatibilityConfiguration,
} from '@magniom/domain';

export const STROKE_MOTOR_MODULE_RELEASE_ID = '00000000-0000-0000-0000-000000000003';
export const STROKE_CONFIG_VALIDATION_ID = '00000000-0000-0000-0000-000000000305';

export const STROKE_MOTOR_COMPATIBILITY_CONFIGURATIONS: readonly ScientificCompatibilityConfiguration[] =
  [
    {
      id: STROKE_CONFIG_VALIDATION_ID,
      code: 'STROKE-MOTOR-LESION-MAP-VALIDATION-2.0',
      version: '2.0.0',
      scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000099',
      indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
      mode: 'validation',
      evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000103',
      targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
      targetingPlugin: {
        componentType: 'TARGETING_PLUGIN',
        componentId: 'plugin-stroke-motor',
        componentVersion: '2.0.0',
        manifestSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
      candidateGenerators: [
        {
          componentType: 'CANDIDATE_GENERATOR',
          componentId: 'gen-stroke-ipsilesional-m1',
          componentVersion: '2.0.0',
        },
        {
          componentType: 'CANDIDATE_GENERATOR',
          componentId: 'gen-stroke-contralesional-m1',
          componentVersion: '2.0.0',
        },
      ],
      measurementProviders: [
        { componentType: 'structural_mri', requirement: 'required' },
        { componentType: 'lesion_mapping', requirement: 'required' },
        { componentType: 'motor_mapping', requirement: 'optional' },
        { componentType: 'mep', requirement: 'optional' },
        { componentType: 'diffusion_mri', requirement: 'disabled' },
      ],
      reliabilityMethods: [
        { componentType: 'lesion_dice_reproducibility', requirement: 'required' },
      ],
      phenotypeOntologyReleaseId: '00000000-0000-0000-0000-000000000403',
      atlasReleases: [{ componentType: 'hcp_mmp1', requirement: 'required' }],
      normativeModels: [],
      deviceCapabilityProfiles: [{ componentType: 'figure8_standard', requirement: 'required' }],
      acquisitionProfiles: [
        { componentType: 'stroke_structural_profile_v1', requirement: 'required' },
      ],
      compatibilityStatus: 'validated',
      validationEvidenceIds: ['VAL-STROKE-001'],
      configurationSha256: '9999999999999999999999999999999999999999999999999999999999999905',
    },
  ];

export const STROKE_MOTOR_INDICATION_POLICY_BINDING: IndicationPolicyBinding = {
  id: '00000000-0000-0000-0000-000000000503',
  indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
  modulePermission: 'validation_only',
  permittedModes: ['validation', 'research'],
  evidencePathPermissions: [
    {
      evidencePathId: 'ep-stroke-motor-peri-lesional',
      permittedModes: ['validation', 'research'],
      candidateRoles: ['ipsilesional_strategy', 'contralesional_strategy'],
      candidateGenerationMethodIds: ['gen-stroke-ipsilesional-m1', 'gen-stroke-contralesional-m1'],
      standalonePrimary: true,
      standaloneAdditional: true,
      supportingContext: true,
      diseaseStageConstraints: ['stage-post-acute', 'stage-chronic'],
      targetGeometryTypes: ['point'],
      limitations: ['Requires verified LesionContext; suppressed if target tissue is destroyed.'],
    },
  ],
  targetGeometryPolicy: {
    indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
    targetFamilyPermissions: [
      {
        targetFamilyId: 'tf-stroke-m1',
        permittedGeometryTypes: ['point'],
        permittedGeneratorIds: ['gen-stroke-ipsilesional-m1', 'gen-stroke-contralesional-m1'],
      },
    ],
  },
  measurementPolicy: {
    indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
    requirements: [
      {
        capabilityCode: 'structural_mri',
        modality: 'structural_mri',
        requirement: 'required',
        permittedCandidateRoles: ['PRIMARY_1', 'PRIMARY_2'],
        permittedGeneratorIds: ['gen-stroke-ipsilesional-m1'],
        missingMeasurementBehaviour: 'block',
        limitations: [],
      },
      {
        capabilityCode: 'native_lesion_mapping',
        modality: 'lesion_mapping',
        requirement: 'required',
        permittedCandidateRoles: ['PRIMARY_1', 'PRIMARY_2'],
        permittedGeneratorIds: ['gen-stroke-ipsilesional-m1', 'gen-stroke-contralesional-m1'],
        missingMeasurementBehaviour: 'block',
        limitations: [
          'Lesion mapping mandatory. No normal-template fallback permitted (§115, §147).',
        ],
      },
    ],
    multimodalFusionPolicy: 'prohibited',
    fallbackRules: [], // No normal-template fallback! Fails closed / module abstains (§115)
  },
  reliabilityPolicy: {
    indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
    capabilityRules: [
      {
        capabilityCode: 'native_lesion_mapping',
        reliabilityMethodIds: ['lesion_dice_reproducibility'],
        minimumParameterRefs: ['param.stroke.min_lesion_dice'],
        failureBehaviour: 'block_module',
        limitations: ['Lesion registration failure blocks targeting analysis.'],
      },
    ],
    overallBundleBehaviour: 'capability_specific',
  },
  candidateGenerationPolicy: {
    indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
    pluginReleaseId: 'plugin-stroke-motor',
    generators: [
      {
        generatorId: 'gen-stroke-ipsilesional-m1',
        generatorVersion: '2.0.0',
        status: 'permitted',
        candidateRoles: ['PRIMARY_1'],
        evidencePathIds: ['ep-stroke-motor-peri-lesional'],
        targetFamilyIds: ['tf-stroke-m1'],
        geometryTypes: ['point'],
        requiredCapabilityCodes: ['structural_mri', 'native_lesion_mapping'],
      },
      {
        generatorId: 'gen-stroke-contralesional-m1',
        generatorVersion: '2.0.0',
        status: 'permitted',
        candidateRoles: ['PRIMARY_2'],
        evidencePathIds: ['ep-stroke-motor-peri-lesional'],
        targetFamilyIds: ['tf-stroke-m1'],
        geometryTypes: ['point'],
        requiredCapabilityCodes: ['structural_mri', 'native_lesion_mapping'],
      },
    ],
  },
  rankingPolicy: {
    indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
    comparisonDomainPermissions: [
      {
        domainCode: 'dom-stroke-motor',
        permittedModes: ['validation', 'research'],
        allowedBasis: 'same_target_strategy',
      },
    ],
    rankingProfiles: [
      {
        profileId: 'prof-stroke-motor-lexicographic',
        modelType: 'lexicographic',
        tieBreakingRuleId: 'tie-stroke-default',
      },
    ],
    crossDomainScalarRanking: 'prohibited',
  },
  refinementPolicy: {
    indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
    profiles: [],
  },
  redundancyPolicy: {
    indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
    spatialDistanceThresholdMmParameterRef: 'param.stroke.spatial_redundancy_mm',
    clinicalDiversityRule: 'enforce_distinct_anatomical_families',
  },
  slateAssemblyPolicy: {
    indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
    minCandidates: 1,
    maxCandidates: 2,
    primarySlotsCount: 1,
    allowPartialPrimarySlots: true,
    allowEmptySlateWithAbstention: true,
  },
  abstentionPolicy: {
    indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
    allowedAbstentionClasses: [
      'LESION_ABSENT_OR_UNRELIABLE',
      'TARGET_DESTROYED_BY_LESION',
      'NO_QUALIFIED_CANDIDATES',
    ],
    supportPartialAbstention: true,
    mandatoryClinicianAdvisory: true,
  },
  explanationPolicy: {
    indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
    requiredSections: [
      'clinical_rationale',
      'lesion_target_relationship',
      'corticospinal_tract_status',
    ],
    disclaimers: ['Destroyed target coordinates cannot be shifted arbitrarily (§68).'],
  },
  permittedCompatibilityConfigurationIds: [STROKE_CONFIG_VALIDATION_ID],
  limitations: [
    'Validation only; Clinical mode disabled (§187).',
    'Mandatory native-space LesionContext. Absent lesion mapping triggers complete module abstention (§115, §147).',
  ],
};
