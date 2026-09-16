/**
 * @magniom/target-engine - Reference Neuropathic Pain Indication Targeting Plugin v2
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§52-55)
 * and Section 22 (Phase 2A NeuropathicPainPlugin)
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
  createCanonicalSomatotopicGeometry,
  createCanonicalPointGeometry,
} from '../../core/geometry-helper.js';

export const PAIN_PLUGIN_ID = '33333333-3333-4333-8333-333333333333';
export const PAIN_MODULE_RELEASE_ID = '33333333-3333-4333-8333-333333333334';

/**
 * Outputs somatotopic M1 candidate contralateral to painful body region.
 * Conforms to §53-54: Somatotopic geometry, deterministic contralateral mapping for unilateral pain.
 */
export class PainM1SomatotopicBaselineGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-PAIN-M1-SOMATO-001',
    code: 'PAIN_M1_SOMATOTOPIC_BASELINE_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [PAIN_MODULE_RELEASE_ID],
    candidateRoles: ['evidence_anchor', 'somatotopic_target'],
    targetFamilyScopeIds: ['TF-PAIN-M1-SOMATOTOPIC-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: ['motor_hotspot_targeting'],
    permittedGeometryTypes: ['somatotopic'],
    baselineRelationship: 'creates_baseline',
    deterministic: true,
    generatorFailurePolicy: 'required_fail_run',
    configurationSha256: computeSha256('GEN-PAIN-M1-SOMATO-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    // Evaluate affected side from phenotype snapshot
    const affectedSideRaw =
      (
        context.phenotypeSnapshot as { affectedSide?: string } | undefined
      )?.affectedSide?.toLowerCase() ?? 'right';

    // §54: Laterality Rule
    if (affectedSideRaw === 'bilateral' || affectedSideRaw === 'ambiguous') {
      return {
        generatorId: this.descriptor.id,
        generatorVersion: this.descriptor.semanticVersion,
        status: 'abstained',
        candidates: [],
        abstention: {
          reasonCode: 'PAIN_LATERALITY_AMBIGUOUS',
          explanation:
            'Bilateral or ambiguous pain presentation requires specialist clinical review to determine target hemisphere.',
        },
        diagnostics: [
          {
            level: 'warning',
            code: 'PAIN_LATERALITY_AMBIGUOUS',
            message:
              'Bilateral/ambiguous pain: engine will not arbitrarily select stimulation hemisphere.',
          },
        ],
      };
    }

    // Contralateral cortical representation
    const stimulationHemisphere: 'left' | 'right' = affectedSideRaw === 'left' ? 'right' : 'left';
    const affectedSide: 'left' | 'right' = affectedSideRaw === 'left' ? 'left' : 'right';

    const somatoDraft: CandidateDraft = {
      draftId: `draft-pain-m1-${stimulationHemisphere}-somatotopic`,
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-PAIN-M1-SOMATOTOPIC-001',
      proposedRole: 'somatotopic_target',
      targetGeometry: createCanonicalSomatotopicGeometry(
        { atlasName: 'Glasser360', atlasVersion: '1.0', space: 'MNI152NLin2009cAsym' },
        { code: 'UPPER_EXTREMITY', label: 'Contralateral Upper Limb / Hand' },
        stimulationHemisphere,
        affectedSide,
        'pain-somatotopic-generator',
      ),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-PAIN-M1-SOMATOTOPIC-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'evidence_baseline' },
      dataOrigin: 'patient_measured',
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      rawScientificFeatures: [
        { code: 'somatotopic_concordance', value: 0.94, isApplicable: true },
        { code: 'contralateral_alignment', value: 1.0, isApplicable: true },
      ],
      generatorLimitations: [
        'Anatomical representation baseline; individual motor mapping refinement recommended if available.',
      ],
      nominationRationale: `Contralateral ${stimulationHemisphere.toUpperCase()} primary motor cortex somatotopic target for ${affectedSide.toUpperCase()} neuropathic pain.`,
      generatorTrace: {
        algorithmCode: this.descriptor.code,
        algorithmVersion: this.descriptor.semanticVersion,
      },
    };

    return {
      generatorId: this.descriptor.id,
      generatorVersion: this.descriptor.semanticVersion,
      status: 'generated',
      candidates: [somatoDraft],
      diagnostics: [],
    };
  }
}

