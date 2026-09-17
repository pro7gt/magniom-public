/**
 * @magniom/target-engine - Reference OCD Indication Targeting Plugin v2
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§48-51)
 * and Section 22 (Phase 2A OCDPlugin)
 */

import type {
  CandidateDraft,
  CandidateGeneratorDescriptor,
  CandidateGeneratorResult,
  IndicationTargetingPluginManifest,
  ComparisonDomainDefinition,
  RefinementProfileDefinition,
  SlateAssemblyProfileDefinition,
  ResolvedTargetEngineContextV2,
  ModuleContextValidation,
} from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';
import type { IndicationTargetingPlugin, CandidateFeatureProvider } from '../../sdk/plugin.js';
import type { CandidateGenerator } from '../../sdk/generator.js';
import {
  createCanonicalCoilFieldGeometry,
  createCanonicalPointGeometry,
} from '../../core/geometry-helper.js';

export const OCD_PLUGIN_ID = '22222222-2222-4222-8222-222222222222';
export const OCD_MODULE_RELEASE_ID = '22222222-2222-4222-8222-222222222223';

/**
 * Outputs coil_field geometry for mPFC/ACC deep TMS (e.g. H7 coil).
 * Conforms to §49: "SHALL output geometry_type = coil_field... SHALL NOT fabricate a focal MNI coordinate."
 */
export class OcdMpfcAccFieldGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-OCD-MPFC-FIELD-001',
    code: 'OCD_MPFC_ACC_FIELD_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [OCD_MODULE_RELEASE_ID],
    candidateRoles: ['evidence_anchor', 'field_target'],
    targetFamilyScopeIds: ['TF-OCD-MPFC-ACC-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: ['efield_modeling'],
    permittedGeometryTypes: ['coil_field'],
    baselineRelationship: 'creates_baseline',
    deterministic: true,
    generatorFailurePolicy: 'required_fail_run',
    configurationSha256: computeSha256('GEN-OCD-MPFC-FIELD-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const fieldDraft: CandidateDraft = {
      draftId: 'draft-ocd-mpfc-acc-field',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-OCD-MPFC-ACC-001',
      proposedRole: 'evidence_anchor',
      targetGeometry: createCanonicalCoilFieldGeometry(
        'BrainsWay-H7-Coil',
        {
          scalpCoordinate: { x: 0, y: 50, z: 70 },
          orientationDegrees: 0,
          coilToScalpDistanceMm: 0,
          placementCoordinateSystem: {
            id: '10-20-System',
            name: 'Standard 10-20 EEG System (Fz + 4cm anterior)',
            subjectSpecific: false,
          },
          placementDescription:
            'Midline anterior placement, 4 cm anterior to motor cortex representation',
        },
        {
          space: 'MNI152NLin2009cAsym',
          centerMni: { space: 'MNI152NLin2009cAsym', x: 0, y: 32, z: 38 },
          radiusMm: 25.0,
          primaryHcpParcel: 'd32_a24',
        },
        ['CIRCUIT-CORTICO-STRIATO-THALAMO-CORTICAL-001'],
        'ocd-field-generator',
        true,
      ),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-OCD-MPFC-ACC-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'evidence_baseline' },
      targetDefinitionOrigin: 'guideline',
      inputDataOrigin: 'none',
      patientPersonalizationStatus: 'fixed',
      clinicalApprovalStatus: 'approved',
      dataOrigin: 'normative',
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      rawScientificFeatures: [
        { code: 'field_coverage_ratio', value: 0.82, isApplicable: true },
        { code: 'circuit_concordance', value: 0.91, isApplicable: true },
        { code: 'pose_robustness', value: 0.87, isApplicable: true },
      ],
      generatorLimitations: [
        'Broad bilateral stimulation volume. Individual focal navigation not indicated for this protocol.',
      ],
      nominationRationale:
        'FDA-cleared bilateral mPFC/ACC deep TMS field target protocol (H7 coil equivalent).',
      generatorTrace: {
        algorithmCode: this.descriptor.code,
        algorithmVersion: this.descriptor.semanticVersion,
      },
    };

    return {
      generatorId: this.descriptor.id,
      generatorVersion: this.descriptor.semanticVersion,
      status: 'generated',
      candidates: [fieldDraft],
      diagnostics: [],
    };
  }
}

/**
 * Outputs focal point or surface ROI for pre-SMA/SMA target family.
 * Conforms to §51.
 */
