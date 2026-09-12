'use client';

import React, { use, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CaseNotFoundState } from '@/components/ui';
import { caseStore, onMultiTabInvalidation } from '../../../lib/case-store';
import { resolveCaseShellContext } from '../../../lib/shell-authority';
import { CaseHeader } from '../../../components/case-header';
import { WorkflowRail, WorkflowStage } from '../../../components/workflow-rail';
import type { EnvironmentMode } from '@magniom/presentation';

export default function CaseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;
  const pathname = usePathname();

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
    const unsubStore = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        setRecord(caseStore.getCaseRecord(caseId));
      }
    });
    const unsubTab = onMultiTabInvalidation(event => {
      if (event.caseId === caseId) {
        setRecord(caseStore.getCaseRecord(caseId));
      }
    });
    return () => {
      unsubStore();
      unsubTab();
    };
  }, [caseId, pathname]);

  if (!record) {
    return (
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
      </div>
    );
  }

  // Resolve authoritative v2 shell view model (§187, §235)
  const shellVm = resolveCaseShellContext({
    caseId,
    activePath: pathname,
  });

  // Determine current active workflow stage from path
  let activeStage: WorkflowStage = 'overview';
  if (pathname.includes('/targets')) activeStage = 'targets';
  else if (pathname.includes('/compare')) activeStage = 'compare';
  else if (pathname.includes('/decision')) activeStage = 'decision';
  else if (pathname.includes('/audit')) activeStage = 'audit';
  else if (
    pathname.includes('/imaging') ||
    pathname.includes('/measurements') ||
    pathname.includes('/connectome')
  )
    activeStage = 'imaging';
  else if (
    pathname.includes('/phenotype') ||
    pathname.includes('/context') ||
    pathname.includes('/assessment') ||
    pathname.includes('/objective') ||
    pathname.includes('/body-region') ||
    pathname.includes('/impairment') ||
    pathname.includes('/stage') ||
    pathname.includes('/lesion') ||
    pathname.includes('/slt-context') ||
    pathname.includes('/provocation-context') ||
    pathname.includes('/cue-context') ||
    pathname.includes('/trauma-context') ||
    pathname.includes('/treatment')
  )
    activeStage = 'phenotype';
  else if (pathname.includes('/evidence') && !pathname.includes('/indications'))
    activeStage = 'overview'; // Evidence doesn't have its own workflow step; highlight overview

  const isPhenotypeApproved = Boolean(
    record.phenotype.state === 'approved' ||
    (record.phenotype.confirmedByClinicianId && record.phenotype.snapshotHash),
  );
  const isDecisionSigned = Boolean(record.decision?.isImmutable);
  const isConnectomeQualified = record.slate?.personalisationQualification === 'qualified';
  const isSlateReady = Boolean(
    (record.slate?.primaryCandidates && record.slate.primaryCandidates.length > 0) ||
    record.clinicalCase?.currentTargetSlateId,
  );

  const mode: EnvironmentMode =
    record.clinicalCase.mode === 'RESEARCH'
      ? 'RESEARCH'
      : record.clinicalCase.mode === 'VALIDATION'
        ? 'VALIDATION'
        : 'CLINICAL';

  return (
    <div className="case-workspace-layout">
      {/* Persistent Case Status Header (§58–82) */}
      <CaseHeader
        caseCode={record.clinicalCase.caseCode}
        patientDisplayLabel={`Patient ${record.clinicalCase.patientId}`}
        indication={record.clinicalCase.indicationCode}
        mode={mode}
        caseState={record.clinicalCase.state}
        shellVm={shellVm || undefined}
        availableIndications={record.availableIndications}
        onSwitchIndication={targetCaseIndicationId => {
          caseStore.switchCaseIndication(caseId, targetCaseIndicationId);
          setRecord({ ...caseStore.getCaseRecord(caseId)! });
        }}
        isPhenotypeApproved={isPhenotypeApproved}
        isConnectomeQualified={isConnectomeQualified}
        connectomeQualification={record.slate?.personalisationQualification}
        isSlateReady={isSlateReady}
        isDecisionSigned={isDecisionSigned}
        isStale={record.isStale}
        staleReason={record.staleReason}
        onRefreshSlate={() => {
          caseStore.setStaleness(caseId, false);
          setRecord({ ...caseStore.getCaseRecord(caseId)! });
        }}
      />

      {/* State-Driven Dynamic Workflow Rail (§83–87) */}
      <WorkflowRail
        caseId={caseId}
        activeStage={activeStage}
        caseState={record.clinicalCase.state}
        isPhenotypeApproved={isPhenotypeApproved}
        isDecisionSigned={isDecisionSigned}
        workflow={shellVm?.workflow}
      />

      {/* Main Reasoning Canvas */}
      <div className="case-canvas-body">{children}</div>
    </div>
  );
}