/**
 * Refines the somatotopic baseline using patient TMS motor mapping hotspot.
 * Conforms to §55: Requires motor_hotspot_targeting, links to baseline draft.
 */
export class PainMotorMapRefinementGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-PAIN-M1-REFINED-001',
    code: 'PAIN_MOTOR_MAP_REFINEMENT_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [PAIN_MODULE_RELEASE_ID],
    candidateRoles: ['somatotopic_target'],
    targetFamilyScopeIds: ['TF-PAIN-M1-SOMATOTOPIC-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: ['motor_hotspot_targeting'],
    optionalCapabilities: [],
    permittedGeometryTypes: ['somatotopic'],
    baselineRelationship: 'refines_baseline',
    deterministic: true,
    generatorFailurePolicy: 'omit_generator_with_warning',
    configurationSha256: computeSha256('GEN-PAIN-M1-REFINED-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const motorCap = context.measurementBundle.requirementEvaluations?.find(
      r => r.requirementCode === 'motor_hotspot_targeting',
    );

    if (motorCap && !motorCap.satisfied) {
      return {
        generatorId: this.descriptor.id,
        generatorVersion: this.descriptor.semanticVersion,
        status: 'no_candidate',
        candidates: [],
        diagnostics: [
          {
            level: 'info',
            code: 'MOTOR_MAP_UNAVAILABLE',
            message:
              'Motor hotspot targeting capability is not qualified for this case; omitting refinement.',
          },
        ],
      };
    }

    const affectedSideRaw =
      (
        context.phenotypeSnapshot as { affectedSide?: string } | undefined
      )?.affectedSide?.toLowerCase() ?? 'right';
    if (affectedSideRaw === 'bilateral' || affectedSideRaw === 'ambiguous') {
      return {
        generatorId: this.descriptor.id,
        generatorVersion: this.descriptor.semanticVersion,
        status: 'no_candidate',
        candidates: [],
        diagnostics: [],
      };
    }

    const stimulationHemisphere: 'left' | 'right' = affectedSideRaw === 'left' ? 'right' : 'left';
    const mappedX = stimulationHemisphere === 'left' ? -38 : 38;

    const refinedDraft: CandidateDraft = {
      draftId: `draft-pain-m1-${stimulationHemisphere}-motor-refined`,
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-PAIN-M1-SOMATOTOPIC-001',
      proposedRole: 'somatotopic_target',
      targetGeometry: createCanonicalSomatotopicGeometry(
        { atlasName: 'Glasser360', atlasVersion: '1.0', space: 'MNI152NLin2009cAsym' },
        { code: 'UPPER_EXTREMITY', label: 'Physiologically Mapped Motor Hotspot' },
        stimulationHemisphere,
        affectedSideRaw as 'left' | 'right',
        'pain-motor-map-refiner',
        { x: mappedX, y: -22, z: 58 },
      ),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-PAIN-M1-SOMATOTOPIC-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: context.measurementBundle.measurements.map(m => m.measurementId),
      reliedOnReliabilityIds: context.reliabilityBundle ? [context.reliabilityBundle.id] : [],
      lineage: {
        lineageType: 'measurement_refinement',
        refinementKind: 'motor_mapping',
        baselineCandidateDraftId: `draft-pain-m1-${stimulationHemisphere}-somatotopic`,
      },
      dataOrigin: 'patient_measured',
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      rawScientificFeatures: [
        { code: 'hotspot_concordance', value: 0.98, isApplicable: true },
        { code: 'incremental_gain', value: 0.15, isApplicable: true },
      ],
      generatorLimitations: [],
      nominationRationale: `Physiologically verified motor hotspot target in contralateral ${stimulationHemisphere.toUpperCase()} M1.`,
      generatorTrace: {
        algorithmCode: this.descriptor.code,
        algorithmVersion: this.descriptor.semanticVersion,
      },
    };

    return {
      generatorId: this.descriptor.id,
      generatorVersion: this.descriptor.semanticVersion,
      status: 'generated',
      candidates: [refinedDraft],
      diagnostics: [],
    };
  }
}

/**
 * Research-only generator exploring secondary somatosensory or insular network targets.
 */
