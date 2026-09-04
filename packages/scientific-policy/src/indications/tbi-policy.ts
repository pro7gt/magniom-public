/**
 * MAGNIOM Initial Scientific Policy — Traumatic Brain Injury (TBI)
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§150, §190)
 */

import type {
  IndicationPolicyBinding,
  ScientificCompatibilityConfiguration,
} from '@magniom/domain';

export const TBI_MODULE_RELEASE_ID = '00000000-0000-0000-0000-000000000006';
export const TBI_CONFIG_RESEARCH_ID = '00000000-0000-0000-0000-000000000308';

export const TBI_COMPATIBILITY_CONFIGURATIONS: readonly ScientificCompatibilityConfiguration[] = [
  {
    id: TBI_CONFIG_RESEARCH_ID,
    code: 'TBI-NETWORK-RESEARCH-2.0',
    version: '2.0.0',
    scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000099',
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    mode: 'research',
    evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000106',
    targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
    targetingPlugin: {
      componentType: 'TARGETING_PLUGIN',
      componentId: 'plugin-tbi',
      componentVersion: '2.0.0',
      manifestSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    candidateGenerators: [
      {
        componentType: 'CANDIDATE_GENERATOR',
        componentId: 'gen-tbi-circuit-research',
        componentVersion: '2.0.0',
      },
    ],
    measurementProviders: [{ componentType: 'structural_mri', requirement: 'required' }],
    reliabilityMethods: [],
    phenotypeOntologyReleaseId: '00000000-0000-0000-0000-000000000406',
    atlasReleases: [{ componentType: 'hcp_mmp1', requirement: 'required' }],
    normativeModels: [],
    deviceCapabilityProfiles: [],
    acquisitionProfiles: [{ componentType: 'tbi_structural_profile_v1', requirement: 'required' }],
    compatibilityStatus: 'draft',
    validationEvidenceIds: ['VAL-TBI-RESEARCH-001'],
    configurationSha256: '9999999999999999999999999999999999999999999999999999999999999908',
  },
];

export const TBI_INDICATION_POLICY_BINDING: IndicationPolicyBinding = {
  id: '00000000-0000-0000-0000-000000000506',
  indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
  modulePermission: 'research_only',
  permittedModes: ['research'],
  evidencePathPermissions: [
    {
      evidencePathId: 'ep-tbi-diffuse-circuit',
      permittedModes: ['research'],
      candidateRoles: ['research_hypothesis'],
      candidateGenerationMethodIds: ['gen-tbi-circuit-research'],
      standalonePrimary: false,
      standaloneAdditional: true,
      supportingContext: true,
      targetGeometryTypes: ['point'],
      limitations: ['Research only. Cannot borrow MDD DLPFC evidence (§150).'],
    },
  ],
  targetGeometryPolicy: {
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    targetFamilyPermissions: [
      {
        targetFamilyId: 'tf-tbi-circuit',
        permittedGeometryTypes: ['point'],
        permittedGeneratorIds: ['gen-tbi-circuit-research'],
      },
    ],
  },
  measurementPolicy: {
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    requirements: [
      {
        capabilityCode: 'structural_mri',
        modality: 'structural_mri',
        requirement: 'required',
        permittedCandidateRoles: ['research_hypothesis'],
        permittedGeneratorIds: ['gen-tbi-circuit-research'],
        missingMeasurementBehaviour: 'block',
        limitations: [],
      },
    ],
    multimodalFusionPolicy: 'prohibited',
    fallbackRules: [],
  },
  reliabilityPolicy: {
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    capabilityRules: [],
    overallBundleBehaviour: 'capability_specific',
  },
  candidateGenerationPolicy: {
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    pluginReleaseId: 'plugin-tbi',
    generators: [
      {
        generatorId: 'gen-tbi-circuit-research',
        generatorVersion: '2.0.0',
        status: 'research_only',
        candidateRoles: ['research_hypothesis'],
        evidencePathIds: ['ep-tbi-diffuse-circuit'],
        targetFamilyIds: ['tf-tbi-circuit'],
        geometryTypes: ['point'],
        requiredCapabilityCodes: ['structural_mri'],
      },
    ],
  },
  rankingPolicy: {
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    comparisonDomainPermissions: [
      {
        domainCode: 'dom-tbi-research',
        permittedModes: ['research'],
        allowedBasis: 'same_target_family_variants',
      },
    ],
    rankingProfiles: [
      {
        profileId: 'prof-tbi-research',
        modelType: 'ordered_deterministic_rules',
        tieBreakingRuleId: 'tie-tbi-default',
      },
    ],
    crossDomainScalarRanking: 'prohibited',
  },
  refinementPolicy: {
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    profiles: [],
  },
  redundancyPolicy: {
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    spatialDistanceThresholdMmParameterRef: 'param.tbi.spatial_redundancy_mm',
    clinicalDiversityRule: 'enforce_distinct_anatomical_families',
  },
  slateAssemblyPolicy: {
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    minCandidates: 0,
    maxCandidates: 2,
    primarySlotsCount: 1,
    allowPartialPrimarySlots: true,
    allowEmptySlateWithAbstention: true,
  },
  abstentionPolicy: {
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    allowedAbstentionClasses: ['RESEARCH_ONLY_ABSTENTION', 'SKULL_DEFECT_COMPLEXITY'],
    supportPartialAbstention: false,
    mandatoryClinicianAdvisory: true,
  },
  explanationPolicy: {
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    requiredSections: ['research_rationale'],
    disclaimers: ['TBI is a research-only module. Clinical target generation is prohibited.'],
  },
  permittedCompatibilityConfigurationIds: [TBI_CONFIG_RESEARCH_ID],
  limitations: [
    'Research only (§190).',
    'Hard cross-indication rejection: Cannot borrow MDD DLPFC evidence or generators for TBI depression (§104, §150).',
  ],
};
