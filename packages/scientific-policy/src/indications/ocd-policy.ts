/**
 * MAGNIOM Initial Scientific Policy — Obsessive-Compulsive Disorder (OCD)
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§25, §36-37, §78, §149, §189)
 */

import type {
  IndicationPolicyBinding,
  ScientificCompatibilityConfiguration,
} from '@magniom/domain';

export const OCD_MODULE_RELEASE_ID = '00000000-0000-0000-0000-000000000005';
export const OCD_CONFIG_FIELD_VALIDATION_ID = '00000000-0000-0000-0000-000000000307';

export const OCD_COMPATIBILITY_CONFIGURATIONS: readonly ScientificCompatibilityConfiguration[] = [
  {
    id: OCD_CONFIG_FIELD_VALIDATION_ID,
    code: 'OCD-FIELD-VALIDATION-2.0',
    version: '2.0.0',
    scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000099',
    indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
    mode: 'validation',
    evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000105',
    targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
    targetingPlugin: {
      componentType: 'TARGETING_PLUGIN',
      componentId: 'plugin-ocd',
      componentVersion: '2.0.0',
      manifestSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    candidateGenerators: [
      {
        componentType: 'CANDIDATE_GENERATOR',
        componentId: 'gen-ocd-mpfc-acc-field',
        componentVersion: '2.0.0',
      },
    ],
    measurementProviders: [
      { componentType: 'structural_mri', requirement: 'required' },
      { componentType: 'efield_modeling', requirement: 'required' },
    ],
    reliabilityMethods: [],
    phenotypeOntologyReleaseId: '00000000-0000-0000-0000-000000000405',
    atlasReleases: [{ componentType: 'hcp_mmp1', requirement: 'required' }],
    normativeModels: [],
    efieldEngine: { componentType: 'simnibs', requirement: 'required' },
    deviceCapabilityProfiles: [{ componentType: 'deep_tms_h7', requirement: 'required' }],
    acquisitionProfiles: [{ componentType: 'ocd_structural_profile_v1', requirement: 'required' }],
    compatibilityStatus: 'validated',
    validationEvidenceIds: ['VAL-OCD-001'],
    configurationSha256: '9999999999999999999999999999999999999999999999999999999999999907',
  },
];

export const OCD_INDICATION_POLICY_BINDING: IndicationPolicyBinding = {
  id: '00000000-0000-0000-0000-000000000505',
  indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
  modulePermission: 'validation_only',
  permittedModes: ['validation', 'research'],
  evidencePathPermissions: [
    {
      evidencePathId: 'ep-ocd-dtms-mpfc-acc',
      permittedModes: ['validation', 'research'],
      candidateRoles: ['field_target'], // ONLY coil_field! No downcasting to point (§37, §149)
      candidateGenerationMethodIds: ['gen-ocd-mpfc-acc-field'],
      standalonePrimary: true,
      standaloneAdditional: true,
      supportingContext: true,
      treatmentContextConstraints: ['ctx-symptom-provocation'],
      targetGeometryTypes: ['coil_field'], // ONLY coil_field! No downcasting to point (§37, §149)
      limitations: ['Requires deep-TMS H7 coil and symptom provocation context.'],
    },
  ],
  targetGeometryPolicy: {
    indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
    targetFamilyPermissions: [
      {
        targetFamilyId: 'tf-ocd-field',
        permittedGeometryTypes: ['coil_field'],
        permittedGeneratorIds: ['gen-ocd-mpfc-acc-field'],
      },
    ],
  },
  measurementPolicy: {
    indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
    requirements: [
      {
        capabilityCode: 'structural_mri',
        modality: 'structural_mri',
        requirement: 'required',
        permittedCandidateRoles: ['PRIMARY_1'],
        permittedGeneratorIds: ['gen-ocd-mpfc-acc-field'],
        missingMeasurementBehaviour: 'block',
        limitations: [],
      },
      {
        capabilityCode: 'efield_field_target',
        modality: 'efield',
        requirement: 'required',
        permittedCandidateRoles: ['PRIMARY_1'],
        permittedGeneratorIds: ['gen-ocd-mpfc-acc-field'],
        missingMeasurementBehaviour: 'block',
        limitations: ['E-field coverage simulation required for deep-TMS field target.'],
      },
    ],
    multimodalFusionPolicy: 'prohibited',
    fallbackRules: [],
  },
  reliabilityPolicy: {
    indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
    capabilityRules: [],
    overallBundleBehaviour: 'capability_specific',
  },
  candidateGenerationPolicy: {
    indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
    pluginReleaseId: 'plugin-ocd',
    generators: [
      {
        generatorId: 'gen-ocd-mpfc-acc-field',
        generatorVersion: '2.0.0',
        status: 'permitted',
        candidateRoles: ['PRIMARY_1'],
        evidencePathIds: ['ep-ocd-dtms-mpfc-acc'],
        targetFamilyIds: ['tf-ocd-field'],
        geometryTypes: ['coil_field'],
        requiredCapabilityCodes: ['structural_mri', 'efield_field_target'],
      },
    ],
  },
  rankingPolicy: {
    indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
    comparisonDomainPermissions: [
      {
        domainCode: 'dom-ocd-field',
        permittedModes: ['validation', 'research'],
        allowedBasis: 'same_target_family_variants',
      },
    ],
    rankingProfiles: [
      {
        profileId: 'prof-ocd-field-coverage',
        modelType: 'ordered_deterministic_rules',
        tieBreakingRuleId: 'tie-ocd-default',
      },
    ],
    crossDomainScalarRanking: 'prohibited',
  },
  refinementPolicy: {
    indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
    profiles: [],
  },
  redundancyPolicy: {
    indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
    spatialDistanceThresholdMmParameterRef: 'param.ocd.spatial_redundancy_mm',
    clinicalDiversityRule: 'enforce_distinct_anatomical_families',
  },
  slateAssemblyPolicy: {
    indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
    minCandidates: 1,
    maxCandidates: 2,
    primarySlotsCount: 1,
    allowPartialPrimarySlots: true,
    allowEmptySlateWithAbstention: true,
  },
  abstentionPolicy: {
    indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
    allowedAbstentionClasses: ['GEOMETRY_UNSUPPORTED', 'COIL_INCOMPATIBLE'],
    supportPartialAbstention: false,
    mandatoryClinicianAdvisory: true,
  },
  explanationPolicy: {
    indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
    requiredSections: ['clinical_rationale', 'coil_field_distribution'],
    disclaimers: [
      'Field targets cannot be delivered using conventional focal figure-8 coils (§78).',
    ],
  },
  permittedCompatibilityConfigurationIds: [OCD_CONFIG_FIELD_VALIDATION_ID],
  limitations: [
    'Validation only (§189).',
    'Target geometry is coil_field. Downcasting to focal point target is strictly prohibited (§37, §149).',
  ],
};
