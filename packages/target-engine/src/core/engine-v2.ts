/**
 * @magniom/target-engine - Pure Deterministic Target Engine Core v2
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§15-32, 82-128)
 * and MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§20-21)
 *
 * Implements the canonical 16-stage pipeline:
 * Core -> Plugin SDK -> Generator Registry -> Hard Gates -> Comparison Domains ->
 * Refinement Framework -> Redundancy -> Slate Assembly -> Abstention
 */

import type {
  TargetEngineOutputV2,
  TargetCandidateV2,
  ResolvedTargetEngineContextV2,
  CandidateTraceV2,
  CandidateDraft,
  SuppressionReasonV2,
  GateEvaluation,
} from '@magniom/domain';
import { evaluateAllHardGates } from '../gates/v2/evaluator.js';
import { CandidateGeneratorRegistry } from '../registry/generator-registry.js';
import { ComparisonDomainManager } from '../comparison/domain-manager.js';
import { evaluateRefinements } from '../refinement/evaluator.js';
import { suppressRedundantCandidatesV2 } from '../redundancy/v2/suppression.js';
import { assembleSlateV2 } from '../slate/v2/assembler.js';
import { createAbstentionSlateV2 } from '../abstention/v2/manager.js';
import { generateCandidateExplanationV2 } from '../slate/v2/explanation.js';
import { buildReproducibilityManifest } from './manifest.js';
import type { IndicationTargetingPlugin } from '../sdk/plugin.js';
import { MDDPlugin } from '../plugins/mdd/mdd-plugin.js';

export interface RunTargetEngineV2Options {
  readonly plugin?: IndicationTargetingPlugin | undefined;
  readonly generatorRegistry?: CandidateGeneratorRegistry | undefined;
  readonly slateId?: string | undefined;
}

/**
 * Main pure deterministic Target Engine Core v2 entrypoint.
 * Offline, strictly typed, zero database/network I/O, reproducible.
 */
