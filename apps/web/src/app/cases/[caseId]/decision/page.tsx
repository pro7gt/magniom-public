'use client';

import React, { use, useState, useEffect } from 'react';
import { CaseNotFoundState } from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';
import {
  toTargetSlateViewModel,
  toDecisionReviewViewModel,
  type ClinicalActionCapabilities,
} from '@magniom/presentation';
import { DecisionWorkspace } from '../../../../components/decision-workspace';
import type { CandidateDecisionAction, MagniomInfluence, MniCoordinate } from '@magniom/domain';
import { resolveCaseShellContext } from '../../../../lib/shell-authority';
import { validateSignOffPreconditions } from '../../../../lib/security/sign-off-guard';
import { authStore } from '../../../../lib/auth-store';
import { CANONICAL_CLINICAL_SESSION } from '../../../../lib/release-authority';

export default function DecisionPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;
  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
    return caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        setRecord(caseStore.getCaseRecord(caseId));
      }
    });
  }, [caseId]);

  if (!record) {
    return (
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
      </div>
    );
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
    modifiedCoord?: MniCoordinate,
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
    // Runtime Preconditions Check (§139–142, §189)
    const session = authStore.getAuthSession() || CANONICAL_CLINICAL_SESSION;
    const shellVm = resolveCaseShellContext({ caseId });
    if (shellVm) {
      const capabilities: ClinicalActionCapabilities = {
        ...shellVm.moduleAuthority.capabilities,
        may_sign_target_decision: Boolean(session.user.hasSigningAuthority),
      };
      const validation = validateSignOffPreconditions(shellVm, capabilities);
      if (!validation.canSign) {
        throw new Error(
          `MAG-SEC-022 Safety Violation: Decision signing blocked: ${validation.blockedReasons.join('; ')}`,
        );
      }
    }

    caseStore.signDecision({
      caseId,
      overallReasoning: params.overallReasoning,
      magniomInfluence: params.magniomInfluence,
      disagreementWithMagniom: params.disagreementWithMagniom,
      clinicianName: session.user.displayName,
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
      caseCode={record.clinicalCase.caseCode}
      slateVM={slateVM}
      existingDecisionVM={decisionVM}
      onSignDecision={handleSign}
      onSaveCandidateDecision={handleSaveCandidateDecision}
      onCreateRevisedDecision={handleCreateRevised}
    />
  );
}
