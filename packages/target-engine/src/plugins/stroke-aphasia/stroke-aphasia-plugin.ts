/**
 * @magniom/target-engine - Reference Post-Stroke Aphasia Indication Targeting Plugin v2
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§62-65)
 * and Section 22 (Phase 2A StrokeAphasiaPlugin)
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

export const STROKE_APHASIA_PLUGIN_ID = '55555555-5555-4555-8555-555555555555';
export const STROKE_APHASIA_MODULE_RELEASE_ID = '55555555-5555-4555-8555-555555555556';

/**
 * Right IFG (pars triangularis) candidate generator for chronic non-fluent aphasia.
 * Conforms to §63-64: Restricts to chronic non-fluent, checks speech therapy treatment context.
 */
export class AphasiaRightIfgGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-APHASIA-RIGHT-IFG-001',
    code: 'APHASIA_RIGHT_IFG_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [STROKE_APHASIA_MODULE_RELEASE_ID],
    candidateRoles: ['evidence_anchor', 'clinical_alternative'],
    targetFamilyScopeIds: ['TF-APHASIA-RIGHT-IFG-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: ['speech_language_therapy_context'],
    permittedGeometryTypes: ['point', 'surface_roi'],
    baselineRelationship: 'creates_baseline',
    deterministic: true,
    generatorFailurePolicy: 'required_fail_run',
    configurationSha256: computeSha256('GEN-APHASIA-RIGHT-IFG-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    // §63: Phenotype and stage check
    const phenotype = context.phenotypeSnapshot as
      { aphasiaSubtype?: string; diseaseStage?: string } | undefined;
    const subtype = phenotype?.aphasiaSubtype?.toLowerCase() ?? 'non_fluent';
    const stage =
      context.diseaseStageContext?.currentStageCode?.toLowerCase() ??
      phenotype?.diseaseStage?.toLowerCase() ??
      'chronic';

    // Must not operate for acute fluent aphasia
    if (subtype.includes('fluent') && stage.includes('acute')) {
      return {
        generatorId: this.descriptor.id,
        generatorVersion: this.descriptor.semanticVersion,
        status: 'abstained',
        candidates: [],
        abstention: {
          reasonCode: 'APHASIA_STAGE_PHENOTYPE_MISMATCH',
          explanation:
            'Right IFG inhibitory evidence applies to chronic non-fluent aphasia; acute fluent aphasia presentation is not indicated.',
        },
        diagnostics: [
          {
            level: 'warning',
            code: 'APHASIA_STAGE_PHENOTYPE_MISMATCH',
            message:
              'Acute fluent aphasia mismatch with chronic non-fluent Right IFG evidence path.',
          },
        ],
      };
    }

    // §64: Treatment context evaluation (Speech-Language Therapy pairing)
    const hasSltPairing =
      context.treatmentContextSnapshot?.requirementEvaluations?.some(
        e =>
          e.treatmentContextRequirementId.toLowerCase().includes('slt') ||
          e.treatmentContextRequirementId.toLowerCase().includes('speech') ||
          (e.interpretation && e.interpretation.toLowerCase().includes('speech')),
      ) ?? false;

    const limitations: string[] = [];
    if (!hasSltPairing) {
      limitations.push(
        'Evidence base requires concurrent or immediately subsequent Speech-Language Therapy (SLT). Unpaired rTMS has substantially weaker evidence.',
      );
    }

    const draft: CandidateDraft = {
      draftId: 'draft-aphasia-right-ifg-pars-triangularis',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-APHASIA-RIGHT-IFG-001',
      proposedRole: 'evidence_anchor',
      targetGeometry: createCanonicalPointGeometry(52, 28, 14, 'right', 'aphasia-right-ifg-gen'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-APHASIA-RIGHT-IFG-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'evidence_baseline' },
      rawScientificFeatures: [
        { code: 'language_circuit_concordance', value: 0.87, isApplicable: true },
        { code: 'slt_context_paired', value: hasSltPairing ? 1.0 : 0.0, isApplicable: true },
      ],
      generatorLimitations: limitations,
      nominationRationale:
        'Right IFG (pars triangularis) inhibitory target paired with speech-language therapy for chronic non-fluent aphasia.',
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
      diagnostics: hasSltPairing
        ? []
        : [
            {
              level: 'warning',
              code: 'SLT_CONTEXT_UNPAIRED',
              message:
                'Adjunctive speech-language therapy context absent; efficacy is clinically downgraded.',
            },
          ],
    };
  }
}

/**
 * Left hemisphere perilesional language generator.
 * Conforms to §65: Evaluates intact residual left-hemisphere language cortex.
 */
export class AphasiaIpsilesionalLanguageGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-APHASIA-LEFT-IPSI-001',
    code: 'APHASIA_IPSILESIONAL_LANGUAGE_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [STROKE_APHASIA_MODULE_RELEASE_ID],
    candidateRoles: ['clinical_alternative'],
    targetFamilyScopeIds: ['TF-APHASIA-LEFT-PERILESIONAL-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: ['language_task_fmri'],
    permittedGeometryTypes: ['point', 'surface_roi'],
    baselineRelationship: 'alternative_to_baseline',
    deterministic: true,
    generatorFailurePolicy: 'omit_generator_with_warning',
    configurationSha256: computeSha256('GEN-APHASIA-LEFT-IPSI-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    // Only generate if evidence path explicitly authorizes ipsilesional stimulation
    const matchingPaths = context.permittedEvidencePaths.filter(
      p => p.targetFamilyId === 'TF-APHASIA-LEFT-PERILESIONAL-001',
    );

    if (matchingPaths.length === 0) {
      return {
        generatorId: this.descriptor.id,
        generatorVersion: this.descriptor.semanticVersion,
        status: 'no_candidate',
        candidates: [],
        diagnostics: [
          {
            level: 'info',
            code: 'IPSILESIONAL_LANGUAGE_EVIDENCE_ABSENT',
            message:
              'No permitted EvidencePath for ipsilesional left-hemisphere language stimulation.',
          },
        ],
      };
    }

    const draft: CandidateDraft = {
      draftId: 'draft-aphasia-left-perilesional-language',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-APHASIA-LEFT-PERILESIONAL-001',
      proposedRole: 'clinical_alternative',
      targetGeometry: createCanonicalPointGeometry(
        -50,
        18,
        22,
        'left',
        'aphasia-left-perilesional-gen',
      ),
      evidencePathIds: matchingPaths.map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'clinical_alternative' },
      rawScientificFeatures: [
        { code: 'residual_language_cortex_sparing', value: 0.68, isApplicable: true },
      ],
      generatorLimitations: [
        'Requires verified residual Broca territory tissue integrity. Higher risk of ineffective stimulation if lesion encroaches.',
      ],
      nominationRationale: 'Left hemisphere perilesional facilitatory language target.',
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
 * Bilateral language network research generator.
 */
export class AphasiaBilateralResearchGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-APHASIA-BILATERAL-RESEARCH-001',
    code: 'APHASIA_BILATERAL_RESEARCH_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [STROKE_APHASIA_MODULE_RELEASE_ID],
    candidateRoles: ['research_hypothesis'],
    targetFamilyScopeIds: ['TF-APHASIA-RESEARCH-NETWORK-001'],
    evidencePathStatusScope: ['research_permitted'],
    permittedModes: ['research'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'none',
    deterministic: true,
    generatorFailurePolicy: 'research_optional',
    configurationSha256: computeSha256('GEN-APHASIA-BILATERAL-RESEARCH-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const draft: CandidateDraft = {
      draftId: 'draft-aphasia-research-wernicke',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-APHASIA-RESEARCH-NETWORK-001',
      proposedRole: 'research_hypothesis',
      targetGeometry: createCanonicalPointGeometry(-58, -48, 12, 'left', 'aphasia-research-gen'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-APHASIA-RESEARCH-NETWORK-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'research_hypothesis' },
      rawScientificFeatures: [
        { code: 'receptive_network_concordance', value: 0.79, isApplicable: true },
      ],
      generatorLimitations: [
        'Investigational research hypothesis only. Posterior superior temporal language network node.',
      ],
      nominationRationale:
        'Exploratory receptive language network target for comprehension deficit research.',
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

export class StrokeAphasiaPlugin implements IndicationTargetingPlugin {
  public readonly manifest: IndicationTargetingPluginManifest = {
    id: STROKE_APHASIA_PLUGIN_ID,
    code: 'MAGNIOM-PLUGIN-STROKE-APHASIA',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [STROKE_APHASIA_MODULE_RELEASE_ID],
    permittedModes: ['clinical', 'research', 'validation'],
    generatorDescriptors: [
      new AphasiaRightIfgGenerator().descriptor,
      new AphasiaIpsilesionalLanguageGenerator().descriptor,
      new AphasiaBilateralResearchGenerator().descriptor,
    ],
    featureProviderVersions: ['2.0.0'],
    comparisonProfileIds: ['DOMAIN-STROKE-APHASIA'],
    refinementProfileIds: [],
    slateProfileId: 'SLATE-APHASIA-STANDARD',
    requiredDomainSchemaVersion: '2.0.0',
    requiredPolicySchemaVersion: '2.0.0',
    codeCommit: 'HEAD',
    packageDigestSha256: computeSha256('MAGNIOM-PLUGIN-STROKE-APHASIA-DIGEST-2.0.0'),
    scientificConfigurationSha256: computeSha256('STROKE_APHASIA_SCIENTIFIC_CONFIG_2.0.0'),
  };

  public generators(): readonly CandidateGenerator[] {
    return [
      new AphasiaRightIfgGenerator(),
      new AphasiaIpsilesionalLanguageGenerator(),
      new AphasiaBilateralResearchGenerator(),
    ];
  }

  public featureProviders(): readonly CandidateFeatureProvider[] {
    return [];
  }

  public comparisonProfiles(): readonly ComparisonDomainDefinition[] {
    return [
      {
        id: 'DOMAIN-STROKE-APHASIA',
        code: 'STROKE_APHASIA_TARGET_DOMAIN',
        indicationModuleReleaseId: STROKE_APHASIA_MODULE_RELEASE_ID,
        comparisonBasis: 'same_target_family_variants',
        rankingProfileId: 'PROFILE-APHASIA-STANDARD',
        targetFamilyIds: ['TF-APHASIA-RIGHT-IFG-001', 'TF-APHASIA-LEFT-PERILESIONAL-001'],
      },
    ];
  }

  public refinementProfiles(): readonly RefinementProfileDefinition[] {
    return [];
  }

  public slateProfile(): SlateAssemblyProfileDefinition {
    return {
      id: 'SLATE-APHASIA-STANDARD',
      indicationModuleReleaseId: STROKE_APHASIA_MODULE_RELEASE_ID,
      maxPrimary: 2,
      maxAdditional: 1,
      rolePriorities: [
        { position: 'primary_1', preferredRoles: ['evidence_anchor'] },
        { position: 'primary_2', preferredRoles: ['clinical_alternative'] },
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
    const valid = combined.includes('APHASIA');
    return {
      valid,
      errors: valid ? [] : [`Indication module ${code || ind} is not a Stroke Aphasia module.`],
      warnings: [],
    };
  }
}
