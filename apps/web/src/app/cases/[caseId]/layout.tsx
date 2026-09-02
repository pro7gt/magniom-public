'use client';

import React, { use, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { caseStore } from '../../../lib/case-store';
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
  }, [caseId, pathname]);

  if (!record) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Case Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Case ID {caseId} does not exist in the active case store.
        </p>
      </div>
    );
  }

  // Determine current active workflow stage from path
  let activeStage: WorkflowStage = 'overview';
  if (pathname.includes('/assessment')) activeStage = 'assessment';
  else if (pathname.includes('/phenotype')) activeStage = 'phenotype';
  else if (pathname.includes('/imaging')) activeStage = 'imaging';
  else if (pathname.includes('/connectome')) activeStage = 'connectome';
  else if (pathname.includes('/targets')) activeStage = 'targets';
  else if (pathname.includes('/compare')) activeStage = 'compare';
  else if (pathname.includes('/decision')) activeStage = 'decision';
  else if (pathname.includes('/audit')) activeStage = 'audit';

  const isPhenotypeApproved = Boolean(
    record.phenotype.confirmedByClinicianId && record.phenotype.snapshotHash,
  );
  const isDecisionSigned = Boolean(record.decision?.isImmutable);
  const isConnectomeQualified = record.slate?.personalisationQualification === 'qualified';
  const isSlateReady = Boolean(record.slate?.primaryCandidates?.length && !record.isStale);

  const mode: EnvironmentMode =
    record.clinicalCase.mode === 'RESEARCH'
      ? 'RESEARCH'
      : record.clinicalCase.mode === 'VALIDATION'
        ? 'VALIDATION'
        : 'CLINICAL';

  return (
    <div className="case-workspace-layout">
      {/* Persistent Case Status Header (§41–50) */}
      <CaseHeader
        caseCode={record.clinicalCase.caseCode}
        patientDisplayLabel={`Patient ${record.clinicalCase.patientId}`}
        indication={record.clinicalCase.indicationCode}
        mode={mode}
        caseState={record.clinicalCase.state}
        isPhenotypeApproved={isPhenotypeApproved}
        isConnectomeQualified={isConnectomeQualified}
        isSlateReady={isSlateReady}
        isDecisionSigned={isDecisionSigned}
        isStale={record.isStale}
        staleReason={record.staleReason}
        onRefreshSlate={() => {
          caseStore.setStaleness(caseId, false);
          setRecord({ ...record, isStale: false, staleReason: undefined });
        }}
      />

      {/* State-Driven Workflow Rail (§54, 55, 56) */}
      <WorkflowRail
        caseId={caseId}
        activeStage={activeStage}
        caseState={record.clinicalCase.state}
        isPhenotypeApproved={isPhenotypeApproved}
        isDecisionSigned={isDecisionSigned}
      />

      {/* Main Reasoning Canvas */}
      <div className="case-canvas-body">{children}</div>
    </div>
  );
}
