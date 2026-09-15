/**
 * MAGNIOM Initial Scientific Policy — Major Depressive Disorder (MDD)
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§21-22, §113, §144-145, §185)
 */

import type {
  IndicationPolicyBinding,
  ScientificCompatibilityConfiguration,
} from '@magniom/domain';
import { computeSha256 } from '../policy-hasher.js';

export const MDD_MODULE_RELEASE_ID = '00000000-0000-0000-0000-000000000001';
export const MDD_EVIDENCE_LIBRARY_RELEASE_ID = '00000000-0000-0000-0000-000000000101';
export const MDD_TARGET_ENGINE_RELEASE_ID = '00000000-0000-0000-0000-000000000201';
export const MDD_CONNECTOME_CONFIG_ID = '00000000-0000-0000-0000-000000000301';
export const MDD_EVIDENCE_BASELINE_CONFIG_ID = '00000000-0000-0000-0000-000000000302';
export const MDD_SC_CONFIG_ID = '00000000-0000-0000-0000-000000000311';
export const MDD_PATHWAY_CONFIG_ID = '00000000-0000-0000-0000-000000000312';

export const MDD_COMPATIBILITY_CONFIGURATIONS: readonly ScientificCompatibilityConfiguration[] = [
  {
    id: MDD_CONNECTOME_CONFIG_ID,
    code: 'MDD-CONNECTOME-CLINICAL-2.0',
    version: '2.0.0',
    scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000099',
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    mode: 'clinical',
    evidenceLibraryReleaseId: MDD_EVIDENCE_LIBRARY_RELEASE_ID,
    targetEngineReleaseId: MDD_TARGET_ENGINE_RELEASE_ID,
    targetingPlugin: {
      componentType: 'TARGETING_PLUGIN',
      componentId: 'plugin-mdd',
      componentVersion: '2.0.0',
      manifestSha256: computeSha256('MAGNIOM-PLUGIN-MDD-MANIFEST-2.0.0'),
    },
    candidateGenerators: [
      {
        componentType: 'CANDIDATE_GENERATOR',
        componentId: 'gen-mdd-fc-refinement',
        componentVersion: '2.0.0',
      },
      {
        componentType: 'CANDIDATE_GENERATOR',
        componentId: 'gen-mdd-evidence-prior',
        componentVersion: '2.0.0',
      },
    ],
    measurementProviders: [
      { componentType: 'structural_mri', requirement: 'required' },
      { componentType: 'resting_state_fmri', requirement: 'required' },
    ],
    reliabilityMethods: [{ componentType: 'split_half_fc', requirement: 'required' }],
    phenotypeOntologyReleaseId: '00000000-0000-0000-0000-000000000401',
    atlasReleases: [{ componentType: 'schaefer_200_17', requirement: 'required' }],
    normativeModels: [],
    deviceCapabilityProfiles: [{ componentType: 'figure8_standard', requirement: 'optional' }],
    acquisitionProfiles: [{ componentType: 'mdd_clinical_mri_v1', requirement: 'required' }],
    compatibilityStatus: 'approved',
    validationEvidenceIds: ['VAL-MDD-001'],
    configurationSha256: computeSha256('MDD-CONNECTOME-CLINICAL-2.0-CONFIG'),
  },
  {
    id: MDD_EVIDENCE_BASELINE_CONFIG_ID,
    code: 'MDD-EVIDENCE-BASELINE-2.0',
    version: '2.0.0',
    scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000099',
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    mode: 'clinical',
    evidenceLibraryReleaseId: MDD_EVIDENCE_LIBRARY_RELEASE_ID,
    targetEngineReleaseId: MDD_TARGET_ENGINE_RELEASE_ID,
    targetingPlugin: {
      componentType: 'TARGETING_PLUGIN',
      componentId: 'plugin-mdd',
      componentVersion: '2.0.0',
      manifestSha256: computeSha256('MAGNIOM-PLUGIN-MDD-MANIFEST-2.0.0'),
    },
    candidateGenerators: [
      {
        componentType: 'CANDIDATE_GENERATOR',
        componentId: 'gen-mdd-evidence-prior',
        componentVersion: '2.0.0',
      },
    ],
    measurementProviders: [{ componentType: 'structural_mri', requirement: 'required' }],
    reliabilityMethods: [],
    phenotypeOntologyReleaseId: '00000000-0000-0000-0000-000000000401',
    atlasReleases: [],
    normativeModels: [],
    deviceCapabilityProfiles: [{ componentType: 'figure8_standard', requirement: 'optional' }],
    acquisitionProfiles: [{ componentType: 'mdd_clinical_mri_v1', requirement: 'required' }],
    compatibilityStatus: 'approved',
    validationEvidenceIds: ['VAL-MDD-002'],
    configurationSha256: computeSha256('MDD-EVIDENCE-BASELINE-2.0-CONFIG'),
  },
];

