/**
 * @magniom/target-engine - Candidate Explanations v2
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§119-121)
 */

import type {
  CandidateDraft,
  CandidateExplanationV2,
  ExplanationFact,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function generateCandidateExplanationV2(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): CandidateExplanationV2 {
  const objectiveFacts: ExplanationFact[] = candidate.clinicalObjectiveIds.map(objId => {
    const obj = context.clinicalObjectives.find(o => o.id === objId);
    return {
      code: 'CLINICAL_OBJECTIVE',
      title: obj?.concept.display ?? 'Clinical Objective',
      detail: obj
        ? `Target selected to address ${obj.concept.display}.`
        : `Target selected to address objective ${objId}.`,
    };
  });

  const evidenceFacts: ExplanationFact[] = candidate.evidencePathIds.map(pathId => {
    const path = context.permittedEvidencePaths.find(p => p.id === pathId);
    return {
      code: 'EVIDENCE_PATH',
      title: path ? `Evidence Path: ${path.targetFamilyId}` : 'Evidence Path',
      detail: `Supported by authorized evidence path with status ${path?.pathStatus ?? 'permitted'}.`,
      evidencePathId: pathId,
    };
  });

  const whyNominated: ExplanationFact[] = [
    {
      code: 'NOMINATION_RATIONALE',
      title: 'Nomination Basis',
      detail:
        candidate.nominationRationale ||
        'Target nominated based on canonical therapeutic circuit evidence.',
    },
  ];

  const patientContribution: ExplanationFact[] = [];
  if (candidate.proposedRole === 'connectome_refinement') {
    patientContribution.push({
      code: 'CONNECTOME_REFINEMENT',
      title: 'Patient-Specific Functional Localisation',
      detail:
        'Individual rs-fMRI connectome analysis localized peak circuit anti-correlation within cortical bounds.',
    });
  } else {
    patientContribution.push({
      code: 'EVIDENCE_ANCHOR',
      title: 'Normative Evidence Anchor',
      detail:
        'Target represents population-level evidence anchor; individual measurements not applied to shift coordinate.',
    });
  }

  const limitations = [...candidate.generatorLimitations];
  if (limitations.length === 0) {
    limitations.push('Target location subject to empirical inter-individual anatomical variance.');
  }

  return {
    shortSummary: `${candidate.proposedRole} targeting ${candidate.targetFamilyId}`,
    clinicalObjective: objectiveFacts,
    evidenceBasis: evidenceFacts,
    whyNominated,
    patientSpecificContribution: patientContribution,
    limitationsAndConflicts: limitations,
  };
}
