/**
 * @magniom/target-engine - Gate G12: Personalisation Authority
 * Conforms to MAGNIOM Target Engine & Ranking Algorithm Specification v2.1 (§38)
 *
 * Enforces that patient-specific connectomic or physiological refinement must earn
 * authority before displacing an evidence-based canonical baseline target.
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG12(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const reasons: string[] = [];

  // Only applies to personalised/refined candidates
  const isRefined =
    candidate.proposedRole === 'P3' ||
    candidate.proposedRole === 'P3_personalised_refinement' ||
    candidate.proposedRole === 'connectome_refinement' ||
    Boolean(candidate.lineage?.baselineCandidateDraftId);

  if (!isRefined) {
    return {
      gateCode: 'G12_PERSONALISATION_AUTHORITY',
      applicability: 'applicable',
      result: 'pass',
      reasonCodes: [],
      policyRuleIds: ['RULE_G12_PERSONALISATION_AUTHORITY'],
      interpretation:
        'Standard evidence-anchored candidate; personalisation authority check passed.',
    };
  }

  // 1. Personalised candidate MUST declare a baseline candidate
  if (!candidate.lineage?.baselineCandidateDraftId) {
    reasons.push('MISSING_DECLARED_BASELINE:refinement_must_declare_counterfactual_baseline');
  }

  // 2. Personalisation requires qualified measurement reliability
  if (context.reliabilityBundle) {
    if (context.reliabilityBundle.overallQualification === 'not_qualified') {
      reasons.push('UNQUALIFIED_MEASUREMENT_RELIABILITY_FOR_PERSONALISATION:not_qualified');
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G12_PERSONALISATION_AUTHORITY',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G12_PERSONALISATION_AUTHORITY'],
    interpretation: pass
      ? 'Patient-specific refinement earned clinical authority with valid baseline and reliability.'
      : `Personalisation authority failure: ${reasons.join(', ')}`,
  };
}
