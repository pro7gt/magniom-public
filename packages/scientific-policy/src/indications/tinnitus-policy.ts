/**
 * MAGNIOM Initial Scientific Policy — Tinnitus Neurostimulation Research
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§26, §105, §152, §192)
 */

import type {
  IndicationPolicyBinding,
  ScientificCompatibilityConfiguration,
} from '@magniom/domain';

export const TINNITUS_MODULE_RELEASE_ID = '00000000-0000-0000-0000-000000000008';
export const TINNITUS_CONFIG_RESEARCH_ID = '00000000-0000-0000-0000-000000000310';

export const TINNITUS_COMPATIBILITY_CONFIGURATIONS: readonly ScientificCompatibilityConfiguration[] =
  [
    {
      id: TINNITUS_CONFIG_RESEARCH_ID,
      code: 'TINNITUS-AUDIOLOGY-RESEARCH-2.0',
      version: '2.0.0',
      scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000099',
      indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
      mode: 'research',
      evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000108',
      targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
      targetingPlugin: {
        componentType: 'TARGETING_PLUGIN',
        componentId: 'plugin-tinnitus',
        componentVersion: '2.0.0',
        manifestSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
      candidateGenerators: [
        {
          componentType: 'CANDIDATE_GENERATOR',
          componentId: 'gen-tinnitus-temporoparietal-research',
          componentVersion: '2.0.0',
        },
      ],
      measurementProviders: [
        { componentType: 'audiology', requirement: 'required' },
        { componentType: 'structural_mri', requirement: 'optional' },
      ],
      reliabilityMethods: [],
      phenotypeOntologyReleaseId: '00000000-0000-0000-0000-000000000408',
      atlasReleases: [{ componentType: 'hcp_mmp1', requirement: 'required' }],
      normativeModels: [],
      deviceCapabilityProfiles: [],
      acquisitionProfiles: [
        { componentType: 'tinnitus_audiology_profile_v1', requirement: 'required' },
      ],
      compatibilityStatus: 'draft',
      validationEvidenceIds: ['VAL-TINNITUS-RESEARCH-001'],
      configurationSha256: '9999999999999999999999999999999999999999999999999999999999999910',
    },
  ];

export const TINNITUS_INDICATION_POLICY_BINDING: IndicationPolicyBinding = {
  id: '00000000-0000-0000-0000-000000000508',
  indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
  modulePermission: 'research_only', // Clinical mode strictly prohibited (§152, §192)
  permittedModes: ['research'],
  evidencePathPermissions: [
    {
      evidencePathId: 'ep-tinnitus-temporoparietal-research',
      permittedModes: ['research'],
      candidateRoles: ['research_hypothesis'],
      candidateGenerationMethodIds: ['gen-tinnitus-temporoparietal-research'],
      standalonePrimary: false,
      standaloneAdditional: true,
      supportingContext: true,
      targetGeometryTypes: ['point'],
      limitations: [
        'Research only. Clinical mode blocked with INDICATION_MODULE_NOT_CLINICALLY_PERMITTED (§152).',
      ],
    },
  ],
  targetGeometryPolicy: {
    indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
    targetFamilyPermissions: [
      {
        targetFamilyId: 'tf-tinnitus-temporoparietal',
        permittedGeometryTypes: ['point'],
        permittedGeneratorIds: ['gen-tinnitus-temporoparietal-research'],
      },
    ],
  },
  measurementPolicy: {
    indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
    requirements: [
      {
        capabilityCode: 'pure_tone_audiometry',
        modality: 'audiology',
        requirement: 'required',
        permittedCandidateRoles: ['research_hypothesis'],
        permittedGeneratorIds: ['gen-tinnitus-temporoparietal-research'],
        missingMeasurementBehaviour: 'block',
        limitations: [
          'Audiology required. Prohibition of converting pitch match into tonotopic cortical target coordinate (§69, §105).',
        ],
      },
    ],
    multimodalFusionPolicy: 'prohibited',
    fallbackRules: [], // No generic auditory cortex target fallback (§116)
  },
  reliabilityPolicy: {
    indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
    capabilityRules: [],
    overallBundleBehaviour: 'capability_specific',
  },
  candidateGenerationPolicy: {
    indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
    pluginReleaseId: 'plugin-tinnitus',
    generators: [
      {
        generatorId: 'gen-tinnitus-temporoparietal-research',
        generatorVersion: '2.0.0',
        status: 'research_only',
        candidateRoles: ['research_hypothesis'],
        evidencePathIds: ['ep-tinnitus-temporoparietal-research'],
        targetFamilyIds: ['tf-tinnitus-temporoparietal'],
        geometryTypes: ['point'],
        requiredCapabilityCodes: ['pure_tone_audiometry'],
      },
    ],
  },
  rankingPolicy: {
    indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
    comparisonDomainPermissions: [
      {
        domainCode: 'dom-tinnitus-research',
        permittedModes: ['research'],
        allowedBasis: 'same_target_family_variants',
      },
    ],
    rankingProfiles: [
      {
        profileId: 'prof-tinnitus-research',
        modelType: 'ordered_deterministic_rules',
        tieBreakingRuleId: 'tie-tinnitus-default',
      },
    ],
    crossDomainScalarRanking: 'prohibited',
  },
  refinementPolicy: {
    indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
    profiles: [],
  },
  redundancyPolicy: {
    indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
    spatialDistanceThresholdMmParameterRef: 'param.tinnitus.spatial_redundancy_mm',
    clinicalDiversityRule: 'enforce_distinct_anatomical_families',
  },
  slateAssemblyPolicy: {
    indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
    minCandidates: 0,
    maxCandidates: 2,
    primarySlotsCount: 1,
    allowPartialPrimarySlots: true,
    allowEmptySlateWithAbstention: true,
  },
  abstentionPolicy: {
    indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
    allowedAbstentionClasses: ['RESEARCH_ONLY_ABSTENTION', 'AUDIOLOGY_INSUFFICIENT'],
    supportPartialAbstention: false,
    mandatoryClinicianAdvisory: true,
  },
  explanationPolicy: {
    indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
    requiredSections: ['research_rationale', 'audiological_context'],
    disclaimers: [
      'Tinnitus is Research-only. Cannot generate authoritative Clinical target slates (§152).',
    ],
  },
  permittedCompatibilityConfigurationIds: [TINNITUS_CONFIG_RESEARCH_ID],
  limitations: [
    'Research only (§192). Clinical mode strictly disabled. Requesting clinical mode yields INDICATION_MODULE_NOT_CLINICALLY_PERMITTED (§152).',
  ],
};