export class OcdPreSmaSmaGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-OCD-PRESMA-001',
    code: 'OCD_PRESMA_SMA_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [OCD_MODULE_RELEASE_ID],
    candidateRoles: ['clinical_alternative'],
    targetFamilyScopeIds: ['TF-OCD-PRESMA-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point', 'surface_roi'],
    baselineRelationship: 'alternative_to_baseline',
    deterministic: true,
    generatorFailurePolicy: 'omit_generator_with_warning',
    configurationSha256: computeSha256('GEN-OCD-PRESMA-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const draftPoint: CandidateDraft = {
      draftId: 'draft-ocd-presma-point',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-OCD-PRESMA-001',
      proposedRole: 'clinical_alternative',
      targetGeometry: createCanonicalPointGeometry(0, 16, 56, 'bilateral', 'ocd-presma-generator'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-OCD-PRESMA-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'clinical_alternative' },
      targetDefinitionOrigin: 'guideline',
      inputDataOrigin: 'none',
      patientPersonalizationStatus: 'fixed',
      clinicalApprovalStatus: 'approved',
      dataOrigin: 'normative',
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      rawScientificFeatures: [
        { code: 'circuit_concordance', value: 0.83, isApplicable: true },
        { code: 'inhibitory_control_engagement', value: 0.79, isApplicable: true },
      ],
      generatorLimitations: [],
      nominationRationale: 'Supplementary motor / pre-SMA inhibitory circuit target for OCD.',
      generatorTrace: {
        algorithmCode: this.descriptor.code,
        algorithmVersion: this.descriptor.semanticVersion,
      },
    };

    return {
      generatorId: this.descriptor.id,
      generatorVersion: this.descriptor.semanticVersion,
      status: 'generated',
      candidates: [draftPoint],
      diagnostics: [],
    };
  }
}

/**
 * Outputs Left or Right DLPFC focal point target for OCD.
 */
export class OcdDlpfcGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-OCD-DLPFC-001',
    code: 'OCD_DLPFC_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [OCD_MODULE_RELEASE_ID],
    candidateRoles: ['clinical_alternative'],
    targetFamilyScopeIds: ['TF-OCD-RDLPFC-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'alternative_to_baseline',
    deterministic: true,
    generatorFailurePolicy: 'omit_generator_with_warning',
    configurationSha256: computeSha256('GEN-OCD-DLPFC-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const draft: CandidateDraft = {
      draftId: 'draft-ocd-rdlpfc-point',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-OCD-RDLPFC-001',
      proposedRole: 'clinical_alternative',
      targetGeometry: createCanonicalPointGeometry(42, 38, 30, 'right', 'ocd-dlpfc-generator'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-OCD-RDLPFC-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'clinical_alternative' },
      targetDefinitionOrigin: 'guideline',
      inputDataOrigin: 'none',
      patientPersonalizationStatus: 'fixed',
      clinicalApprovalStatus: 'approved',
      dataOrigin: 'normative',
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      rawScientificFeatures: [{ code: 'circuit_concordance', value: 0.74, isApplicable: true }],
      generatorLimitations: [],
      nominationRationale: 'Right DLPFC cognitive control alternative for OCD.',
      generatorTrace: {
        algorithmCode: this.descriptor.code,
        algorithmVersion: this.descriptor.semanticVersion,
      },
    };

    return {
      generatorId: this.descriptor.id,
      generatorVersion: this.descriptor.semanticVersion,
      status: 'generated',
      candidates: [draft],
      diagnostics: [],
    };
  }
}

/**
 * Research-only alternative generator for OCD network exploration.
 */
