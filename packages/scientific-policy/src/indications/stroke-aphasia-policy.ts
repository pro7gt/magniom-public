/**
 * MAGNIOM Initial Scientific Policy — Stroke Aphasia Rehabilitation
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§148, §188)
 */

import type {
  IndicationPolicyBinding,
  ScientificCompatibilityConfiguration,
} from '@magniom/domain';

export const APHASIA_MODULE_RELEASE_ID = '00000000-0000-0000-0000-000000000004';
export const APHASIA_CONFIG_VALIDATION_ID = '00000000-0000-0000-0000-000000000306';

export const APHASIA_COMPATIBILITY_CONFIGURATIONS: readonly ScientificCompatibilityConfiguration[] =
  [
    {
      id: APHASIA_CONFIG_VALIDATION_ID,
      code: 'APHASIA-RIGHT-IFG-VALIDATION-2.0',
      version: '2.0.0',
      scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000099',
      indicationModuleReleaseId: APHASIA_MODULE_RELEASE_ID,
      mode: 'validation',
      evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000104',
      targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
      targetingPlugin: {
        componentType: 'TARGETING_PLUGIN',
        componentId: 'plugin-stroke-aphasia',
        componentVersion: '2.0.0',
        manifestSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
      candidateGenerators: [
        {
          componentType: 'CANDIDATE_GENERATOR',
          componentId: 'gen-aphasia-right-ifg',
          componentVersion: '2.0.0',
        },
      ],
      measurementProviders: [
        { componentType: 'structural_mri', requirement: 'required' },
        { componentType: 'lesion_mapping', requirement: 'required' },
        { componentType: 'task_fmri', requirement: 'optional' },
      ],
      reliabilityMethods: [],
      phenotypeOntologyReleaseId: '00000000-0000-0000-0000-000000000404',
      atlasReleases: [{ componentType: 'hcp_mmp1', requirement: 'required' }],
      normativeModels: [],
      deviceCapabilityProfiles: [{ componentType: 'figure8_standard', requirement: 'required' }],
      acquisitionProfiles: [
        { componentType: 'aphasia_structural_profile_v1', requirement: 'required' },
      ],
      compatibilityStatus: 'validated',
      validationEvidenceIds: ['VAL-APHASIA-001'],
      configurationSha256: '9999999999999999999999999999999999999999999999999999999999999906',
    },
  ];

export const APHASIA_INDICATION_POLICY_BINDING: IndicationPolicyBinding = {
  id: '00000000-0000-0000-0000-000000000504',
  indicationModuleReleaseId: APHASIA_MODULE_RELEASE_ID,
  modulePermission: 'validation_only',
  permittedModes: ['validation', 'research'],
  evidencePathPermissions: [
    {
      evidencePathId: 'ep-aphasia-chronic-right-ifg',
      permittedModes: ['validation', 'research'],
      candidateRoles: ['clinical_alternative'],
      candidateGenerationMethodIds: ['gen-aphasia-right-ifg'],
      standalonePrimary: true,
      standaloneAdditional: false,
      supportingContext: true,
      populationConstraints: ['pop-chronic-nonfluent-aphasia'],
      diseaseStageConstraints: ['stage-chronic'],
      treatmentContextConstraints: ['ctx-concurrent-slt'],
      targetGeometryTypes: ['point'],
      limitations: [
        'Requires chronic stage (>6 months post-stroke) and non-fluent phenotype (§148).',
      ],
    },
  ],
  targetGeometryPolicy: {
    indicationModuleReleaseId: APHASIA_MODULE_RELEASE_ID,
    targetFamilyPermissions: [
      {
        targetFamilyId: 'tf-aphasia-right-ifg',
        permittedGeometryTypes: ['point'],
        permittedGeneratorIds: ['gen-aphasia-right-ifg'],
      },
    ],
  },
  measurementPolicy: {
    indicationModuleReleaseId: APHASIA_MODULE_RELEASE_ID,
    requirements: [
      {
        capabilityCode: 'structural_mri',
        modality: 'structural_mri',
        requirement: 'required',
        permittedCandidateRoles: ['PRIMARY_1'],
        permittedGeneratorIds: ['gen-aphasia-right-ifg'],
        missingMeasurementBehaviour: 'block',
        limitations: [],
      },
      {
        capabilityCode: 'lesion_mapping',
        modality: 'lesion_mapping',
        requirement: 'required',
        permittedCandidateRoles: ['PRIMARY_1'],
        permittedGeneratorIds: ['gen-aphasia-right-ifg'],
        missingMeasurementBehaviour: 'block',
        limitations: [],
      },
    ],
    multimodalFusionPolicy: 'prohibited',
    fallbackRules: [],
  },
  reliabilityPolicy: {
    indicationModuleReleaseId: APHASIA_MODULE_RELEASE_ID,
    capabilityRules: [],
    overallBundleBehaviour: 'capability_specific',
  },
  candidateGenerationPolicy: {
    indicationModuleReleaseId: APHASIA_MODULE_RELEASE_ID,
    pluginReleaseId: 'plugin-stroke-aphasia',
    generators: [
      {
        generatorId: 'gen-aphasia-right-ifg',
        generatorVersion: '2.0.0',
        status: 'permitted',
        candidateRoles: ['PRIMARY_1'],
        evidencePathIds: ['ep-aphasia-chronic-right-ifg'],
        targetFamilyIds: ['tf-aphasia-right-ifg'],
        geometryTypes: ['point'],
        requiredCapabilityCodes: ['structural_mri', 'lesion_mapping'],
      },
    ],
  },
  rankingPolicy: {
    indicationModuleReleaseId: APHASIA_MODULE_RELEASE_ID,
    comparisonDomainPermissions: [
      {
        domainCode: 'dom-aphasia-language',
        permittedModes: ['validation', 'research'],
        allowedBasis: 'same_target_family_variants',
      },
    ],
    rankingProfiles: [
      {
        profileId: 'prof-aphasia-default',
        modelType: 'ordered_deterministic_rules',
        tieBreakingRuleId: 'tie-aphasia-default',
      },
    ],
    crossDomainScalarRanking: 'prohibited',
  },
  refinementPolicy: {
    indicationModuleReleaseId: APHASIA_MODULE_RELEASE_ID,
    profiles: [],
  },
  redundancyPolicy: {
    indicationModuleReleaseId: APHASIA_MODULE_RELEASE_ID,
    spatialDistanceThresholdMmParameterRef: 'param.aphasia.spatial_redundancy_mm',
    clinicalDiversityRule: 'enforce_distinct_anatomical_families',
  },
  slateAssemblyPolicy: {
    indicationModuleReleaseId: APHASIA_MODULE_RELEASE_ID,
    minCandidates: 1,
    maxCandidates: 2,
    primarySlotsCount: 1,
    allowPartialPrimarySlots: true,
    allowEmptySlateWithAbstention: true,
  },
  abstentionPolicy: {
    indicationModuleReleaseId: APHASIA_MODULE_RELEASE_ID,
    allowedAbstentionClasses: ['STAGE_INCOMPATIBLE', 'PHENOTYPE_INCOMPATIBLE'],
    supportPartialAbstention: false,
    mandatoryClinicianAdvisory: true,
  },
  explanationPolicy: {
    indicationModuleReleaseId: APHASIA_MODULE_RELEASE_ID,
    requiredSections: ['clinical_rationale', 'language_network_model'],
    disclaimers: ['Right IFG target requires concurrent speech-language therapy context.'],
  },
  permittedCompatibilityConfigurationIds: [APHASIA_CONFIG_VALIDATION_ID],
  limitations: [
    'Research/Validation only (§188).',
    'EvidencePath strictly requires chronic non-fluent aphasia. Stage/phenotype mismatch invalidates path (§148).',
  ],
};
