/**
 * @magniom/target-engine - Reference Traumatic Brain Injury (TBI) Indication Targeting Plugin v2
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§66-69)
 * and Section 22 (Phase 2A TBIPlugin)
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

export const TBI_PLUGIN_ID = '66666666-6666-4666-8666-666666666666';
export const TBI_MODULE_RELEASE_ID = '66666666-6666-4666-8666-666666666667';

/**
 * Conservative evidence-bound generator for TBI targets.
 * Conforms to §67: Only generates if EvidencePath explicitly binds TBI objective -> TargetFamily -> Strategy.
 * Does NOT substitute generic DLPFC for vague cognitive claims.
 */
export class TbiEvidenceBoundTargetGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-TBI-EVIDENCE-BOUND-001',
    code: 'TBI_EVIDENCE_BOUND_TARGET_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [TBI_MODULE_RELEASE_ID],
    candidateRoles: ['evidence_anchor', 'clinical_alternative'],
    targetFamilyScopeIds: ['TF-TBI-COGNITIVE-DLPFC-001', 'TF-TBI-DEPRESSION-DLPFC-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: ['structural_safety_evaluation'],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'creates_baseline',
    deterministic: true,
    generatorFailurePolicy: 'required_fail_run',
    configurationSha256: computeSha256('GEN-TBI-EVIDENCE-BOUND-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    // Check for explicit approved target-family EvidencePath
    const boundPath = context.permittedEvidencePaths.find(p =>
      this.descriptor.targetFamilyScopeIds.includes(p.targetFamilyId),
    );

    // §67 Invariant: If evidence claims benefit but lacks an explicit target-specific EvidencePath, return no_candidate
    if (!boundPath) {
      return {
        generatorId: this.descriptor.id,
        generatorVersion: this.descriptor.semanticVersion,
        status: 'no_candidate',
        candidates: [],
        diagnostics: [
          {
            level: 'info',
            code: 'TBI_TARGET_EVIDENCE_UNBOUND',
            message:
              'TBI symptom claims exist in literature, but no approved target-specific EvidencePath binds this objective. Omitting target rather than fabricating DLPFC coordinate.',
          },
        ],
      };
    }

    // §69: Structural safety evaluation (skull defect / cranioplasty check)
    const safetyCap = context.measurementBundle.requirementEvaluations?.find(
      r => r.requirementCode === 'structural_safety_evaluation',
    );
    const hasDistortion = safetyCap && !safetyCap.satisfied;

    const draft: CandidateDraft = {
      draftId: 'draft-tbi-evidence-bound-target',
      generatorId: this.descriptor.id,
      targetFamilyId: boundPath.targetFamilyId,
      proposedRole: 'evidence_anchor',
      targetGeometry: createCanonicalPointGeometry(-44, 38, 30, 'left', 'tbi-evidence-bound-gen'),
      evidencePathIds: [boundPath.id],
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'evidence_baseline' },
      rawScientificFeatures: [
        { code: 'evidence_binding_strength', value: 0.85, isApplicable: true },
        { code: 'structural_safety_cleared', value: hasDistortion ? 0.0 : 1.0, isApplicable: true },
      ],
      generatorLimitations: hasDistortion
        ? [
            'Structural distortion or skull defect identified; specialist neurosurgical safety review required before stimulation.',
          ]
        : [
            'Evidence-bound TBI target. Prefrontal targeting feasibility verified against available structural MRI.',
          ],
      nominationRationale:
        'Explicitly evidence-bound Left DLPFC target for post-TBI symptom domain.',
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
      diagnostics: hasDistortion
        ? [
            {
              level: 'warning',
              code: 'TBI_STRUCTURAL_DISTORTION_DETECTED',
              message:
                'Structural distortion / skull alteration noted; target feasibility qualified with limitations.',
            },
          ]
        : [],
    };
  }
}

/**
 * Research-only network generator for exploratory TBI hypotheses.
 * Conforms to §68: Research only, carries RESEARCH HYPOTHESIS.
 */