export class OcdResearchAlternativeGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-OCD-RESEARCH-001',
    code: 'OCD_RESEARCH_ALTERNATIVE_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [OCD_MODULE_RELEASE_ID],
    candidateRoles: ['research_hypothesis'],
    targetFamilyScopeIds: ['TF-OCD-OFC-RESEARCH-001'],
    evidencePathStatusScope: ['research_permitted'],
    permittedModes: ['research'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point', 'surface_roi'],
    baselineRelationship: 'none',
    deterministic: true,
    generatorFailurePolicy: 'research_optional',
    configurationSha256: computeSha256('GEN-OCD-RESEARCH-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const draft: CandidateDraft = {
      draftId: 'draft-ocd-ofc-research',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-OCD-OFC-RESEARCH-001',
      proposedRole: 'research_hypothesis',
      targetGeometry: createCanonicalPointGeometry(26, 36, -12, 'right', 'ocd-research-generator'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-OCD-OFC-RESEARCH-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'research_hypothesis' },
      rawScientificFeatures: [{ code: 'circuit_concordance', value: 0.88, isApplicable: true }],
      generatorLimitations: [
        'Investigational research hypothesis only. Lateral orbitofrontal cortex target.',
      ],
      nominationRationale: 'Exploratory orbitofrontal loop target for refractory OCD research.',
      generatorTrace: {
        algorithmCode: this.descriptor.code,
        algorithmVersion: this.descriptor.semanticVersion,
      },
    };

    return {
      generatorId: this.descriptor.id,
      generatorVersion: this.descriptor.semanticVersion,
      status: 'generated',
      candidates: [draft],
      diagnostics: [],
    };
  }
}

export class OCDPlugin implements IndicationTargetingPlugin {
  public readonly manifest: IndicationTargetingPluginManifest = {
    id: OCD_PLUGIN_ID,
    code: 'MAGNIOM-PLUGIN-OCD',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [OCD_MODULE_RELEASE_ID],
    permittedModes: ['clinical', 'research', 'validation'],
    generatorDescriptors: [
      new OcdMpfcAccFieldGenerator().descriptor,
      new OcdPreSmaSmaGenerator().descriptor,
      new OcdDlpfcGenerator().descriptor,
      new OcdResearchAlternativeGenerator().descriptor,
    ],
    featureProviderVersions: ['2.0.0'],
    comparisonProfileIds: ['DOMAIN-OCD-FIELD'],
    refinementProfileIds: [],
    slateProfileId: 'SLATE-OCD-STANDARD',
    requiredDomainSchemaVersion: '2.0.0',
    requiredPolicySchemaVersion: '2.0.0',
    codeCommit: 'HEAD',
    packageDigestSha256: computeSha256('MAGNIOM-PLUGIN-OCD-DIGEST-2.0.0'),
    scientificConfigurationSha256: computeSha256('OCD_SCIENTIFIC_CONFIG_2.0.0'),
  };

  public generators(): readonly CandidateGenerator[] {
    return [
      new OcdMpfcAccFieldGenerator(),
      new OcdPreSmaSmaGenerator(),
      new OcdDlpfcGenerator(),
      new OcdResearchAlternativeGenerator(),
    ];
  }

  public featureProviders(): readonly CandidateFeatureProvider[] {
    return [];
  }

  public comparisonProfiles(): readonly ComparisonDomainDefinition[] {
    return [
      {
        id: 'DOMAIN-OCD-FIELD',
        code: 'OCD_FIELD_TARGET_DOMAIN',
        indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
        comparisonBasis: 'same_target_family_variants',
        rankingProfileId: 'PROFILE-OCD-STANDARD',
        targetFamilyIds: ['TF-OCD-MPFC-ACC-001', 'TF-OCD-PRESMA-001'],
      },
    ];
  }

  public refinementProfiles(): readonly RefinementProfileDefinition[] {
    return [];
  }

  public slateProfile(): SlateAssemblyProfileDefinition {
    return {
      id: 'SLATE-OCD-STANDARD',
      indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
      maxPrimary: 2,
      maxAdditional: 2,
      rolePriorities: [
        { position: 'primary_1', preferredRoles: ['evidence_anchor', 'field_target'] },
        { position: 'primary_2', preferredRoles: ['clinical_alternative'] },
        { position: 'additional_a', preferredRoles: ['clinical_alternative'] },
      ],
      objectiveCoverageRules: [],
      diversityRules: [],
      mandatoryBaselineVisibility: true,
      allowZeroCandidateAbstention: true,
      scientificPolicyReleaseId: 'default',
    };
  }

  public validateModuleContext(context: ResolvedTargetEngineContextV2): ModuleContextValidation {
    const code = context.indicationModule?.code ?? '';
    const title = context.indicationModule?.title ?? '';
    const ind =
      context.indicationModule?.indication?.code ??
      context.indicationModule?.indication?.label ??
      '';
    const combined = `${code} ${title} ${ind}`.toUpperCase();
    const valid = combined.includes('OCD') || combined.includes('OBSESSIVE');
    return {
      valid,
      errors: valid ? [] : [`Indication module ${code || ind} is not an OCD module.`],
      warnings: [],
    };
  }
}