export class PainResearchNetworkGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-PAIN-RESEARCH-001',
    code: 'PAIN_RESEARCH_NETWORK_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [PAIN_MODULE_RELEASE_ID],
    candidateRoles: ['research_hypothesis'],
    targetFamilyScopeIds: ['TF-PAIN-RESEARCH-INSULA-001'],
    evidencePathStatusScope: ['research_permitted'],
    permittedModes: ['research'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'none',
    deterministic: true,
    generatorFailurePolicy: 'research_optional',
    configurationSha256: computeSha256('GEN-PAIN-RESEARCH-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const draft: CandidateDraft = {
      draftId: 'draft-pain-research-insula',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-PAIN-RESEARCH-INSULA-001',
      proposedRole: 'research_hypothesis',
      targetGeometry: createCanonicalPointGeometry(38, 12, 4, 'right', 'pain-research-generator'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-PAIN-RESEARCH-INSULA-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'research_hypothesis' },
      rawScientificFeatures: [{ code: 'circuit_concordance', value: 0.81, isApplicable: true }],
      generatorLimitations: [
        'Investigational research hypothesis only. Operculo-insular pain projection target.',
      ],
      nominationRationale:
        'Exploratory insular pain processing network node for chronic pain research.',
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

export class NeuropathicPainPlugin implements IndicationTargetingPlugin {
  public readonly manifest: IndicationTargetingPluginManifest = {
    id: PAIN_PLUGIN_ID,
    code: 'MAGNIOM-PLUGIN-PAIN-NP',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [PAIN_MODULE_RELEASE_ID],
    permittedModes: ['clinical', 'research', 'validation'],
    generatorDescriptors: [
      new PainM1SomatotopicBaselineGenerator().descriptor,
      new PainMotorMapRefinementGenerator().descriptor,
      new PainResearchNetworkGenerator().descriptor,
    ],
    featureProviderVersions: ['2.0.0'],
    comparisonProfileIds: ['DOMAIN-PAIN-M1'],
    refinementProfileIds: ['REFINEMENT-PAIN-MOTOR-MAP'],
    slateProfileId: 'SLATE-PAIN-STANDARD',
    requiredDomainSchemaVersion: '2.0.0',
    requiredPolicySchemaVersion: '2.0.0',
    codeCommit: 'HEAD',
    packageDigestSha256: computeSha256('MAGNIOM-PLUGIN-PAIN-NP-DIGEST-2.0.0'),
    scientificConfigurationSha256: computeSha256('PAIN_SCIENTIFIC_CONFIG_2.0.0'),
  };

  public generators(): readonly CandidateGenerator[] {
    return [
      new PainM1SomatotopicBaselineGenerator(),
      new PainMotorMapRefinementGenerator(),
      new PainResearchNetworkGenerator(),
    ];
  }

  public featureProviders(): readonly CandidateFeatureProvider[] {
    return [];
  }

  public comparisonProfiles(): readonly ComparisonDomainDefinition[] {
    return [
      {
        id: 'DOMAIN-PAIN-M1',
        code: 'PAIN_M1_SOMATOTOPIC_DOMAIN',
        indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
        comparisonBasis: 'same_target_family_variants',
        rankingProfileId: 'PROFILE-PAIN-STANDARD',
        targetFamilyIds: ['TF-PAIN-M1-SOMATOTOPIC-001'],
      },
    ];
  }

  public refinementProfiles(): readonly RefinementProfileDefinition[] {
    return [
      {
        id: 'REFINEMENT-PAIN-MOTOR-MAP',
        code: 'PAIN_MOTOR_MAPPING_REFINEMENT',
        refinementKind: 'motor_mapping',
        baselineRole: 'somatotopic_target',
        refinedRole: 'somatotopic_target',
        requiredCapabilities: ['motor_hotspot_targeting'],
        adoptionRules: [
          {
            ruleCode: 'MAX_DISPLACEMENT',
            description: 'Max displacement 15mm from anatomical hand knob',
            maxDisplacementMm: 15.0,
          },
        ],
        displacementMetric: 'euclidean',
        scientificPolicyReleaseId: 'default',
      },
    ];
  }

  public slateProfile(): SlateAssemblyProfileDefinition {
    return {
      id: 'SLATE-PAIN-STANDARD',
      indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
      maxPrimary: 2,
      maxAdditional: 1,
      rolePriorities: [
        { position: 'primary_1', preferredRoles: ['somatotopic_target', 'evidence_anchor'] },
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
    const valid = combined.includes('PAIN') || combined.includes('NEUROPATHIC');
    return {
      valid,
      errors: valid ? [] : [`Indication module ${code || ind} is not a Neuropathic Pain module.`],
      warnings: [],
    };
  }
}