export const MDD_RESEARCH_COMPATIBILITY_CONFIGURATIONS: readonly ScientificCompatibilityConfiguration[] =
  [
    {
      id: MDD_SC_CONFIG_ID,
      code: 'MDD-SC-TRACTOGRAPHY-VALIDATION-2.0',
      version: '2.0.0',
      scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000099',
      indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
      mode: 'validation',
      evidenceLibraryReleaseId: MDD_EVIDENCE_LIBRARY_RELEASE_ID,
      targetEngineReleaseId: MDD_TARGET_ENGINE_RELEASE_ID,
      targetingPlugin: {
        componentType: 'TARGETING_PLUGIN',
        componentId: 'plugin-mdd',
        componentVersion: '2.0.0',
        manifestSha256: computeSha256('MAGNIOM-PLUGIN-MDD-MANIFEST-2.0.0'),
      },
      candidateGenerators: [
        {
          componentType: 'CANDIDATE_GENERATOR',
          componentId: 'gen-mdd-evidence-prior',
          componentVersion: '2.0.0',
        },
        {
          componentType: 'CANDIDATE_GENERATOR',
          componentId: 'gen-mdd-sc-tractography',
          componentVersion: '2.0.0',
        },
      ],
      measurementProviders: [
        { componentType: 'structural_mri', requirement: 'required' },
        { componentType: 'diffusion_mri', requirement: 'required' },
      ],
      reliabilityMethods: [],
      phenotypeOntologyReleaseId: '00000000-0000-0000-0000-000000000401',
      atlasReleases: [{ componentType: 'brainnetome_atlas', requirement: 'required' }],
      normativeModels: [],
      deviceCapabilityProfiles: [{ componentType: 'figure8_standard', requirement: 'optional' }],
      acquisitionProfiles: [{ componentType: 'mdd_clinical_mri_v1', requirement: 'required' }],
      compatibilityStatus: 'approved',
      validationEvidenceIds: ['VAL-MDD-SC-001'],
      configurationSha256: computeSha256('MDD-SC-TRACTOGRAPHY-VALIDATION-2.0-CONFIG'),
    },
    {
      id: MDD_PATHWAY_CONFIG_ID,
      code: 'MDD-PATHWAY-COMMUNICATION-RESEARCH-2.0',
      version: '2.0.0',
      scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000099',
      indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
      mode: 'research',
      evidenceLibraryReleaseId: MDD_EVIDENCE_LIBRARY_RELEASE_ID,
      targetEngineReleaseId: MDD_TARGET_ENGINE_RELEASE_ID,
      targetingPlugin: {
        componentType: 'TARGETING_PLUGIN',
        componentId: 'plugin-mdd',
        componentVersion: '2.0.0',
        manifestSha256: computeSha256('MAGNIOM-PLUGIN-MDD-MANIFEST-2.0.0'),
      },
      candidateGenerators: [
        {
          componentType: 'CANDIDATE_GENERATOR',
          componentId: 'gen-mdd-evidence-prior',
          componentVersion: '2.0.0',
        },
        {
          componentType: 'CANDIDATE_GENERATOR',
          componentId: 'gen-mdd-normative-pathway',
          componentVersion: '2.0.0',
        },
      ],
      measurementProviders: [{ componentType: 'structural_mri', requirement: 'required' }],
      reliabilityMethods: [],
      phenotypeOntologyReleaseId: '00000000-0000-0000-0000-000000000401',
      atlasReleases: [{ componentType: 'lausanne_schaefer_normative', requirement: 'required' }],
      normativeModels: [
        { componentType: 'normative_structural_connectome', requirement: 'required' },
      ],
      deviceCapabilityProfiles: [],
      acquisitionProfiles: [{ componentType: 'mdd_clinical_mri_v1', requirement: 'required' }],
      compatibilityStatus: 'approved',
      validationEvidenceIds: ['VAL-MDD-PATHWAY-001'],
      configurationSha256: computeSha256('MDD-PATHWAY-COMMUNICATION-RESEARCH-2.0-CONFIG'),
    },
  ];

