/**
 * @magniom/target-engine - Gate G14: Research Leakage Prevention
 * Conforms to MAGNIOM Target Engine & Ranking Algorithm Specification v2.1 (§40)
 *
 * Enforces hermetic isolation: exploratory features, dynamic functional connectivity,
 * and unvalidated research algorithms strictly fail closed in Clinical Mode.
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG14(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const reasons: string[] = [];
  const isClinical = context.request.mode.toLowerCase() === 'clinical';

  if (isClinical) {
    // 1. Check if candidate proposed role is research hypothesis
    if (candidate.proposedRole === 'research_hypothesis') {
      reasons.push('TN-012:RESEARCH_CANDIDATE_PROHIBITED_IN_CLINICAL_MODE');
    }

    // 2. Check if candidate has synthetic data origin or synthetic limitations
    if (
      candidate.dataOrigin === 'synthetic' ||
      candidate.generatorLimitations?.includes('SYNTHETIC_DEMONSTRATOR') ||
      candidate.generatorLimitations?.includes('SYNTHETIC_GENERATOR_FAIL_CLOSED')
    ) {
      reasons.push('TN-014:SYNTHETIC_CANDIDATE_PROHIBITED_IN_CLINICAL_MODE');
    }

    // 3. Check if candidate relies on synthetic measurements
    const reliedMeasurementIds = candidate.reliedOnMeasurementIds ?? [];
    const reliedMeasurements = context.measurementBundle.measurements.filter(m =>
      reliedMeasurementIds.includes(m.measurementId),
    );
    if (
      context.measurementBundle.dataOrigin === 'synthetic' ||
      reliedMeasurements.some(m => m.dataOrigin === 'synthetic')
    ) {
      reasons.push('TN-014:SYNTHETIC_MEASUREMENT_LEAKAGE_IN_CLINICAL_MODE');
    }

    // 4. Check if relying on research-only features (dynamic FC, normative pathway models, unvalidated ML)
    if (candidate.generatorLimitations?.includes('DYNAMIC_FC_RESEARCH_ONLY')) {
      reasons.push('TN-012:DYNAMIC_FC_PROHIBITED_IN_CLINICAL_MODE');
    }

    if (
      candidate.generatorLimitations?.includes('NORMATIVE_PATHWAY_RESEARCH_ONLY') ||
      candidate.generatorTrace?.algorithmCode === 'MDD_NORMATIVE_PATHWAY_GENERATOR'
    ) {
      reasons.push('TN-012:NORMATIVE_PATHWAY_PROHIBITED_IN_CLINICAL_MODE');
    }

    // 5. Check if relying on experimental unvalidated ML predictions
    if (candidate.generatorLimitations?.includes('UNVALIDATED_ML_MODEL')) {
      reasons.push('TN-012:UNVALIDATED_ML_PREDICTION_PROHIBITED_IN_CLINICAL_MODE');
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G14_RESEARCH_LEAKAGE_PREVENTION',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G14_HERMETIC_RESEARCH_ISOLATION'],
    interpretation: pass
      ? 'Candidate passes hermetic research isolation; zero clinical leakage detected.'
      : `Research leakage prevention failure: ${reasons.join(', ')}`,
  };
}