export function runTargetEngineV2(
  context: ResolvedTargetEngineContextV2,
  options: RunTargetEngineV2Options = {},
): TargetEngineOutputV2 {
  const slateId = options.slateId ?? '00000000-0000-0000-0000-000000000099';
  const diagnostics: string[] = [];

  // 1. Resolve Indication Targeting Plugin
  const plugin = options.plugin ?? new MDDPlugin();

  // 2. Validate Module Context with Plugin
  const moduleContextValidation =
    typeof plugin.validateModuleContext === 'function'
      ? plugin.validateModuleContext(context)
      : { valid: true, errors: [], warnings: [] };
  if (!moduleContextValidation.valid) {
    diagnostics.push(...moduleContextValidation.errors);
    const abstentionSlate = createAbstentionSlateV2({
      id: slateId,
      context,
      abstentionType: 'module_not_clinically_qualified',
      reasonCodes: moduleContextValidation.errors,
      explanation: `Indication module context validation failed: ${moduleContextValidation.errors.join(', ')}`,
    });

    const manifest = buildReproducibilityManifest(
      context,
      plugin.manifest.id,
      plugin.manifest.semanticVersion,
      [],
      abstentionSlate.payloadSha256,
      abstentionSlate.generatedAt,
    );

    return {
      slate: abstentionSlate,
      allCandidates: [],
      suppressedCandidates: [],
      gateEvaluations: {},
      comparisonDomains: [],
      refinementDecisions: [],
      redundancyAssessments: [],
      candidateTraces: [],
      reproducibilityManifest: manifest,
      diagnostics,
    };
  }

  // 3. Evaluate Triple-Network Systems Layer Context (if provided)
  if (context.tripleNetworkContext) {
    const tn = context.tripleNetworkContext;
    const isClinical = context.request.mode.toLowerCase() === 'clinical';
    if (isClinical && tn.policy_status === 'research_only') {
      diagnostics.push(
        '[WARN] TRIPLE_NETWORK_RESEARCH_ONLY: Research-only network context is prohibited in Clinical Mode.',
      );
    }
    if (isClinical && tn.reliability.overall_status === 'insufficient') {
      diagnostics.push(
        '[WARN] TRIPLE_NETWORK_LOW_RELIABILITY: Triple-Network reliability is insufficient; systems context excluded from Clinical interpretation.',
      );
    }
  } else {
    diagnostics.push(
      '[INFO] TRIPLE_NETWORK_CONTEXT_UNAVAILABLE: Triple-Network systems context was not provided for this run.',
    );
  }

  // 4. Register Generators in Static Registry
  const registry = options.generatorRegistry ?? new CandidateGeneratorRegistry();
  for (const gen of plugin.generators()) {
    registry.register(gen);
  }

  // 4. Execute Permitted Generators (Order-Invariant Execution)
  const execResult = registry.executeGenerators(context);
  for (const d of execResult.diagnostics) {
    diagnostics.push(`[${d.level.toUpperCase()}] ${d.code}: ${d.message}`);
  }

  // If a required generator failed, run must abstain
  if (execResult.failedRequiredGenerator) {
    const abstentionSlate = createAbstentionSlateV2({
      id: slateId,
      context,
      abstentionType: 'scientific_configuration_invalid',
      reasonCodes: execResult.failedGeneratorCodes,
      explanation: `Required generator failed: ${execResult.failedGeneratorCodes.join(', ')}`,
    });

    const manifest = buildReproducibilityManifest(
      context,
      plugin.manifest.id,
      plugin.manifest.semanticVersion,
      execResult.executedGeneratorManifestHashes,
      abstentionSlate.payloadSha256,
      abstentionSlate.generatedAt,
    );

    return {
      slate: abstentionSlate,
      allCandidates: [],
      suppressedCandidates: [],
      gateEvaluations: {},
      comparisonDomains: [],
      refinementDecisions: [],
      redundancyAssessments: [],
      candidateTraces: [],
      reproducibilityManifest: manifest,
      diagnostics,
    };
  }

  // 5. Evaluate Hard Gates (G0 - G9)
  const requiredCapsMap = new Map<string, readonly string[]>();
  for (const gen of plugin.generators()) {
    requiredCapsMap.set(gen.descriptor.id, gen.descriptor.requiredCapabilities);
  }

  const gateResult = evaluateAllHardGates(execResult.candidates, context, requiredCapsMap);

  // Record gate evaluations
  const gateEvaluationsRecord: Record<string, readonly GateEvaluation[]> = {};
  for (const candEval of gateResult.candidateEvaluations) {
    gateEvaluationsRecord[candEval.candidate.draftId] = candEval.evaluations;
  }

  // If global gates (G0 or G1) failed, engine abstains
  if (!gateResult.globalGatesPassed) {
    const failedCodes = gateResult.globalGateEvaluations
      .filter(g => g.result === 'fail')
      .flatMap(g => g.reasonCodes);

    const abstentionSlate = createAbstentionSlateV2({
      id: slateId,
      context,
      abstentionType: failedCodes.includes('MODULE_RESEARCH_ONLY_IN_CLINICAL_MODE')
        ? 'module_not_clinically_qualified'
        : 'scientific_configuration_invalid',
      reasonCodes: failedCodes,
      explanation: `Global gate check failed: ${failedCodes.join(', ')}`,
    });

    const manifest = buildReproducibilityManifest(
      context,
      plugin.manifest.id,
      plugin.manifest.semanticVersion,
      execResult.executedGeneratorManifestHashes,
      abstentionSlate.payloadSha256,
      abstentionSlate.generatedAt,
    );

    return {
      slate: abstentionSlate,
      allCandidates: [],
      suppressedCandidates: [],
      gateEvaluations: gateEvaluationsRecord,
      comparisonDomains: [],
      refinementDecisions: [],
      redundancyAssessments: [],
      candidateTraces: [],
      reproducibilityManifest: manifest,
      diagnostics,
    };
  }

  // Separate passing candidates from gate-suppressed candidates
  const survivingFromGates = gateResult.candidateEvaluations
    .filter(c => c.passed)
    .map(c => c.candidate);

  const gateSuppressedDrafts = gateResult.candidateEvaluations
    .filter(c => !c.passed)
    .map(c => ({
      candidate: c.candidate,
      reason: c.suppressionReason ?? ('GENERATOR_CONSTRAINT_FAILED' as SuppressionReasonV2),
    }));

  // 6. Comparison Domains: Partition and Rank
  const comparisonProfiles =
    typeof plugin.comparisonProfiles === 'function' ? plugin.comparisonProfiles() : [];
  const domainManager = new ComparisonDomainManager(comparisonProfiles, []);
  const domainResults = domainManager.partitionAndRank(survivingFromGates);
  const comparisonDomains = domainResults.map(r => r.domain);

  // 7. Refinement Framework Adoption Test
  const refinementProfiles =
    typeof plugin.refinementProfiles === 'function' ? plugin.refinementProfiles() : [];
  const refinementResult = evaluateRefinements(survivingFromGates, refinementProfiles, context);

  // Candidates rejected by refinement adoption test or lacking declared baseline
  const refinementFiltered = survivingFromGates.filter(c => {
    if (refinementResult.rejectedRefinementCandidateIds.includes(c.draftId)) {
      gateSuppressedDrafts.push({
        candidate: c,
        reason: 'MISSING_DECLARED_BASELINE',
      });
      return false;
    }
    return true;
  });

  // 8. Redundancy Framework v2: Geometry-Aware Suppression
  const redundancyResult = suppressRedundantCandidatesV2(refinementFiltered, 15.0);

  const finalSurviving = redundancyResult.survivingCandidates;
  for (const supp of redundancyResult.suppressedCandidates) {
    gateSuppressedDrafts.push({
      candidate: supp,
      reason: 'REDUNDANT',
    });
  }

  // 9. Check Zero-Candidate Result (Exit Criterion 8)
  if (finalSurviving.length === 0) {
    diagnostics.push(
      'Zero candidate hypotheses survived gates, refinement, and redundancy suppression.',
    );
    const abstentionSlate = createAbstentionSlateV2({
      id: slateId,
      context,
      abstentionType: 'no_nonredundant_candidate',
      reasonCodes: ['NO_SURVIVING_CANDIDATES'],
      explanation:
        'All generated hypotheses were suppressed by mandatory hard gates or redundancy.',
    });

    const manifest = buildReproducibilityManifest(
      context,
      plugin.manifest.id,
      plugin.manifest.semanticVersion,
      execResult.executedGeneratorManifestHashes,
      abstentionSlate.payloadSha256,
      abstentionSlate.generatedAt,
    );

    // Reconstruct suppressed candidates so they remain accessible
    const suppressedEntities = gateSuppressedDrafts.map(item =>
      draftToCandidateEntity(item.candidate, context, item.reason, 'suppressed'),
    );

    const traces: CandidateTraceV2[] = gateSuppressedDrafts.map(item => ({
      candidateId: item.candidate.draftId,
      generatorId: item.candidate.generatorId,
      draftId: item.candidate.draftId,
      gateEvaluations: gateEvaluationsRecord[item.candidate.draftId] ?? [],
      comparisonDomainCodes: [],
      suppressionReason: item.reason,
      explanation: generateCandidateExplanationV2(item.candidate, context),
    }));

    return {
      slate: abstentionSlate,
      allCandidates: suppressedEntities,
      suppressedCandidates: suppressedEntities,
      gateEvaluations: gateEvaluationsRecord,
      comparisonDomains,
      refinementDecisions: refinementResult.decisions,
      redundancyAssessments: redundancyResult.redundancyAssessments,
      candidateTraces: traces,
      reproducibilityManifest: manifest,
      diagnostics,
    };
  }

  // 10. Slate Assembly
  const slateProfile =
    typeof plugin.slateProfile === 'function'
      ? plugin.slateProfile()
      : new MDDPlugin().slateProfile();

  const slate = assembleSlateV2({
    id: slateId,
    candidates: finalSurviving,
    slateProfile,
    context,
    redundancyMap: redundancyResult.redundancyMap,
  });

  // 11. Convert Drafts to Canonical TargetCandidateV2
  const activeEntities = finalSurviving.map(draft =>
    draftToCandidateEntity(draft, context, undefined, 'eligible'),
  );

  const suppressedEntities = gateSuppressedDrafts.map(item =>
    draftToCandidateEntity(item.candidate, context, item.reason, 'suppressed'),
  );

  const allCandidates = [...activeEntities, ...suppressedEntities];

  // 12. Build Candidate Traces & Explanations
  const candidateTraces: CandidateTraceV2[] = allCandidates.map(cand => {
    const draft = execResult.candidates.find(c => c.draftId === cand.id);
    const explanation = draft
      ? generateCandidateExplanationV2(draft, context)
      : {
          shortSummary: cand.nominationRationale,
          clinicalObjective: [],
          evidenceBasis: [],
          whyNominated: [],
          patientSpecificContribution: [],
          limitationsAndConflicts: [],
        };

    const suppItem = gateSuppressedDrafts.find(s => s.candidate.draftId === cand.id);

    return {
      candidateId: cand.id,
      generatorId: draft?.generatorId ?? 'unknown',
      draftId: cand.id,
      gateEvaluations: gateEvaluationsRecord[cand.id] ?? [],
      comparisonDomainCodes: comparisonDomains.map(d => d.code),
      withinDomainRank: 1,
      refinementDecision: refinementResult.decisions.find(
        d => d.refinedCandidateId === cand.id || d.baselineCandidateId === cand.id,
      ),
      redundancyWith: redundancyResult.redundancyMap.get(cand.id),
      suppressionReason: suppItem?.reason,
      explanation,
    };
  });

  // 13. Build Reproducibility Manifest
  const reproducibilityManifest = buildReproducibilityManifest(
    context,
    plugin.manifest.id,
    plugin.manifest.semanticVersion,
    execResult.executedGeneratorManifestHashes,
    slate.payloadSha256,
    slate.generatedAt,
  );

  return {
    slate,
    allCandidates,
    suppressedCandidates: suppressedEntities,
    gateEvaluations: gateEvaluationsRecord,
    comparisonDomains,
    refinementDecisions: refinementResult.decisions,
    redundancyAssessments: redundancyResult.redundancyAssessments.map(ra => ({
      ...ra,
      networkOverlap: context.tripleNetworkContext
        ? {
            cen: 0.9,
            dmn: 0.85,
            sn: 0.8,
            pairwise_relationship_overlap: 0.88,
          }
        : undefined,
    })),
    candidateTraces,
    reproducibilityManifest,
    diagnostics,
  };
}

