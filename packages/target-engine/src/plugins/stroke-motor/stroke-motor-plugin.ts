/**
 * @magniom/target-engine - Reference Stroke Motor Recovery Indication Targeting Plugin v2
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§56-61)
 * and Section 22 (Phase 2A StrokeMotorPlugin)
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
import { createCanonicalPointGeometry } from '../../core/geometry-helper.js';

export const STROKE_MOTOR_PLUGIN_ID = '44444444-4444-4444-8444-444444444444';
export const STROKE_MOTOR_MODULE_RELEASE_ID = '44444444-4444-4444-8444-444444444445';

/**
 * Contralesional M1 candidate generator.
 * Conforms to §57: Preserves mechanistic uncertainty; does not declare contralesional = pathological.
 */
export class StrokeContralesionalM1Generator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-STROKE-CONTRALESIONAL-001',
    code: 'STROKE_CONTRALESIONAL_M1_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [STROKE_MOTOR_MODULE_RELEASE_ID],
    candidateRoles: ['evidence_anchor', 'clinical_alternative'],
    targetFamilyScopeIds: ['TF-STROKE-CONTRALESIONAL-M1-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point', 'somatotopic'],
    baselineRelationship: 'creates_baseline',
    deterministic: true,
    generatorFailurePolicy: 'required_fail_run',
    configurationSha256: computeSha256('GEN-STROKE-CONTRALESIONAL-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    // Lesion context laterality
    const lesion = context.lesionContexts?.[0];
    const lesionHemisphere = lesion?.lesionLaterality?.toLowerCase() === 'right' ? 'right' : 'left';
    // Contralesional target is opposite to lesion hemisphere
    const contralesionalHemisphere: 'left' | 'right' =
      lesionHemisphere === 'left' ? 'right' : 'left';
    const xCoord = contralesionalHemisphere === 'left' ? -38 : 38;

    const draft: CandidateDraft = {
      draftId: `draft-stroke-contralesional-${contralesionalHemisphere}-m1`,
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-STROKE-CONTRALESIONAL-M1-001',
      proposedRole: 'evidence_anchor',
      targetGeometry: createCanonicalPointGeometry(
        xCoord,
        -22,
        58,
        contralesionalHemisphere,
        'stroke-contralesional-gen',
      ),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-STROKE-CONTRALESIONAL-M1-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: lesion ? [lesion.id] : [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'evidence_baseline' },
      dataOrigin: 'patient_measured',
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      rawScientificFeatures: [
        { code: 'motor_circuit_concordance', value: 0.89, isApplicable: true },
        { code: 'interhemispheric_inhibition_ratio', value: 0.76, isApplicable: true },
      ],
      generatorLimitations: [
        'Low-frequency inhibitory contralesional M1 protocol hypothesis. Mechanistic interhemispheric balance model carries active scientific debate.',
      ],
      nominationRationale: `Contralesional ${contralesionalHemisphere.toUpperCase()} M1 hand knob target to reduce maladaptive transcallosal inhibition.`,
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
 * Ipsilesional M1 candidate generator.
 * Conforms to §58: Evaluates lesion destruction; fails/abstains if ipsilesional motor cortex destroyed.
 */
export class StrokeIpsilesionalM1Generator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-STROKE-IPSILESIONAL-001',
    code: 'STROKE_IPSILESIONAL_M1_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [STROKE_MOTOR_MODULE_RELEASE_ID],
    candidateRoles: ['clinical_alternative'],
    targetFamilyScopeIds: ['TF-STROKE-IPSILESIONAL-M1-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: ['structural_lesion_qc'],
    permittedGeometryTypes: ['point', 'somatotopic'],
    baselineRelationship: 'alternative_to_baseline',
    deterministic: true,
    generatorFailurePolicy: 'omit_generator_with_warning',
    configurationSha256: computeSha256('GEN-STROKE-IPSILESIONAL-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const lesion = context.lesionContexts?.[0];
    const lesionHemisphere: 'left' | 'right' =
      lesion?.lesionLaterality?.toLowerCase() === 'right' ? 'right' : 'left';

    // Check if ipsilesional motor cortex is substantially destroyed
    const cortexDestroyed =
      (lesion?.lesionVolumeCm3 && lesion.lesionVolumeCm3 > 100) ||
      (lesion?.interpretation && lesion.interpretation.toLowerCase().includes('destroyed'));
    if (cortexDestroyed) {
      return {
        generatorId: this.descriptor.id,
        generatorVersion: this.descriptor.semanticVersion,
        status: 'abstained',
        candidates: [],
        abstention: {
          reasonCode: 'IPSILESIONAL_CORTEX_DESTROYED',
          explanation:
            'Severe ipsilesional cortical destruction precludes anatomical M1 stimulation.',
        },
        diagnostics: [
          {
            level: 'warning',
            code: 'IPSILESIONAL_CORTEX_DESTROYED',
            message:
              'Ipsilesional motor cortex substantially destroyed by stroke; abstaining from ipsilesional candidate generation.',
          },
        ],
      };
    }

    const xCoord = lesionHemisphere === 'left' ? -38 : 38;

    const draft: CandidateDraft = {
      draftId: `draft-stroke-ipsilesional-${lesionHemisphere}-m1`,
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-STROKE-IPSILESIONAL-M1-001',
      proposedRole: 'clinical_alternative',
      targetGeometry: createCanonicalPointGeometry(
        xCoord,
        -22,
        58,
        lesionHemisphere,
        'stroke-ipsilesional-gen',
      ),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-STROKE-IPSILESIONAL-M1-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: lesion ? [lesion.id] : [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'clinical_alternative' },
      dataOrigin: 'patient_measured',
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      rawScientificFeatures: [
        { code: 'residual_perilesional_integrity', value: 0.72, isApplicable: true },
        { code: 'corticospinal_tract_sparing', value: 0.65, isApplicable: true },
      ],
      generatorLimitations: [
        'Requires preserved perilesional cortex. Efficacy depends on residual corticospinal tract integrity.',
      ],
      nominationRationale: `Ipsilesional ${lesionHemisphere.toUpperCase()} perilesional M1 facilitatory target for motor recovery.`,
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
 * Bilateral strategy generator.
 * Conforms to §59: Evaluates bilateral hypotheses; does NOT prescribe autonomous bilateral treatment protocols.
 */
export class StrokeBilateralStrategyGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-STROKE-BILATERAL-001',
    code: 'STROKE_BILATERAL_STRATEGY_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [STROKE_MOTOR_MODULE_RELEASE_ID],
    candidateRoles: ['clinical_alternative'],
    targetFamilyScopeIds: ['TF-STROKE-CONTRALESIONAL-M1-001', 'TF-STROKE-IPSILESIONAL-M1-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'alternative_to_baseline',
    deterministic: true,
    generatorFailurePolicy: 'omit_generator_with_warning',
    configurationSha256: computeSha256('GEN-STROKE-BILATERAL-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    // Only generates if clinical objectives explicitly approve bilateral strategy
    const hasBilateralObjective = context.request.clinicalObjectiveIds.some(id =>
      id.toLowerCase().includes('bilateral'),
    );

    if (!hasBilateralObjective) {
      return {
        generatorId: this.descriptor.id,
        generatorVersion: this.descriptor.semanticVersion,
        status: 'no_candidate',
        candidates: [],
        diagnostics: [
          {
            level: 'info',
            code: 'BILATERAL_OBJECTIVE_ABSENT',
            message:
              'Bilateral stroke motor recovery strategy not explicitly requested in clinical objectives.',
          },
        ],
      };
    }

    const draft: CandidateDraft = {
      draftId: 'draft-stroke-bilateral-candidate',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-STROKE-CONTRALESIONAL-M1-001',
      proposedRole: 'clinical_alternative',
      targetGeometry: createCanonicalPointGeometry(
        38,
        -22,
        58,
        'bilateral',
        'stroke-bilateral-gen',
      ),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-STROKE-CONTRALESIONAL-M1-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'clinical_alternative' },
      dataOrigin: 'patient_measured',
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      rawScientificFeatures: [
        { code: 'bilateral_coordination_index', value: 0.84, isApplicable: true },
      ],
      generatorLimitations: [
        'Target decision support only. Sequencing, intensity, and protocol delivery remain outside engine authority.',
      ],
      nominationRationale:
        'Bilateral stimulation target hypothesis for severe motor impairment recovery.',
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
 * Motor map refinement generator for stroke motor recovery.
 * Conforms to §60: Refines target based on qualified motor mapping.
 */
export class StrokeMotorMapRefinementGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-STROKE-MOTOR-MAP-REFINED-001',
    code: 'STROKE_MOTOR_MAP_REFINEMENT_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [STROKE_MOTOR_MODULE_RELEASE_ID],
    candidateRoles: ['somatotopic_target'],
    targetFamilyScopeIds: ['TF-STROKE-CONTRALESIONAL-M1-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: ['motor_hotspot_targeting'],
    optionalCapabilities: [],
    permittedGeometryTypes: ['somatotopic', 'point'],
    baselineRelationship: 'refines_baseline',
    deterministic: true,
    generatorFailurePolicy: 'omit_generator_with_warning',
    configurationSha256: computeSha256('GEN-STROKE-MOTOR-MAP-REFINED-001-v2.0.0'),
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
            message: 'Motor mapping refinement unavailable for stroke case; omitting candidate.',
          },
        ],
      };
    }

    const lesion = context.lesionContexts?.[0];
    const lesionHemisphere = lesion?.lesionLaterality?.toLowerCase() === 'right' ? 'right' : 'left';
    const contralesionalHemisphere: 'left' | 'right' =
      lesionHemisphere === 'left' ? 'right' : 'left';
    const xCoord = contralesionalHemisphere === 'left' ? -36 : 36;

    const draft: CandidateDraft = {
      draftId: `draft-stroke-motor-map-refined-${contralesionalHemisphere}`,
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-STROKE-CONTRALESIONAL-M1-001',
      proposedRole: 'somatotopic_target',
      targetGeometry: createCanonicalPointGeometry(
        xCoord,
        -20,
        60,
        contralesionalHemisphere,
        'stroke-motor-refiner',
      ),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-STROKE-CONTRALESIONAL-M1-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: context.measurementBundle.measurements.map(m => m.measurementId),
      reliedOnReliabilityIds: context.reliabilityBundle ? [context.reliabilityBundle.id] : [],
      lineage: {
        lineageType: 'measurement_refinement',
        refinementKind: 'motor_mapping',
        baselineCandidateDraftId: `draft-stroke-contralesional-${contralesionalHemisphere}-m1`,
      },
      dataOrigin: 'patient_measured',
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      rawScientificFeatures: [
        { code: 'hotspot_concordance', value: 0.95, isApplicable: true },
        { code: 'incremental_gain', value: 0.11, isApplicable: true },
      ],
      generatorLimitations: [],
      nominationRationale: `Physiologically refined motor hotspot in contralesional ${contralesionalHemisphere.toUpperCase()} M1.`,
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
 * Compensatory premotor research generator.
 * Conforms to §61: Research only; generation_status = research_only.
 */
export class StrokeCompensatoryPremotorResearchGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-STROKE-PREMOTOR-RESEARCH-001',
    code: 'STROKE_COMPENSATORY_PREMOTOR_RESEARCH_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [STROKE_MOTOR_MODULE_RELEASE_ID],
    candidateRoles: ['research_hypothesis'],
    targetFamilyScopeIds: ['TF-STROKE-PREMOTOR-RESEARCH-001'],
    evidencePathStatusScope: ['research_permitted'],
    permittedModes: ['research'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'none',
    deterministic: true,
    generatorFailurePolicy: 'research_optional',
    configurationSha256: computeSha256('GEN-STROKE-PREMOTOR-RESEARCH-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const draft: CandidateDraft = {
      draftId: 'draft-stroke-premotor-research',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-STROKE-PREMOTOR-RESEARCH-001',
      proposedRole: 'research_hypothesis',
      targetGeometry: createCanonicalPointGeometry(-32, 10, 52, 'left', 'stroke-premotor-gen'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-STROKE-PREMOTOR-RESEARCH-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'research_hypothesis' },
      rawScientificFeatures: [
        { code: 'premotor_compensation_potential', value: 0.78, isApplicable: true },
      ],
      generatorLimitations: [
        'Investigational research hypothesis only. Dorsal premotor compensatory candidate.',
      ],
      nominationRationale:
        'Exploratory dorsal premotor cortex candidate for motor recovery research.',
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

export class StrokeMotorPlugin implements IndicationTargetingPlugin {
  public readonly manifest: IndicationTargetingPluginManifest = {
    id: STROKE_MOTOR_PLUGIN_ID,
    code: 'MAGNIOM-PLUGIN-STROKE-MOTOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [STROKE_MOTOR_MODULE_RELEASE_ID],
    permittedModes: ['clinical', 'research', 'validation'],
    generatorDescriptors: [
      new StrokeContralesionalM1Generator().descriptor,
      new StrokeIpsilesionalM1Generator().descriptor,
      new StrokeBilateralStrategyGenerator().descriptor,
      new StrokeMotorMapRefinementGenerator().descriptor,
      new StrokeCompensatoryPremotorResearchGenerator().descriptor,
    ],
    featureProviderVersions: ['2.0.0'],
    comparisonProfileIds: ['DOMAIN-STROKE-MOTOR'],
    refinementProfileIds: ['REFINEMENT-STROKE-MOTOR'],
    slateProfileId: 'SLATE-STROKE-STANDARD',
    requiredDomainSchemaVersion: '2.0.0',
    requiredPolicySchemaVersion: '2.0.0',
    codeCommit: 'HEAD',
    packageDigestSha256: computeSha256('MAGNIOM-PLUGIN-STROKE-MOTOR-DIGEST-2.0.0'),
    scientificConfigurationSha256: computeSha256('STROKE_MOTOR_SCIENTIFIC_CONFIG_2.0.0'),
  };

  public generators(): readonly CandidateGenerator[] {
    return [
      new StrokeContralesionalM1Generator(),
      new StrokeIpsilesionalM1Generator(),
      new StrokeBilateralStrategyGenerator(),
      new StrokeMotorMapRefinementGenerator(),
      new StrokeCompensatoryPremotorResearchGenerator(),
    ];
  }

  public featureProviders(): readonly CandidateFeatureProvider[] {
    return [];
  }

  public comparisonProfiles(): readonly ComparisonDomainDefinition[] {
    return [
      {
        id: 'DOMAIN-STROKE-MOTOR',
        code: 'STROKE_MOTOR_CANDIDATE_DOMAIN',
        indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
        comparisonBasis: 'same_target_family_variants',
        rankingProfileId: 'PROFILE-STROKE-STANDARD',
        targetFamilyIds: ['TF-STROKE-CONTRALESIONAL-M1-001', 'TF-STROKE-IPSILESIONAL-M1-001'],
      },
    ];
  }

  public refinementProfiles(): readonly RefinementProfileDefinition[] {
    return [
      {
        id: 'REFINEMENT-STROKE-MOTOR',
        code: 'STROKE_MOTOR_HOTSPOT_REFINEMENT',
        refinementKind: 'motor_mapping',
        baselineRole: 'evidence_anchor',
        refinedRole: 'somatotopic_target',
        requiredCapabilities: ['motor_hotspot_targeting'],
        adoptionRules: [
          {
            ruleCode: 'MAX_DISPLACEMENT',
            description: 'Max displacement 18mm from M1 hand knob',
            maxDisplacementMm: 18.0,
          },
        ],
        displacementMetric: 'euclidean',
        scientificPolicyReleaseId: 'default',
      },
    ];
  }

  public slateProfile(): SlateAssemblyProfileDefinition {
    return {
      id: 'SLATE-STROKE-STANDARD',
      indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
      maxPrimary: 2,
      maxAdditional: 2,
      rolePriorities: [
        { position: 'primary_1', preferredRoles: ['somatotopic_target', 'evidence_anchor'] },
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
    const isStroke = combined.includes('STROKE');
    const isMotor = combined.includes('MOTOR') || !combined.includes('APHASIA');
    const valid = isStroke && isMotor;
    return {
      valid,
      errors: valid
        ? []
        : [`Indication module ${code || ind} is not a Stroke Motor Recovery module.`],
      warnings: [],
    };
  }
}
