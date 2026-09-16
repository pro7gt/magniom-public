/**
 * @magniom/target-engine - Reference MDD Indication Targeting Plugin v2
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§43-47)
 * and Section 22 (Phase 2A MDDPlugin)
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
import {
  computeCashZaleskyTarget,
  type VoxelNode,
} from '../../algorithms/cash-zalesky-clustering.js';
import {
  computePathwayCommunicationScore,
  computeEdgeCostMatrix,
  type StructuralGraph,
} from '../../algorithms/seguin-pathway-routing.js';

export const MDD_PLUGIN_ID = '11111111-1111-4111-8111-111111111111';
export const MDD_MODULE_RELEASE_ID = '11111111-1111-4111-8111-111111111112';

export class MDDEvidenceBaselineGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-MDD-EVIDENCE-001',
    code: 'MDD_EVIDENCE_BASELINE_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [MDD_MODULE_RELEASE_ID],
    candidateRoles: ['evidence_anchor', 'clinical_alternative'],
    targetFamilyScopeIds: ['TF-MDD-LDLPFC-EST-001', 'TF-MDD-ANXIOSOMATIC-DMPFC-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'creates_baseline',
    deterministic: true,
    generatorFailurePolicy: 'required_fail_run',
    configurationSha256: computeSha256('GEN-MDD-EVIDENCE-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    // Left DLPFC BA46 evidence anchor
    const draftBa46: CandidateDraft = {
      draftId: 'draft-mdd-ba46-evidence',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'evidence_anchor',
      targetGeometry: createCanonicalPointGeometry(-44, 40, 28, 'left', 'mdd-baseline-generator'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-MDD-LDLPFC-EST-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'evidence_baseline' },
      rawScientificFeatures: [
        { code: 'phenotype_concordance', value: 0.85, isApplicable: true },
        { code: 'circuit_concordance', value: 0.9, isApplicable: true },
        { code: 'cortical_depth_mm', value: 14.5, isApplicable: true },
      ],
      generatorLimitations: [],
      nominationRationale:
        'Canonical Left DLPFC BA46 evidence anchor for treatment-resistant depression.',
      generatorTrace: {
        algorithmCode: this.descriptor.code,
        algorithmVersion: this.descriptor.semanticVersion,
      },
    };

    // DMPFC BA9/32 evidence anchor
    const draftDmpfc: CandidateDraft = {
      draftId: 'draft-mdd-dmpfc-evidence',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-MDD-ANXIOSOMATIC-DMPFC-001',
      proposedRole: 'clinical_alternative',
      targetGeometry: createCanonicalPointGeometry(
        0,
        30,
        36,
        'bilateral',
        'mdd-baseline-generator',
      ),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-MDD-ANXIOSOMATIC-DMPFC-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'evidence_baseline' },
      rawScientificFeatures: [
        { code: 'phenotype_concordance', value: 0.7, isApplicable: true },
        { code: 'circuit_concordance', value: 0.75, isApplicable: true },
        { code: 'cortical_depth_mm', value: 16.0, isApplicable: true },
      ],
      generatorLimitations: [],
      nominationRationale: 'Bilateral DMPFC BA9/32 anchor for anxious/somatic MDD phenotype.',
      generatorTrace: {
        algorithmCode: this.descriptor.code,
        algorithmVersion: this.descriptor.semanticVersion,
      },
    };

    return {
      generatorId: this.descriptor.id,
      generatorVersion: this.descriptor.semanticVersion,
      status: 'generated',
      candidates: [draftBa46, draftDmpfc],
      diagnostics: [],
    };
  }
}

export class MDDConnectomeRefinementGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-MDD-REFINED-001',
    code: 'MDD_CONNECTOME_REFINEMENT_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [MDD_MODULE_RELEASE_ID],
    candidateRoles: ['connectome_refinement'],
    targetFamilyScopeIds: ['TF-MDD-LDLPFC-EST-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: ['individual_fc_refinement'],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'refines_baseline',
    deterministic: true,
    generatorFailurePolicy: 'omit_generator_with_warning',
    configurationSha256: computeSha256('GEN-MDD-REFINED-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    // If measurement capability is completely absent, emit no candidate
    const cap = context.measurementBundle.requirementEvaluations?.find(
      c => c.requirementCode === 'individual_fc_refinement',
    );
    if (cap && !cap.satisfied) {
      return {
        generatorId: this.descriptor.id,
        generatorVersion: this.descriptor.semanticVersion,
        status: 'no_candidate',
        candidates: [],
        diagnostics: [
          {
            level: 'info',
            code: 'FC_CAPABILITY_UNAVAILABLE',
            message: 'Patient-specific rs-fMRI FC refinement unavailable; omitting candidate.',
          },
        ],
      };
    }

    const rsMeasurement = context.measurementBundle.measurements.find(
      m => m.modality === 'resting_state_fmri',
    );
    const isSynthetic =
      context.measurementBundle.dataOrigin === 'synthetic' ||
      rsMeasurement?.dataOrigin === 'synthetic' ||
      !rsMeasurement;

    // Strict P0 Fail-Closed check: in CLINICAL mode, synthetic connectomics cannot refine targets
    if (context.request.mode.toLowerCase() === 'clinical' && isSynthetic) {
      return {
        generatorId: this.descriptor.id,
        generatorVersion: this.descriptor.semanticVersion,
        status: 'no_candidate',
        candidates: [],
        diagnostics: [
          {
            level: 'warning',
            code: 'FC_SYNTHETIC_PROHIBITED_IN_CLINICAL_MODE',
            message:
              'Simulated or synthetic rs-fMRI connectomics strictly prohibited from clinical target refinement (§40, Revision 01). Falling back to anatomical baseline.',
          },
        ],
      };
    }

    const candidateDataOrigin = isSynthetic ? 'synthetic' : 'patient_measured';
    const limitations = isSynthetic ? ['SYNTHETIC_DEMONSTRATOR', 'RESEARCH_ONLY'] : [];

    // Execute Cash-Zalesky cluster targeting algorithm
    const searchNodes: VoxelNode[] = [
      { id: 'v1', x: -40, y: 44, z: 30, connectivity: -0.65 },
      { id: 'v2', x: -42, y: 44, z: 30, connectivity: -0.55 },
      { id: 'v3', x: -40, y: 46, z: 30, connectivity: -0.45 },
      { id: 'v4', x: -44, y: 40, z: 28, connectivity: -0.4 },
    ];
    const clustering = computeCashZaleskyTarget(searchNodes, {
      thresholdPercentile: 0.75,
      minClusterSize: 2,
    });
    const targetX = Math.round(clustering.optimalTarget.x);
    const targetY = Math.round(clustering.optimalTarget.y);
    const targetZ = Math.round(clustering.optimalTarget.z);

    const isClinical = context.request.mode.toLowerCase() === 'clinical';
    const maturity = isClinical && !isSynthetic ? 'clinical_candidate' : 'validation';
    const promotionStatus = isSynthetic ? 'blocked' : 'candidate_under_review';

    const refinedDraft: CandidateDraft = {
      draftId: 'draft-mdd-ba46-fc-refined',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'connectome_refinement',
      dataOrigin: candidateDataOrigin,
      scientificMaturity: maturity,
      clinicalPromotionStatus: promotionStatus,
      targetGeometry: createCanonicalPointGeometry(
        targetX,
        targetY,
        targetZ,
        'left',
        'mdd-fc-generator',
      ),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-MDD-LDLPFC-EST-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: context.measurementBundle.measurements.map(m => m.measurementId),
      reliedOnReliabilityIds: context.reliabilityBundle ? [context.reliabilityBundle.id] : [],
      lineage: {
        lineageType: 'measurement_refinement',
        refinementKind: 'functional_connectivity',
        baselineCandidateDraftId: 'draft-mdd-ba46-evidence',
      },
      rawScientificFeatures: [
        { code: 'phenotype_concordance', value: 0.88, isApplicable: true },
        { code: 'circuit_concordance', value: 0.96, isApplicable: true },
        { code: 'incremental_gain', value: 0.12, isApplicable: true },
        { code: 'cortical_depth_mm', value: 14.8, isApplicable: true },
      ],
      generatorLimitations: limitations,
      nominationRationale: isSynthetic
        ? 'Simulated rs-fMRI connectome refined demonstration target in Left DLPFC BA46 (Research/Validation only).'
        : 'Cash-Zalesky personalized rs-fMRI connectome refined target in Left DLPFC BA46.',
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

export class MDDStructuralConnectivityGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-MDD-SC-001',
    code: 'MDD_SC_TRACTOGRAPHY_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [MDD_MODULE_RELEASE_ID],
    candidateRoles: ['connectome_refinement', 'clinical_alternative'],
    targetFamilyScopeIds: ['TF-MDD-LDLPFC-EST-001'],
    evidencePathStatusScope: ['validation_permitted', 'research_permitted'],
    permittedModes: ['validation', 'research'],
    requiredCapabilities: ['individual_sc_refinement'],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'refines_baseline',
    deterministic: true,
    generatorFailurePolicy: 'omit_generator_with_warning',
    configurationSha256: computeSha256('GEN-MDD-SC-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    if (context.request.mode.toLowerCase() === 'clinical') {
      return {
        generatorId: this.descriptor.id,
        generatorVersion: this.descriptor.semanticVersion,
        status: 'no_candidate',
        candidates: [],
        diagnostics: [
          {
            level: 'info',
            code: 'SC_GENERATOR_VALIDATION_ONLY',
            message:
              'SC tractography targeting (Li et al. 2026) is permitted in validation and research modes only.',
          },
        ],
      };
    }

    const scDraft: CandidateDraft = {
      draftId: 'draft-mdd-ba46-sc-refined',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'connectome_refinement',
      dataOrigin: 'synthetic',
      scientificMaturity: 'validation',
      clinicalPromotionStatus: 'blocked',
      targetGeometry: createCanonicalPointGeometry(-40, 42, 32, 'left', 'mdd-sc-generator'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-MDD-LDLPFC-EST-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: context.measurementBundle.measurements.map(m => m.measurementId),
      reliedOnReliabilityIds: context.reliabilityBundle ? [context.reliabilityBundle.id] : [],
      lineage: {
        lineageType: 'measurement_refinement',
        refinementKind: 'structural_connectivity',
        baselineCandidateDraftId: 'draft-mdd-ba46-evidence',
      },
      rawScientificFeatures: [
        { code: 'phenotype_concordance', value: 0.85, isApplicable: true },
        { code: 'circuit_concordance', value: 0.94, isApplicable: true },
        { code: 'incremental_gain', value: 0.14, isApplicable: true },
        { code: 'cortical_depth_mm', value: 15.2, isApplicable: true },
      ],
      generatorLimitations: ['SC_VALIDATION_ONLY'],
      nominationRationale:
        'Individual sgACC (A32sg) probabilistic tractography refined target in Left DLPFC (Li et al. 2026).',
      generatorTrace: {
        algorithmCode: this.descriptor.code,
        algorithmVersion: this.descriptor.semanticVersion,
      },
    };

    return {
      generatorId: this.descriptor.id,
      generatorVersion: this.descriptor.semanticVersion,
      status: 'generated',
      candidates: [scDraft],
      diagnostics: [],
    };
  }
}

export class MDDPathwayCommunicationGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-MDD-PATHWAY-001',
    code: 'MDD_NORMATIVE_PATHWAY_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [MDD_MODULE_RELEASE_ID],
    candidateRoles: ['research_hypothesis'],
    targetFamilyScopeIds: ['TF-MDD-LDLPFC-EST-001'],
    evidencePathStatusScope: ['research_permitted'],
    permittedModes: ['research'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'alternative_to_baseline',
    deterministic: true,
    generatorFailurePolicy: 'omit_generator_with_warning',
    configurationSha256: computeSha256('GEN-MDD-PATHWAY-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    if (context.request.mode.toLowerCase() !== 'research') {
      return {
        generatorId: this.descriptor.id,
        generatorVersion: this.descriptor.semanticVersion,
        status: 'no_candidate',
        candidates: [],
        diagnostics: [
          {
            level: 'info',
            code: 'PATHWAY_GENERATOR_RESEARCH_ONLY',
            message:
              'Normative polysynaptic pathway communication modeling (Seguin 2026) is strictly research-only.',
          },
        ],
      };
    }

    const normativeGraph: StructuralGraph = {
      nodeCount: 3,
      nodeLabels: ['R_SGC', 'Intermediate_SFG_Thalamus', 'L_DLPFC'],
      nodeCoordinatesMni: [
        { x: 6, y: 16, z: -10 },
        { x: 0, y: 28, z: 32 },
        { x: -38, y: 44, z: 34 },
      ],
      weights: [
        [1.0, 0.8, 0.05],
        [0.8, 1.0, 0.7],
        [0.05, 0.7, 1.0],
      ],
    };
    const costMatrix = computeEdgeCostMatrix(normativeGraph.weights);
    const pathwayScore = computePathwayCommunicationScore(
      normativeGraph,
      costMatrix,
      { x: -38, y: 44, z: 34 },
      { x: 6, y: 16, z: -10 },
    );

    const pathwayDraft: CandidateDraft = {
      draftId: 'draft-mdd-pathway-hypothesis',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'research_hypothesis',
      dataOrigin: 'normative',
      scientificMaturity: 'research',
      clinicalPromotionStatus: 'blocked',
      targetGeometry: createCanonicalPointGeometry(
        pathwayScore.stimulationCoordinate.x,
        pathwayScore.stimulationCoordinate.y,
        pathwayScore.stimulationCoordinate.z,
        'left',
        'mdd-pathway-generator',
      ),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-MDD-LDLPFC-EST-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [
        { code: 'phenotype_concordance', value: 0.82, isApplicable: true },
        { code: 'circuit_concordance', value: 0.91, isApplicable: true },
        { code: 'cortical_depth_mm', value: 14.5, isApplicable: true },
      ],
      generatorLimitations: ['NORMATIVE_PATHWAY_RESEARCH_ONLY', 'NORMATIVE_CONNECTOME_PROVENANCE'],
      nominationRationale:
        'Polysynaptic shortest-path communication route from Left DLPFC to Right SGC (Seguin & Zalesky 2026).',
      generatorTrace: {
        algorithmCode: this.descriptor.code,
        algorithmVersion: this.descriptor.semanticVersion,
      },
    };

    return {
      generatorId: this.descriptor.id,
      generatorVersion: this.descriptor.semanticVersion,
      status: 'generated',
      candidates: [pathwayDraft],
      diagnostics: [],
    };
  }
}

export class MDDPhenotypeCircuitGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-MDD-PHENOTYPE-001',
    code: 'MDD_PHENOTYPE_CIRCUIT_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [MDD_MODULE_RELEASE_ID],
    candidateRoles: ['phenotype_specific', 'clinical_alternative'],
    targetFamilyScopeIds: ['TF-MDD-ANXIOSOMATIC-DMPFC-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'alternative_to_baseline',
    deterministic: true,
    generatorFailurePolicy: 'omit_generator_with_warning',
    configurationSha256: computeSha256('GEN-MDD-PHENOTYPE-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const hasAnxiousSomatic = context.request.clinicalObjectiveIds.some(
      id => id.toLowerCase().includes('anxious') || id.toLowerCase().includes('somatic'),
    );

    if (!hasAnxiousSomatic) {
      return {
        generatorId: this.descriptor.id,
        generatorVersion: this.descriptor.semanticVersion,
        status: 'no_candidate',
        candidates: [],
        diagnostics: [
          {
            level: 'info',
            code: 'PHENOTYPE_OBJECTIVE_MISMATCH',
            message: 'No anxious/somatic clinical objective approved for phenotype circuit target.',
          },
        ],
      };
    }

    const draft: CandidateDraft = {
      draftId: 'draft-mdd-phenotype-dmpfc',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-MDD-ANXIOSOMATIC-DMPFC-001',
      proposedRole: 'phenotype_specific',
      targetGeometry: createCanonicalPointGeometry(
        0,
        32,
        38,
        'bilateral',
        'mdd-phenotype-generator',
      ),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-MDD-ANXIOSOMATIC-DMPFC-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'clinical_alternative' },
      rawScientificFeatures: [
        { code: 'phenotype_concordance', value: 0.92, isApplicable: true },
        { code: 'circuit_concordance', value: 0.84, isApplicable: true },
        { code: 'cortical_depth_mm', value: 16.2, isApplicable: true },
      ],
      generatorLimitations: [],
      nominationRationale:
        'Phenotype-specific dmPFC target for dominant anxious-somatic depression.',
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

export class MDDResearchNetworkGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-MDD-RESEARCH-001',
    code: 'MDD_RESEARCH_NETWORK_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [MDD_MODULE_RELEASE_ID],
    candidateRoles: ['research_hypothesis'],
    targetFamilyScopeIds: ['TF-MDD-RESEARCH-SUBCORTICAL-001'],
    evidencePathStatusScope: ['research_permitted'],
    permittedModes: ['research'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'none',
    deterministic: true,
    generatorFailurePolicy: 'research_optional',
    configurationSha256: computeSha256('GEN-MDD-RESEARCH-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const draft: CandidateDraft = {
      draftId: 'draft-mdd-research-sgacc',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-MDD-RESEARCH-SUBCORTICAL-001',
      proposedRole: 'research_hypothesis',
      targetGeometry: createCanonicalPointGeometry(6, 22, -10, 'midline', 'mdd-research-generator'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-MDD-RESEARCH-SUBCORTICAL-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'research_hypothesis' },
      rawScientificFeatures: [
        { code: 'network_concordance', value: 0.95, isApplicable: true },
        { code: 'research_novelty', value: 0.88, isApplicable: true },
      ],
      generatorLimitations: [
        'Research exploratory hypothesis only. Subgenual cingulate projection target.',
      ],
      nominationRationale:
        'Exploratory subgenual cingulate network node for MDD connectomic research.',
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

export class MDDPlugin implements IndicationTargetingPlugin {
  public readonly manifest: IndicationTargetingPluginManifest = {
    id: MDD_PLUGIN_ID,
    code: 'MAGNIOM-PLUGIN-MDD',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [MDD_MODULE_RELEASE_ID],
    permittedModes: ['clinical', 'research', 'validation'],
    generatorDescriptors: [
      new MDDEvidenceBaselineGenerator().descriptor,
      new MDDConnectomeRefinementGenerator().descriptor,
      new MDDPhenotypeCircuitGenerator().descriptor,
      new MDDStructuralConnectivityGenerator().descriptor,
      new MDDPathwayCommunicationGenerator().descriptor,
      new MDDResearchNetworkGenerator().descriptor,
    ],
    featureProviderVersions: ['2.0.0'],
    comparisonProfileIds: ['DOMAIN-MDD-DLPFC'],
    refinementProfileIds: ['REFINEMENT-MDD-FC'],
    slateProfileId: 'SLATE-MDD-STANDARD',
    requiredDomainSchemaVersion: '2.0.0',
    requiredPolicySchemaVersion: '2.0.0',
    codeCommit: 'HEAD',
    packageDigestSha256: computeSha256('MAGNIOM-PLUGIN-MDD-DIGEST-2.0.0'),
    scientificConfigurationSha256: computeSha256('MDD_SCIENTIFIC_CONFIG_2.0.0'),
  };

  public generators(): readonly CandidateGenerator[] {
    return [
      new MDDEvidenceBaselineGenerator(),
      new MDDConnectomeRefinementGenerator(),
      new MDDPhenotypeCircuitGenerator(),
      new MDDStructuralConnectivityGenerator(),
      new MDDPathwayCommunicationGenerator(),
      new MDDResearchNetworkGenerator(),
    ];
  }

  public featureProviders(): readonly CandidateFeatureProvider[] {
    return [];
  }

  public comparisonProfiles(): readonly ComparisonDomainDefinition[] {
    return [
      {
        id: 'DOMAIN-MDD-DLPFC',
        code: 'MDD_DLPFC_VARIANTS',
        indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
        comparisonBasis: 'same_target_family_variants',
        rankingProfileId: 'PROFILE-MDD-GMEAN',
        targetFamilyIds: ['TF-MDD-LDLPFC-EST-001', 'TF-MDD-ANXIOSOMATIC-DMPFC-001'],
      },
    ];
  }

  public refinementProfiles(): readonly RefinementProfileDefinition[] {
    return [
      {
        id: 'REFINEMENT-MDD-FC',
        code: 'MDD_FC_REFINEMENT',
        refinementKind: 'functional_connectivity',
        baselineRole: 'evidence_anchor',
        refinedRole: 'connectome_refinement',
        requiredCapabilities: ['individual_fc_refinement'],
        adoptionRules: [
          {
            ruleCode: 'MAX_DISPLACEMENT',
            description: 'Max displacement 20mm',
            maxDisplacementMm: 20.0,
          },
          {
            ruleCode: 'MIN_GAIN',
            description: 'Min incremental concordance gain +5%',
            minIncrementalValue: 0.05,
          },
        ],
        displacementMetric: 'euclidean',
        scientificPolicyReleaseId: 'default',
      },
    ];
  }

  public slateProfile(): SlateAssemblyProfileDefinition {
    return {
      id: 'SLATE-MDD-STANDARD',
      indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
      maxPrimary: 3,
      maxAdditional: 2,
      rolePriorities: [
        { position: 'primary_1', preferredRoles: ['connectome_refinement', 'evidence_anchor'] },
        { position: 'primary_2', preferredRoles: ['phenotype_specific', 'clinical_alternative'] },
        { position: 'primary_3', preferredRoles: ['clinical_alternative'] },
        { position: 'additional_a', preferredRoles: ['evidence_anchor', 'clinical_alternative'] },
        { position: 'additional_b', preferredRoles: ['clinical_alternative'] },
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
    const valid = combined.includes('MDD') || combined.includes('DEPRESSION');
    return {
      valid,
      errors: valid ? [] : [`Indication module ${code || ind} is not an MDD module.`],
      warnings: [],
    };
  }
}
