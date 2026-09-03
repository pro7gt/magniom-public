/**
 * @magniom/target-engine - Reference PTSD Indication Targeting Plugin v2
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§70-72)
 * and Section 22 (Phase 2A PTSDPlugin)
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

export const PTSD_PLUGIN_ID = '77777777-7777-4777-8777-777777777777';
export const PTSD_MODULE_RELEASE_ID = '77777777-7777-4777-8777-777777777778';

/**
 * Right DLPFC candidate generator for PTSD.
 * Conforms to §71-72: Distinct from MDD DLPFC; preserves population applicability conflict for combat trauma.
 */
export class PtsdRightDlpfcGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-PTSD-RIGHT-DLPFC-001',
    code: 'PTSD_RIGHT_DLPFC_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [PTSD_MODULE_RELEASE_ID],
    candidateRoles: ['evidence_anchor', 'clinical_alternative'],
    targetFamilyScopeIds: ['TF-PTSD-RDLPFC-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'creates_baseline',
    deterministic: true,
    generatorFailurePolicy: 'required_fail_run',
    configurationSha256: computeSha256('GEN-PTSD-RIGHT-DLPFC-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    // §71: Population-specific applicability check (combat trauma conflict)
    const phenotype = context.phenotypeSnapshot as
      { traumaType?: string; veteranStatus?: boolean } | undefined;
    const isCombatTrauma =
      phenotype?.traumaType?.toLowerCase().includes('combat') || phenotype?.veteranStatus === true;

    const limitations: string[] = [];
    if (isCombatTrauma) {
      limitations.push(
        'Combat-related trauma population: evidence applicability is partial due to published sham-controlled trial conflicts. Clinical benefit may be attenuated.',
      );
    }

    const draft: CandidateDraft = {
      draftId: 'draft-ptsd-right-dlpfc-evidence',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-PTSD-RDLPFC-001',
      proposedRole: 'evidence_anchor',
      // §72: Separate coordinate and rationale from MDD (Right DLPFC BA46/9)
      targetGeometry: createCanonicalPointGeometry(44, 38, 28, 'right', 'ptsd-right-dlpfc-gen'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-PTSD-RDLPFC-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'evidence_baseline' },
      rawScientificFeatures: [
        { code: 'hyperarousal_circuit_concordance', value: 0.88, isApplicable: true },
        {
          code: 'population_applicability_score',
          value: isCombatTrauma ? 0.55 : 0.88,
          isApplicable: true,
        },
      ],
      generatorLimitations: limitations,
      nominationRationale:
        'Right DLPFC inhibitory protocol hypothesis for PTSD hyperarousal and intrusive symptom domains.',
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
      diagnostics: isCombatTrauma
        ? [
            {
              level: 'warning',
              code: 'PTSD_POPULATION_CONFLICT',
              message:
                'Combat-related trauma detected: partial evidence applicability preserved without masking by anatomical fit.',
            },
          ]
        : [],
    };
  }
}

/**
 * Left DLPFC alternative generator for PTSD.
 */
export class PtsdLeftDlpfcGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-PTSD-LEFT-DLPFC-001',
    code: 'PTSD_LEFT_DLPFC_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [PTSD_MODULE_RELEASE_ID],
    candidateRoles: ['clinical_alternative'],
    targetFamilyScopeIds: ['TF-PTSD-LDLPFC-001'],
    evidencePathStatusScope: ['clinical_permitted', 'validation_permitted', 'research_permitted'],
    permittedModes: ['clinical', 'research', 'validation'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'alternative_to_baseline',
    deterministic: true,
    generatorFailurePolicy: 'omit_generator_with_warning',
    configurationSha256: computeSha256('GEN-PTSD-LEFT-DLPFC-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const draft: CandidateDraft = {
      draftId: 'draft-ptsd-left-dlpfc-alternative',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-PTSD-LDLPFC-001',
      proposedRole: 'clinical_alternative',
      targetGeometry: createCanonicalPointGeometry(-44, 38, 28, 'left', 'ptsd-left-dlpfc-gen'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-PTSD-LDLPFC-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'clinical_alternative' },
      rawScientificFeatures: [
        { code: 'comorbid_depression_concordance', value: 0.84, isApplicable: true },
      ],
      generatorLimitations: [
        'Left DLPFC targeting in PTSD indicated primarily where depressive comorbidity is prominent.',
      ],
      nominationRationale:
        'Left DLPFC facilitatory alternative for comorbid depressive symptoms in PTSD.',
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
 * Research-only dmPFC fear extinction circuit generator for PTSD.
 */
export class PtsdDmPfcResearchGenerator implements CandidateGenerator {
  public readonly descriptor: CandidateGeneratorDescriptor = {
    id: 'GEN-PTSD-DMPFC-RESEARCH-001',
    code: 'PTSD_DMPFC_RESEARCH_GENERATOR',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [PTSD_MODULE_RELEASE_ID],
    candidateRoles: ['research_hypothesis'],
    targetFamilyScopeIds: ['TF-PTSD-DMPFC-RESEARCH-001'],
    evidencePathStatusScope: ['research_permitted'],
    permittedModes: ['research'],
    requiredCapabilities: [],
    optionalCapabilities: [],
    permittedGeometryTypes: ['point'],
    baselineRelationship: 'none',
    deterministic: true,
    generatorFailurePolicy: 'research_optional',
    configurationSha256: computeSha256('GEN-PTSD-DMPFC-RESEARCH-001-v2.0.0'),
  };

  public generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
    const draft: CandidateDraft = {
      draftId: 'draft-ptsd-dmpfc-extinction',
      generatorId: this.descriptor.id,
      targetFamilyId: 'TF-PTSD-DMPFC-RESEARCH-001',
      proposedRole: 'research_hypothesis',
      targetGeometry: createCanonicalPointGeometry(0, 32, 38, 'bilateral', 'ptsd-dmpfc-gen'),
      evidencePathIds: context.permittedEvidencePaths
        .filter(p => p.targetFamilyId === 'TF-PTSD-DMPFC-RESEARCH-001')
        .map(p => p.id),
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'research_hypothesis' },
      rawScientificFeatures: [
        { code: 'fear_extinction_circuit_concordance', value: 0.89, isApplicable: true },
      ],
      generatorLimitations: [
        'Investigational research hypothesis only. Medial prefrontal fear extinction circuitry node.',
      ],
      nominationRationale:
        'Exploratory dmPFC target for fear-conditioning extinction research in PTSD.',
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

export class PTSDPlugin implements IndicationTargetingPlugin {
  public readonly manifest: IndicationTargetingPluginManifest = {
    id: PTSD_PLUGIN_ID,
    code: 'MAGNIOM-PLUGIN-PTSD',
    semanticVersion: '2.0.0',
    indicationModuleReleaseIds: [PTSD_MODULE_RELEASE_ID],
    permittedModes: ['clinical', 'research', 'validation'],
    generatorDescriptors: [
      new PtsdRightDlpfcGenerator().descriptor,
      new PtsdLeftDlpfcGenerator().descriptor,
      new PtsdDmPfcResearchGenerator().descriptor,
    ],
    featureProviderVersions: ['2.0.0'],
    comparisonProfileIds: ['DOMAIN-PTSD-DLPFC'],
    refinementProfileIds: [],
    slateProfileId: 'SLATE-PTSD-STANDARD',
    requiredDomainSchemaVersion: '2.0.0',
    requiredPolicySchemaVersion: '2.0.0',
    codeCommit: 'HEAD',
    packageDigestSha256: computeSha256('MAGNIOM-PLUGIN-PTSD-DIGEST-2.0.0'),
    scientificConfigurationSha256: computeSha256('PTSD_SCIENTIFIC_CONFIG_2.0.0'),
  };

  public generators(): readonly CandidateGenerator[] {
    return [
      new PtsdRightDlpfcGenerator(),
      new PtsdLeftDlpfcGenerator(),
      new PtsdDmPfcResearchGenerator(),
    ];
  }

  public featureProviders(): readonly CandidateFeatureProvider[] {
    return [];
  }

  public comparisonProfiles(): readonly ComparisonDomainDefinition[] {
    return [
      {
        id: 'DOMAIN-PTSD-DLPFC',
        code: 'PTSD_DLPFC_TARGET_DOMAIN',
        indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
        comparisonBasis: 'same_target_family_variants',
        rankingProfileId: 'PROFILE-PTSD-STANDARD',
        targetFamilyIds: ['TF-PTSD-RDLPFC-001', 'TF-PTSD-LDLPFC-001'],
      },
    ];
  }

  public refinementProfiles(): readonly RefinementProfileDefinition[] {
    return [];
  }

  public slateProfile(): SlateAssemblyProfileDefinition {
    return {
      id: 'SLATE-PTSD-STANDARD',
      indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
      maxPrimary: 2,
      maxAdditional: 1,
      rolePriorities: [
        { position: 'primary_1', preferredRoles: ['evidence_anchor'] },
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
    const valid = combined.includes('PTSD') || combined.includes('TRAUMA');
    return {
      valid,
      errors: valid ? [] : [`Indication module ${code || ind} is not a PTSD module.`],
      warnings: [],
    };
  }
}