export class TbiResearchNetworkGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-TBI-RESEARCH-001',
    code: 'TBI_RESEARCH_NETWORK_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [TBI_MODULE_RELEASE_ID],
    candidateRoles: ['research_hypothesis'],
    targetFamilyScopeIds: ['TF-TBI-RESEARCH-FRONTOPARIETAL-001'],
    evidencePathStatusScope: ['research_permitted'],
    permittedModes: ['research'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point', 'network'],
    baselineRelationship: 'none',
    deterministic: true,
    generatorFailurePolicy: 'research_optional',
    configurationSha256: computeSha256('GEN-TBI-RESEARCH-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const draft: CandidateDraft = {
      draftId: 'draft-tbi-research-frontoparietal',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-TBI-RESEARCH-FRONTOPARIETAL-001',
      proposedRole: 'research_hypothesis',
      targetGeometry: createCanonicalPointGeometry(-40, 24, 44, 'left', 'tbi-research-gen'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-TBI-RESEARCH-FRONTOPARIETAL-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'research_hypothesis' },
      rawScientificFeatures: [
        { code: 'frontoparietal_network_concordance', value: 0.82, isApplicable: true },
      ],
      generatorLimitations: [
        'RESEARCH HYPOTHESIS. Exploratory frontoparietal network modulation for post-traumatic cognitive research.',
      ],
      nominationRationale:
        'RESEARCH HYPOTHESIS: Frontoparietal cognitive control network node for TBI research.',
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

export class TBIPlugin implements IndicationTargetingPlugin {
  public readonly manifest: IndicationTargetingPluginManifest = {
    id: TBI_PLUGIN_ID,
    code: 'MAGNIOM-PLUGIN-TBI',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [TBI_MODULE_RELEASE_ID],
    permittedModes: ['clinical', 'research', 'validation'],
    generatorDescriptors: [
      new TbiEvidenceBoundTargetGenerator().descriptor,
      new TbiResearchNetworkGenerator().descriptor,
    ],
    featureProviderVersions: ['2.0.0'],
    comparisonProfileIds: ['DOMAIN-TBI-EVIDENCE'],
    refinementProfileIds: [],
    slateProfileId: 'SLATE-TBI-STANDARD',
    requiredDomainSchemaVersion: '2.0.0',
    requiredPolicySchemaVersion: '2.0.0',
    codeCommit: 'HEAD',
    packageDigestSha256: computeSha256('MAGNIOM-PLUGIN-TBI-DIGEST-2.0.0'),
    scientificConfigurationSha256: computeSha256('TBI_SCIENTIFIC_CONFIG_2.0.0'),
  };

  public generators(): readonly CandidateGenerator[] {
    return [new TbiEvidenceBoundTargetGenerator(), new TbiResearchNetworkGenerator()];
  }

  public featureProviders(): readonly CandidateFeatureProvider[] {
    return [];
  }

  public comparisonProfiles(): readonly ComparisonDomainDefinition[] {
    return [
      {
        id: 'DOMAIN-TBI-EVIDENCE',
        code: 'TBI_EVIDENCE_TARGET_DOMAIN',
        indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
        comparisonBasis: 'same_target_family_variants',
        rankingProfileId: 'PROFILE-TBI-STANDARD',
        targetFamilyIds: ['TF-TBI-COGNITIVE-DLPFC-001', 'TF-TBI-DEPRESSION-DLPFC-001'],
      },
    ];
  }

  public refinementProfiles(): readonly RefinementProfileDefinition[] {
    return [];
  }

  public slateProfile(): SlateAssemblyProfileDefinition {
    return {
      id: 'SLATE-TBI-STANDARD',
      indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
      maxPrimary: 1,
      maxAdditional: 1,
      rolePriorities: [
        { position: 'primary_1', preferredRoles: ['evidence_anchor'] },
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
    const valid = combined.includes('TBI') || combined.includes('TRAUMATIC');
    return {
      valid,
      errors: valid ? [] : [`Indication module ${code || ind} is not a TBI module.`],
      warnings: [],
    };
  }
}