export const MDD_INDICATION_POLICY_BINDING: IndicationPolicyBinding = {
  id: '00000000-0000-0000-0000-000000000501',
  indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
  modulePermission: 'clinical_permitted',
  permittedModes: ['clinical', 'validation', 'research'],
  evidencePathPermissions: [
    {
      evidencePathId: 'ep-mdd-sgacc-dlpfc',
      permittedModes: ['clinical', 'validation', 'research'],
      candidateRoles: ['evidence_anchor', 'connectome_refinement'],
      candidateGenerationMethodIds: ['gen-mdd-evidence-prior', 'gen-mdd-fc-refinement'],
      standalonePrimary: true,
      standaloneAdditional: true,
      supportingContext: true,
      targetGeometryTypes: ['point'],
      limitations: [],
    },
  ],
  targetGeometryPolicy: {
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    targetFamilyPermissions: [
      {
        targetFamilyId: 'tf-mdd-dlpfc-sgacc',
        permittedGeometryTypes: ['point'],
        permittedGeneratorIds: ['gen-mdd-evidence-prior', 'gen-mdd-fc-refinement'],
      },
    ],
  },
  measurementPolicy: {
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    requirements: [
      {
        capabilityCode: 'structural_mri',
        modality: 'structural_mri',
        requirement: 'required',
        permittedCandidateRoles: ['PRIMARY_1', 'PRIMARY_2'],
        permittedGeneratorIds: ['gen-mdd-evidence-prior'],
        missingMeasurementBehaviour: 'block',
        limitations: [],
      },
      {
        capabilityCode: 'individual_fc_refinement',
        modality: 'resting_state_fmri',
        requirement: 'required_for_refinement',
        permittedCandidateRoles: ['PRIMARY_1'],
        permittedGeneratorIds: ['gen-mdd-fc-refinement'],
        minimumReliabilityRuleId: 'rule-fc-reliability-min',
        missingMeasurementBehaviour: 'fallback',
        limitations: ['Personalisation unavailable without resting-state fMRI.'],
      },
    ],
    multimodalFusionPolicy: 'prohibited',
    fallbackRules: [
      {
        triggeringConditionCode: 'FC_RELIABILITY_FAILED',
        fromCapability: 'individual_fc_refinement',
        fallbackConfigurationId: MDD_EVIDENCE_BASELINE_CONFIG_ID,
        resultingCapabilityState: 'fallback_only',
        explanationTemplateId: 'tpl-mdd-fc-fallback',
      },
    ],
  },
  reliabilityPolicy: {
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    capabilityRules: [
      {
        capabilityCode: 'individual_fc_refinement',
        reliabilityMethodIds: ['split_half_fc'],
        minimumParameterRefs: ['param.mdd.fc_reliability_threshold'],
        failureBehaviour: 'fallback',
        limitations: ['Requires split-half concordance >= 0.70.'],
      },
    ],
    overallBundleBehaviour: 'capability_specific',
  },
  candidateGenerationPolicy: {
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    pluginReleaseId: 'plugin-mdd',
    generators: [
      {
        generatorId: 'gen-mdd-evidence-prior',
        generatorVersion: '2.0.0',
        status: 'permitted',
        candidateRoles: ['PRIMARY_1', 'PRIMARY_2'],
        evidencePathIds: ['ep-mdd-sgacc-dlpfc'],
        targetFamilyIds: ['tf-mdd-dlpfc-sgacc'],
        geometryTypes: ['point'],
        requiredCapabilityCodes: ['structural_mri'],
      },
      {
        generatorId: 'gen-mdd-fc-refinement',
        generatorVersion: '2.0.0',
        status: 'permitted',
        candidateRoles: ['PRIMARY_1'],
        evidencePathIds: ['ep-mdd-sgacc-dlpfc'],
        targetFamilyIds: ['tf-mdd-dlpfc-sgacc'],
        geometryTypes: ['point'],
        requiredCapabilityCodes: ['individual_fc_refinement'],
      },
    ],
  },
  rankingPolicy: {
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    comparisonDomainPermissions: [
      {
        domainCode: 'dom-mdd-dlpfc',
        permittedModes: ['clinical', 'validation', 'research'],
        allowedBasis: 'same_target_family_variants',
      },
    ],
    rankingProfiles: [
      {
        profileId: 'prof-mdd-lexicographic',
        modelType: 'lexicographic',
        tieBreakingRuleId: 'tie-mdd-default',
      },
    ],
    crossDomainScalarRanking: 'prohibited',
  },
  refinementPolicy: {
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    profiles: [
      {
        id: 'prof-mdd-fc-refinement',
        refinementKind: 'functional_connectivity',
        baselineRole: 'PRIMARY_2',
        refinedRole: 'PRIMARY_1',
        requiredCapabilityCodes: ['individual_fc_refinement'],
        permittedTargetFamilyIds: ['tf-mdd-dlpfc-sgacc'],
        minimumIncrementalValueParameterRefs: ['param.mdd.min_incremental_gain'],
        adoptionBehaviour: 'prefer_if_all_pass',
        fallbackBehaviour: 'retain_baseline',
      },
    ],
  },
  redundancyPolicy: {
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    spatialDistanceThresholdMmParameterRef: 'param.mdd.spatial_redundancy_mm',
    clinicalDiversityRule: 'enforce_distinct_anatomical_families',
  },
  slateAssemblyPolicy: {
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    minCandidates: 1,
    maxCandidates: 4,
    primarySlotsCount: 2,
    allowPartialPrimarySlots: true,
    allowEmptySlateWithAbstention: true,
  },
  abstentionPolicy: {
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    allowedAbstentionClasses: ['NO_QUALIFIED_CANDIDATES', 'RELIABILITY_UNMET_NO_FALLBACK'],
    supportPartialAbstention: true,
    mandatoryClinicianAdvisory: true,
  },
  explanationPolicy: {
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    requiredSections: ['clinical_rationale', 'target_family', 'connectivity_basis'],
    disclaimers: ['FC map does not confer autonomous clinical authority.'],
  },
  tripleNetworkPolicy: {
    enabled: true,
    allowed_network_definitions: [
      'c0000000-0000-4000-8000-000000000011',
      'd0000000-0000-4000-8000-000000000012',
      'e0000000-0000-4000-8000-000000000013',
    ],
    allowed_metric_releases: ['1.0.0'],
    minimum_reliability: 'moderate',
    allowed_clinical_roles: ['context', 'convergence', 'explanation'],
    allowed_indications: [MDD_MODULE_RELEASE_ID],
    allowed_objectives: ['00000000-0000-0000-0000-000000000040'],
    dynamic_metrics_allowed: false,
    ranking_features: [],
  },
  permittedCompatibilityConfigurationIds: [
    MDD_CONNECTOME_CONFIG_ID,
    MDD_EVIDENCE_BASELINE_CONFIG_ID,
  ],
  limitations: [
    'Requires patient clinical safety clearance.',
    'FC refinement requires minimum 8 minutes usable BOLD scan.',
  ],
};

export const MDD_TRIPLE_NETWORK_POLICY = MDD_INDICATION_POLICY_BINDING.tripleNetworkPolicy!;
