'use client';

import React, { use, useState } from 'react';
import { caseStore } from '../../../../lib/case-store';
import {
  toTargetSlateViewModel,
  toDecisionReviewViewModel,
} from '@magniom/presentation';
import { DecisionWorkspace } from '../../../../components/decision-workspace';
import type { CandidateDecisionAction, MagniomInfluence, MniCoordinate } from '@magniom/domain';

export default function DecisionPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;
  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  if (!record) {
    return <div className="container">Case not found.</div>;
  }

  const slateVM = toTargetSlateViewModel(record.slate, {
    isStale: record.isStale,
    staleReason: record.staleReason,
  });

  const decisionVM = record.decision
    ? toDecisionReviewViewModel(record.decision, record.slate)
    : null;

  const handleSaveCandidateDecision = (
    candidateId: string,
    action: CandidateDecisionAction,
    reasonCodes: string[],
    freeTextReason?: string,
    modifiedCoord?: MniCoordinate
  ) => {
    caseStore.saveCandidateDecision(caseId, {
      targetCandidateId: candidateId,
      action,
      reasonCodes,
      ...(freeTextReason ? { freeTextReason } : {}),
      ...(modifiedCoord ? { modifiedTarget: { mniCoordinate: modifiedCoord } } : {}),
      evidenceReviewed: true,
      reliabilityReviewed: true,
      counterargumentsReviewed: true,
    });
    setRecord(caseStore.getCaseRecord(caseId));
  };

  const handleSign = (params: {
    overallReasoning: string;
    magniomInfluence: MagniomInfluence;
    disagreementWithMagniom?: string | undefined;
    clinicianName: string;
    licenseNumber: string;
    attestationStatement: string;
  }) => {
    caseStore.signDecision({
      caseId,
      overallReasoning: params.overallReasoning,
      magniomInfluence: params.magniomInfluence,
      disagreementWithMagniom: params.disagreementWithMagniom,
      clinicianName: params.clinicianName,
      licenseNumber: params.licenseNumber,
      attestationStatement: params.attestationStatement,
    });
    setRecord(caseStore.getCaseRecord(caseId));
  };

  const handleCreateRevised = () => {
    caseStore.createRevisedDecision(caseId);
    setRecord(caseStore.getCaseRecord(caseId));
  };

  return (
    <DecisionWorkspace
      caseId={caseId}
      slateVM={slateVM}
      existingDecisionVM={decisionVM}
      onSignDecision={handleSign}
      onSaveCandidateDecision={handleSaveCandidateDecision}
      onCreateRevisedDecision={handleCreateRevised}
    />
  );
}
