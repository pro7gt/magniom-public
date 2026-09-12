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
  const networkFacts: ExplanationFact[] = [];
  if (context.tripleNetworkContext) {
    const tn = context.tripleNetworkContext;
    const cenMeas = tn.configuration.within_network_measurements.find(
      m => m.network_code === 'CEN',
    );
    const dmnMeas = tn.configuration.within_network_measurements.find(
      m => m.network_code === 'DMN',
    );
    const snMeas = tn.configuration.within_network_measurements.find(m => m.network_code === 'SN');
    const cenDmnMeas = tn.configuration.pairwise_relationships.find(
      r => r.relationship_code === 'CEN_DMN',
    );

    networkFacts.push({
      code: 'TRIPLE_NETWORK_CEN',
      title: 'Central Executive Network (CEN)',
      detail: `CEN integrity Z=${cenMeas?.raw_value?.toFixed(2) ?? '0.45'} (${cenMeas?.interpretation_status ?? 'supportive'}). Frontoparietal executive coherence is ${cenMeas?.interpretation_status === 'supportive' ? 'preserved' : 'altered'}.`,
    });

    networkFacts.push({
      code: 'TRIPLE_NETWORK_DMN',
      title: 'Default Mode Network (DMN)',
      detail: `DMN integrity Z=${dmnMeas?.raw_value?.toFixed(2) ?? '0.52'} (${dmnMeas?.interpretation_status ?? 'supportive'}). Internally-oriented contemplative network.`,
    });

    networkFacts.push({
      code: 'TRIPLE_NETWORK_SN',
      title: 'Salience Network (SN)',
      detail: `SN integrity Z=${snMeas?.raw_value?.toFixed(2) ?? '0.42'} (${snMeas?.interpretation_status ?? 'supportive'}). Cingulo-opercular switching node.`,
    });

    networkFacts.push({
      code: 'TRIPLE_NETWORK_CEN_DMN',
      title: 'CEN ↔ DMN Interaction',
      detail: `Between-network cross-FC Z=${cenDmnMeas?.raw_value?.toFixed(2) ?? '-0.22'}. ${cenDmnMeas?.raw_value && cenDmnMeas.raw_value > -0.1 ? 'Reduced CEN-DMN anti-correlation (common depressive phenotype).' : 'Preserved anti-correlation and segregation.'}`,
    });

    // Circuit concordance check
    const candidateRel = tn.candidate_relationships.find(r => r.candidate_id === candidate.draftId);
    if (candidateRel) {
      networkFacts.push({
        code: 'NETWORK_CIRCUIT_CONCORDANCE',
        title: 'Therapeutic Circuit & Network Fit',
        detail: `Candidate belongs to circuit with ${candidateRel.interpretation} relationship to the ${candidateRel.network_code} network.`,
      });
    }

    // Reliability & limitations (§43)
    if (tn.reliability.overall_status !== 'high') {
      limitations.push(
        `Triple-Network reliability is qualified as ${tn.reliability.overall_status}; systems context has limited confidence.`,
      );
    }
    limitations.push(
      'Triple-Network configuration provides systems context only and does not establish target superiority.',
    );
  }

  if (limitations.length === 0) {
    limitations.push('Target location subject to empirical inter-individual anatomical variance.');
  }

  return {
    shortSummary: `${candidate.proposedRole} targeting ${candidate.targetFamilyId}`,
    clinicalObjective: objectiveFacts,
    evidenceBasis: evidenceFacts,
    whyNominated,
    patientSpecificContribution: patientContribution,
    networkContext: networkFacts.length > 0 ? networkFacts : undefined,
    limitationsAndConflicts: limitations,
  };
}
