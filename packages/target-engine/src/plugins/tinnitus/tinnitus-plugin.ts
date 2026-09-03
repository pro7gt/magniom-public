/**
 * @magniom/target-engine - Reference Chronic Tinnitus Indication Targeting Plugin v2
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§73-75)
 * and Section 22 (Phase 2A TinnitusPlugin)
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

export const TINNITUS_PLUGIN_ID = '88888888-8888-4888-8888-888888888888';
export const TINNITUS_MODULE_RELEASE_ID = '88888888-8888-4888-8888-888888888889';

const TINNITUS_EVIDENCE_CONFLICT_NOTICE =
  'INTERNATIONAL CLINICAL GUIDELINE NOTICE: Major clinical practice guidelines (including AAO-HNSF) recommend against routine clinical rTMS for persistent bothersome tinnitus due to conflicting randomized trial outcomes and lack of proven long-term durability. Output is strictly for investigational research.';

/**
 * Research generator for primary/secondary auditory cortex (Heschel's gyrus).
 * Conforms to §73, 75.
 */
export class TinnitusTemporalAuditoryResearchGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-TINNITUS-AUDITORY-001',
    code: 'TINNITUS_TEMPORAL_AUDITORY_RESEARCH_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [TINNITUS_MODULE_RELEASE_ID],
    candidateRoles: ['research_hypothesis'],
    targetFamilyScopeIds: ['TF-TINNITUS-AUDITORY-001'],
    evidencePathStatusScope: ['research_permitted'],
    permittedModes: ['research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: ['audiology_assessment'],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'none',
    deterministic: true,
    generatorFailurePolicy: 'research_optional',
    configurationSha256: computeSha256('GEN-TINNITUS-AUDITORY-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    // Left auditory cortex (most commonly evaluated in literature)
    const draft: CandidateDraft = {
      draftId: 'draft-tinnitus-left-auditory-cortex',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-TINNITUS-AUDITORY-001',
      proposedRole: 'research_hypothesis',
      targetGeometry: createCanonicalPointGeometry(-60, -20, 8, 'left', 'tinnitus-auditory-gen'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-TINNITUS-AUDITORY-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'research_hypothesis' },
      rawScientificFeatures: [
        { code: 'tonotopic_frequency_alignment', value: 0.72, isApplicable: true },
      ],
      generatorLimitations: [TINNITUS_EVIDENCE_CONFLICT_NOTICE],
      nominationRationale:
        'Investigational primary auditory cortex candidate for tinnitus hyperactivity suppression research.',
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
      diagnostics: [
        {
          level: 'warning',
          code: 'TINNITUS_EVIDENCE_CONFLICT',
          message:
            'Clinical trials demonstrate conflicting efficacy; routine clinical guidance advises against TMS for tinnitus.',
        },
      ],
    };
  }
}

/**
 * Temporoparietal junction (TPJ) research generator for tinnitus.
 */
export class TinnitusTemporoparietalResearchGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-TINNITUS-TPJ-001',
    code: 'TINNITUS_TEMPOROPARIETAL_RESEARCH_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [TINNITUS_MODULE_RELEASE_ID],
    candidateRoles: ['research_hypothesis'],
    targetFamilyScopeIds: ['TF-TINNITUS-TPJ-001'],
    evidencePathStatusScope: ['research_permitted'],
    permittedModes: ['research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'none',
    deterministic: true,
    generatorFailurePolicy: 'research_optional',
    configurationSha256: computeSha256('GEN-TINNITUS-TPJ-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const draft: CandidateDraft = {
      draftId: 'draft-tinnitus-left-tpj',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-TINNITUS-TPJ-001',
      proposedRole: 'research_hypothesis',
      targetGeometry: createCanonicalPointGeometry(-54, -42, 22, 'left', 'tinnitus-tpj-gen'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-TINNITUS-TPJ-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'research_hypothesis' },
      rawScientificFeatures: [
        { code: 'attentional_switching_concordance', value: 0.69, isApplicable: true },
      ],
      generatorLimitations: [TINNITUS_EVIDENCE_CONFLICT_NOTICE],
      nominationRationale:
        'Left temporoparietal junction candidate for tinnitus attentional salience research.',
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
      diagnostics: [
        {
          level: 'warning',
          code: 'TINNITUS_EVIDENCE_CONFLICT',
          message:
            'Clinical trials demonstrate conflicting efficacy; routine clinical guidance advises against TMS for tinnitus.',
        },
      ],
    };
  }
}

/**
 * Auditory-limbic distress network research generator.
 */
export class TinnitusNetworkResearchGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-TINNITUS-NETWORK-001',
    code: 'TINNITUS_NETWORK_RESEARCH_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [TINNITUS_MODULE_RELEASE_ID],
    candidateRoles: ['research_hypothesis'],
    targetFamilyScopeIds: ['TF-TINNITUS-AUDITORY-LIMBIC-001'],
    evidencePathStatusScope: ['research_permitted'],
    permittedModes: ['research'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'none',
    deterministic: true,
    generatorFailurePolicy: 'research_optional',
    configurationSha256: computeSha256('GEN-TINNITUS-NETWORK-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const draft: CandidateDraft = {
      draftId: 'draft-tinnitus-dorsolateral-distress',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-TINNITUS-AUDITORY-LIMBIC-001',
      proposedRole: 'research_hypothesis',
      targetGeometry: createCanonicalPointGeometry(-42, 36, 32, 'left', 'tinnitus-network-gen'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-TINNITUS-AUDITORY-LIMBIC-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'research_hypothesis' },
      rawScientificFeatures: [
        { code: 'distress_network_coupling', value: 0.77, isApplicable: true },
      ],
      generatorLimitations: [TINNITUS_EVIDENCE_CONFLICT_NOTICE],
      nominationRationale:
        'Prefrontal node of auditory-limbic distress network for tinnitus distress research.',
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
      diagnostics: [
        {
          level: 'warning',
          code: 'TINNITUS_EVIDENCE_CONFLICT',
          message:
            'Clinical trials demonstrate conflicting efficacy; routine clinical guidance advises against TMS for tinnitus.',
        },
      ],
    };
  }
}

/**
 * Conforms to §73-75: Research mode only; hard clinical gate blocks Clinical mode execution.
 */
export class TinnitusPlugin implements IndicationTargetingPlugin {
  public readonly manifest: IndicationTargetingPluginManifest = {
    id: TINNITUS_PLUGIN_ID,
    code: 'MAGNIOM-PLUGIN-TINNITUS',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [TINNITUS_MODULE_RELEASE_ID],
    // §73-74: Strictly research and validation only; clinical is FORBIDDEN
    permittedModes: ['research', 'validation'],
    generatorDescriptors: [
      new TinnitusTemporalAuditoryResearchGenerator().descriptor,
      new TinnitusTemporoparietalResearchGenerator().descriptor,
      new TinnitusNetworkResearchGenerator().descriptor,
    ],
    featureProviderVersions: ['2.0.0'],
    comparisonProfileIds: ['DOMAIN-TINNITUS-RESEARCH'],
    refinementProfileIds: [],
    slateProfileId: 'SLATE-TINNITUS-STANDARD',
    requiredDomainSchemaVersion: '2.0.0',
    requiredPolicySchemaVersion: '2.0.0',
    codeCommit: 'HEAD',
    packageDigestSha256: computeSha256('MAGNIOM-PLUGIN-TINNITUS-DIGEST-2.0.0'),
    scientificConfigurationSha256: computeSha256('TINNITUS_SCIENTIFIC_CONFIG_2.0.0'),
  };

  public generators(): readonly CandidateGenerator[] {
    return [
      new TinnitusTemporalAuditoryResearchGenerator(),
      new TinnitusTemporoparietalResearchGenerator(),
      new TinnitusNetworkResearchGenerator(),
    ];
  }

  public featureProviders(): readonly CandidateFeatureProvider[] {
    return [];
  }

  public comparisonProfiles(): readonly ComparisonDomainDefinition[] {
    return [
      {
        id: 'DOMAIN-TINNITUS-RESEARCH',
        code: 'TINNITUS_RESEARCH_DOMAIN',
        indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
        comparisonBasis: 'same_target_family_variants',
        rankingProfileId: 'PROFILE-TINNITUS-STANDARD',
        targetFamilyIds: ['TF-TINNITUS-AUDITORY-001', 'TF-TINNITUS-TPJ-001'],
      },
    ];
  }

  public refinementProfiles(): readonly RefinementProfileDefinition[] {
    return [];
  }

  public slateProfile(): SlateAssemblyProfileDefinition {
    return {
      id: 'SLATE-TINNITUS-STANDARD',
      indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
      maxPrimary: 1,
      maxAdditional: 2,
      rolePriorities: [
        { position: 'primary_1', preferredRoles: ['research_hypothesis'] },
        { position: 'additional_a', preferredRoles: ['research_hypothesis'] },
      ],
      objectiveCoverageRules: [],
      diversityRules: [],
      mandatoryBaselineVisibility: true,
      allowZeroCandidateAbstention: true,
      scientificPolicyReleaseId: 'default',
    };
  }

  /**
   * Conforms to §74: Hard Clinical Gate.
   * A Clinical Mode request SHALL fail.
   */
  public validateModuleContext(context: ResolvedTargetEngineContextV2): ModuleContextValidation {
    const code = context.indicationModule?.code ?? '';
    const title = context.indicationModule?.title ?? '';
    const ind =
      context.indicationModule?.indication?.code ??
      context.indicationModule?.indication?.label ??
      '';
    const combined = `${code} ${title} ${ind}`.toUpperCase();
    const isTinnitus = combined.includes('TINNITUS');

    if (!isTinnitus) {
      return {
        valid: false,
        errors: [`Indication module ${code || ind} is not a Tinnitus module.`],
        warnings: [],
      };
    }

    // §74: Hard Clinical Gate
    if (context.request.mode === 'clinical') {
      return {
        valid: false,
        errors: [
          'CLINICAL_GATE_VIOLATION: Tinnitus targeting is strictly restricted to Research Mode. Clinical Mode execution is prohibited by scientific policy (§74).',
        ],
        warnings: [],
      };
    }

    return {
      valid: true,
      errors: [],
      warnings: [
        'Tinnitus module operates in exploratory Research Mode under active guideline conflict.',
      ],
    };
  }
}
