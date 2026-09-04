/**
 * MAGNIOM Initial Scientific Policy — Post-Traumatic Stress Disorder (PTSD)
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§151, §191)
 */

import type {
  IndicationPolicyBinding,
  ScientificCompatibilityConfiguration,
} from '@magniom/domain';

export const PTSD_MODULE_RELEASE_ID = '00000000-0000-0000-0000-000000000007';
export const PTSD_CONFIG_RESEARCH_ID = '00000000-0000-0000-0000-000000000309';

export const PTSD_COMPATIBILITY_CONFIGURATIONS: readonly ScientificCompatibilityConfiguration[] = [
  {
    id: PTSD_CONFIG_RESEARCH_ID,
    code: 'PTSD-CIRCUIT-RESEARCH-2.0',
    version: '2.0.0',
    scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000099',
    indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
    mode: 'research',
    evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000107',
    targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
    targetingPlugin: {
      componentType: 'TARGETING_PLUGIN',
      componentId: 'plugin-ptsd',
      componentVersion: '2.0.0',
      manifestSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    candidateGenerators: [
      {
        componentType: 'CANDIDATE_GENERATOR',
        componentId: 'gen-ptsd-vmPFC-circuit',
        componentVersion: '2.0.0',
      },
    ],
    measurementProviders: [{ componentType: 'structural_mri', requirement: 'required' }],
    reliabilityMethods: [],
    phenotypeOntologyReleaseId: '00000000-0000-0000-0000-000000000407',
    atlasReleases: [{ componentType: 'hcp_mmp1', requirement: 'required' }],
    normativeModels: [],
    deviceCapabilityProfiles: [],
    acquisitionProfiles: [{ componentType: 'ptsd_structural_profile_v1', requirement: 'required' }],
    compatibilityStatus: 'draft',
    validationEvidenceIds: ['VAL-PTSD-001'],
    configurationSha256: '9999999999999999999999999999999999999999999999999999999999999909',
  },
];

export const PTSD_INDICATION_POLICY_BINDING: IndicationPolicyBinding = {
  id: '00000000-0000-0000-0000-000000000507',
  indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
  modulePermission: 'research_only',
  permittedModes: ['research', 'validation'],
  evidencePathPermissions: [
    {
      evidencePathId: 'ep-ptsd-general-circuit',
      permittedModes: ['research', 'validation'],
      candidateRoles: ['evidence_anchor'],
      candidateGenerationMethodIds: ['gen-ptsd-vmPFC-circuit'],
      standalonePrimary: true,
      standaloneAdditional: true,
      supportingContext: true,
      populationConstraints: ['pop-general-ptsd'],
      targetGeometryTypes: ['point'],
      limitations: [
        'Partial applicability to combat-related PTSD; no hidden upgrade to full general applicability (§151).',
      ],
    },
  ],
  targetGeometryPolicy: {
    indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
    targetFamilyPermissions: [
      {
        targetFamilyId: 'tf-ptsd-circuit',
        permittedGeometryTypes: ['point'],
        permittedGeneratorIds: ['gen-ptsd-vmPFC-circuit'],
      },
    ],
  },
  measurementPolicy: {
    indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
    requirements: [
      {
        capabilityCode: 'structural_mri',
        modality: 'structural_mri',
        requirement: 'required',
        permittedCandidateRoles: ['PRIMARY_1'],
        permittedGeneratorIds: ['gen-ptsd-vmPFC-circuit'],
        missingMeasurementBehaviour: 'block',
        limitations: [],
      },
    ],
    multimodalFusionPolicy: 'prohibited',
    fallbackRules: [],
  },
  reliabilityPolicy: {
    indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
    capabilityRules: [],
    overallBundleBehaviour: 'capability_specific',
  },
  candidateGenerationPolicy: {
    indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
    pluginReleaseId: 'plugin-ptsd',
    generators: [
      {
        generatorId: 'gen-ptsd-vmPFC-circuit',
        generatorVersion: '2.0.0',
        status: 'permitted',
        candidateRoles: ['PRIMARY_1'],
        evidencePathIds: ['ep-ptsd-general-circuit'],
        targetFamilyIds: ['tf-ptsd-circuit'],
        geometryTypes: ['point'],
        requiredCapabilityCodes: ['structural_mri'],
      },
    ],
  },
  rankingPolicy: {
    indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
    comparisonDomainPermissions: [
      {
        domainCode: 'dom-ptsd-circuit',
        permittedModes: ['research', 'validation'],
        allowedBasis: 'same_target_family_variants',
      },
    ],
    rankingProfiles: [
      {
        profileId: 'prof-ptsd-default',
        modelType: 'ordered_deterministic_rules',
        tieBreakingRuleId: 'tie-ptsd-default',
      },
    ],
    crossDomainScalarRanking: 'prohibited',
  },
  refinementPolicy: {
    indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
    profiles: [],
  },
  redundancyPolicy: {
    indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
    spatialDistanceThresholdMmParameterRef: 'param.ptsd.spatial_redundancy_mm',
    clinicalDiversityRule: 'enforce_distinct_anatomical_families',
  },
  slateAssemblyPolicy: {
    indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
    minCandidates: 1,
    maxCandidates: 2,
    primarySlotsCount: 1,
    allowPartialPrimarySlots: true,
    allowEmptySlateWithAbstention: true,
  },
  abstentionPolicy: {
    indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
    allowedAbstentionClasses: ['POPULATION_MISMATCH', 'NO_QUALIFIED_CANDIDATES'],
    supportPartialAbstention: false,
    mandatoryClinicianAdvisory: true,
  },
  explanationPolicy: {
    indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
    requiredSections: ['clinical_rationale', 'subpopulation_applicability'],
    disclaimers: ['Subpopulation applicability constraints must remain visible (§151).'],
  },
  permittedCompatibilityConfigurationIds: [PTSD_CONFIG_RESEARCH_ID],
  limitations: [
    'Research/Validation only (§191).',
    'Subpopulation constraints retained without hidden upgrade (§151). MDD evidence inheritance prohibited.',
  ],
};
