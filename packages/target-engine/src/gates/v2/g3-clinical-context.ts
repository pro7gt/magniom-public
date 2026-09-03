/**
 * @magniom/target-engine - Gate G3: Clinical Context Applicability
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§23)
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG3(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const reasons: string[] = [];

  // Check Clinical Objectives overlap
  const requestedObjectives = context.request.clinicalObjectiveIds;
  if (requestedObjectives && requestedObjectives.length > 0) {
    const candidateObjectives = candidate.clinicalObjectiveIds ?? [];
    const hasOverlap = candidateObjectives.some(objId => requestedObjectives.includes(objId));
    if (!hasOverlap && candidateObjectives.length > 0) {
      reasons.push('CLINICAL_OBJECTIVE_MISMATCH');
    }
  }

  // Check Disease Stage compatibility if specified
  if (context.diseaseStageContext) {
    // If candidate evidence paths require specific stage, check
    const paths = context.permittedEvidencePaths.filter(p =>
      candidate.evidencePathIds.includes(p.id),
    );
    for (const path of paths) {
      if (path.diseaseStageId && path.diseaseStageId !== context.diseaseStageContext.id) {
        reasons.push(`DISEASE_STAGE_MISMATCH:${path.diseaseStageId}`);
      }
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G3_CLINICAL_CONTEXT',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G3_CLINICAL_CONTEXT_APPLICABILITY'],
    interpretation: pass
      ? 'Candidate matches case clinical objectives and disease stage.'
      : `Clinical context applicability failure: ${reasons.join(', ')}`,
  };
}