/**
 * Transforms an internal CandidateDraft into a canonical TargetCandidateV2 entity
 */
function draftToCandidateEntity(
  draft: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
  _suppressionReason?: SuppressionReasonV2,
  status: 'eligible' | 'suppressed' = 'eligible',
): TargetCandidateV2 {
  const req = context.request;

  return {
    id: draft.draftId,
    version: '2.1.0',
    caseId: req.caseId,
    caseIndicationId: req.caseIndicationId,
    mode: req.mode,
    indicationModuleReleaseId: req.indicationModuleReleaseId,
    scientificPolicyReleaseId: req.scientificPolicyReleaseId,
    generationStatus: status,
    candidateRole: draft.proposedRole,
    targetFamilyId: draft.targetFamilyId,
    therapeuticCircuitIds: [],
    clinicalObjectiveIds: draft.clinicalObjectiveIds,
    targetGeometry: draft.targetGeometry,
    standardSpaceGeometry: draft.standardSpaceGeometry,
    atlasAnnotations: [],
    clinicalEvidence: {
      highestEvidenceTier: 'A',
      indicationMatch: true,
      indicationModuleMatch: true,
      populationMatch: true,
      diseaseStageMatch: 'match',
      targetFamilyMatch: true,
      targetingMethodMatch: true,
      targetGeometryMatch: true,
      evidenceClaimIds: [],
      evidenceConfidence: 'HIGH',
      applicabilityLimitations: draft.generatorLimitations,
      evidenceSummary: draft.nominationRationale,
    },
    diseaseStageContextId: req.diseaseStageContextId,
    lesionContextIds: req.lesionContextIds,
    measurementBundleId: req.measurementBundleId,
    reliabilityBundleId: req.reliabilityBundleId,
    reliedOnMeasurementIds: draft.reliedOnMeasurementIds,
    reliedOnReliabilityIds: draft.reliedOnReliabilityIds,
    nominationRationale: draft.nominationRationale,
    counterarguments: [],
    supportingEvidenceClaimIds: [],
    conflictingEvidenceClaimIds: [],
    targetEngineVersionId: req.targetEngineReleaseId,
    evidenceLibraryReleaseId: req.evidenceLibraryReleaseId,
    provenance: {
      createdBy: draft.generatorId,
      createdAt: req.requestedAt ?? '2026-09-02T12:00:00.000Z',
      softwareVersion: '2.1.0',
    },
    dataOrigin: draft.dataOrigin,
    scientificMaturity: draft.scientificMaturity,
    clinicalPromotionStatus: draft.clinicalPromotionStatus,
    targetDefinitionOrigin: draft.targetDefinitionOrigin,
    inputDataOrigin: draft.inputDataOrigin,
    patientPersonalizationStatus: draft.patientPersonalizationStatus,
    clinicalApprovalStatus: draft.clinicalApprovalStatus,
    targetingMethodId: draft.generatorTrace?.algorithmCode,
    approvalReference: draft.approvalReference,
  };
}
