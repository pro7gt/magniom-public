/**
 * @magniom/target-engine - Gate G2: Evidence Path Eligibility
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§20-22)
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG2(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const reasons: string[] = [];
  const mode = context.request.mode;
  const permittedPaths = context.permittedEvidencePaths;

  if (!candidate.evidencePathIds || candidate.evidencePathIds.length === 0) {
    reasons.push('CANDIDATE_LACKS_EVIDENCE_PATH');
  } else {
    for (const pathId of candidate.evidencePathIds) {
      const path = permittedPaths.find(p => p.id === pathId);
      if (!path) {
        reasons.push(`EVIDENCE_PATH_NOT_PERMITTED:${pathId}`);
        continue;
      }

      if (mode === 'clinical') {
        if (path.pathStatus !== 'clinical_permitted') {
          reasons.push(`EVIDENCE_PATH_NOT_CLINICAL_PERMITTED:${pathId}`);
        }
      } else if (mode === 'research') {
        // Research may use research_permitted, validation_permitted, clinical_permitted
        if (
          path.pathStatus !== 'clinical_permitted' &&
          path.pathStatus !== 'validation_permitted' &&
          path.pathStatus !== 'research_permitted'
        ) {
          reasons.push(`EVIDENCE_PATH_INVALID_FOR_RESEARCH:${pathId}`);
        }
      }
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G2_EVIDENCE_PATH',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G2_EVIDENCE_PATH_ELIGIBILITY'],
    evidencePathIds: candidate.evidencePathIds,
    interpretation: pass
      ? 'Candidate derives from authorised, mode-compatible evidence paths.'
      : `Evidence path eligibility failure: ${reasons.join(', ')}`,
  };
}
