/**
 * @magniom/target-engine - Refinement Framework: Adoption Evaluator
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§90-97)
 * and Section 21 Exit Criterion 6 ("refinement requires declared baseline where applicable")
 */

import type {
  CandidateDraft,
  RefinementProfileDefinition,
  RefinementDecision,
  GateEvaluation,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';
import { buildRefinementDecision, calculateGeometryDifference } from './counterfactual.js';

export interface EvaluatedRefinementsResult {
  readonly decisions: readonly RefinementDecision[];
  readonly rejectedRefinementCandidateIds: readonly string[];
  readonly preferredCandidateIds: readonly string[];
}

export function evaluateRefinements(
  candidates: readonly CandidateDraft[],
  refinementProfiles: readonly RefinementProfileDefinition[],
  context: ResolvedTargetEngineContextV2,
): EvaluatedRefinementsResult {
  const decisions: RefinementDecision[] = [];
  const rejectedRefinements: string[] = [];
  const preferredCandidates: string[] = [];

  const refinedCandidates = candidates.filter(
    c =>
      c.proposedRole === 'connectome_refinement' ||
      c.lineage?.lineageType === 'measurement_refinement',
  );

  for (const refined of refinedCandidates) {
    // Exit Criterion 6: Refinement requires declared baseline
    const baselineId = refined.lineage?.baselineCandidateDraftId;
    if (!baselineId) {
      rejectedRefinements.push(refined.draftId);
      continue;
    }

    const baseline = candidates.find(c => c.draftId === baselineId);
    if (!baseline) {
      rejectedRefinements.push(refined.draftId);
      continue;
    }

    // Find profile
    const kind = refined.lineage?.refinementKind ?? 'functional_connectivity';
    const profile = refinementProfiles.find(p => p.refinementKind === kind);
    const maxDisplacementMm =
      profile?.adoptionRules.find(r => r.maxDisplacementMm)?.maxDisplacementMm ?? 20.0;
    const minGain =
      profile?.adoptionRules.find(r => r.minIncrementalValue)?.minIncrementalValue ?? 0.05;

    const conditions: GateEvaluation[] = [];

    // 1. Evidence relationship
    const sameEvidence = refined.evidencePathIds.some(p => baseline.evidencePathIds.includes(p));
    conditions.push({
      gateCode: 'G2_EVIDENCE_PATH',
      applicability: 'applicable',
      result: sameEvidence ? 'pass' : 'fail',
      reasonCodes: sameEvidence ? [] : ['REFINEMENT_EVIDENCE_RELATIONSHIP_MISMATCH'],
      policyRuleIds: ['RULE_REFINEMENT_EVIDENCE'],
      interpretation: sameEvidence
        ? 'Shared evidence path baseline.'
        : 'Refinement evidence path mismatch.',
    });

    // 2. Reliability qualified
    const reliabilityPassed =
      !context.reliabilityBundle ||
      (context.reliabilityBundle.capabilityQualification?.every(
        q => q.status === 'qualified' || q.status === 'qualified_with_limits',
      ) ??
        true) ||
      context.reliabilityBundle.overallQualification === 'qualified' ||
      context.reliabilityBundle.overallQualification === 'qualified_with_limits';

    conditions.push({
      gateCode: 'G5_RELIABILITY',
      applicability: 'applicable',
      result: reliabilityPassed ? 'pass' : 'fail',
      reasonCodes: reliabilityPassed ? [] : ['REFINEMENT_RELIABILITY_NOT_QUALIFIED'],
      policyRuleIds: ['RULE_REFINEMENT_RELIABILITY'],
      interpretation: reliabilityPassed
        ? 'Refinement measurement reliable.'
        : 'Refinement reliability unqualified.',
    });

    // 3. Geometry displacement
    const geomDiff = calculateGeometryDifference(baseline, refined, maxDisplacementMm);
    conditions.push({
      gateCode: 'G7_GEOMETRY_DEVICE',
      applicability: 'applicable',
      result: geomDiff.withinAcceptableBound ? 'pass' : 'fail',
      reasonCodes: geomDiff.withinAcceptableBound
        ? []
        : [`EXCESSIVE_DISPLACEMENT:${geomDiff.value}mm`],
      policyRuleIds: ['RULE_REFINEMENT_DISPLACEMENT'],
      interpretation: geomDiff.withinAcceptableBound
        ? `Displacement ${geomDiff.value}mm within bound (${maxDisplacementMm}mm).`
        : `Displacement ${geomDiff.value}mm exceeds bound (${maxDisplacementMm}mm).`,
    });

    // 4. Incremental Value
    const refGainFeat = refined.rawScientificFeatures.find(
      f => f.code === 'incremental_gain' || f.code === 'circuit_concordance',
    );
    const baseGainFeat = baseline.rawScientificFeatures.find(
      f => f.code === 'incremental_gain' || f.code === 'circuit_concordance',
    );
    const delta = (refGainFeat?.value ?? 0) - (baseGainFeat?.value ?? 0);
    const meaningfulGain = delta >= minGain;

    conditions.push({
      gateCode: 'G9_GENERATOR_CONSTRAINTS',
      applicability: 'applicable',
      result: meaningfulGain ? 'pass' : 'conditional',
      reasonCodes: meaningfulGain ? [] : ['LOW_INCREMENTAL_VALUE'],
      policyRuleIds: ['RULE_REFINEMENT_INCREMENTAL_VALUE'],
      interpretation: meaningfulGain
        ? `Incremental gain +${Math.round(delta * 100)}% exceeds threshold.`
        : `Incremental gain insufficient (+${Math.round(delta * 100)}% vs required ${Math.round(minGain * 100)}%).`,
    });

    const allPassed = conditions.every(c => c.result === 'pass');

    if (allPassed) {
      decisions.push(
        buildRefinementDecision(
          baseline,
          refined,
          'adopted',
          conditions,
          'Refined candidate earns preference over evidence baseline.',
          maxDisplacementMm,
        ),
      );
      preferredCandidates.push(refined.draftId);
    } else {
      decisions.push(
        buildRefinementDecision(
          baseline,
          refined,
          'baseline_retained',
          conditions,
          'Evidence baseline retained; refinement conditions not fully met.',
          maxDisplacementMm,
        ),
      );
      preferredCandidates.push(baseline.draftId);
    }
  }

  return {
    decisions,
    rejectedRefinementCandidateIds: rejectedRefinements,
    preferredCandidateIds: preferredCandidates,
  };
}
