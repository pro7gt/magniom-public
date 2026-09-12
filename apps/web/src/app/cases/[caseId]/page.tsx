'use client';

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Breadcrumbs,
  CaseNotFoundState,
  ArrowRightIcon,
  PageHeader,
} from '@/components/ui';

import React, { use, useState, useEffect } from 'react';
import { caseStore } from '../../../lib/case-store';
import { toPhenotypeViewModel, toTargetSlateViewModel } from '@magniom/presentation';

export default function CaseOverviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;
  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
    const unsubscribe = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        setRecord(caseStore.getCaseRecord(caseId));
      }
    });
    return () => unsubscribe();
  }, [caseId]);

  if (!record) {
    return (
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
      </div>
    );
  }

  const phenotypeVM = toPhenotypeViewModel(record.phenotype);
  const slateVM = toTargetSlateViewModel(record.slate, {
    isStale: record.isStale,
    staleReason: record.staleReason,
  });

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Case Overview Breadcrumb"
        items={[
          { label: 'Cases', href: '/cases' },
          { label: record.clinicalCase.caseCode, current: true },
        ]}
      />

      {/* 10-Second Orientation Banner */}
      <Card>
        <CardContent>
          <PageHeader
            eyebrow={
              <span className="text-xs font-semibold text-cyan uppercase">
                CASE ORIENTATION & CLINICAL STATUS
              </span>
            }
            title={phenotypeVM.primaryDiagnosis}
            subtitle={
              <>
                Case Code: <strong className="font-mono">{record.clinicalCase.caseCode}</strong> •
                Mode: <strong>{record.clinicalCase.mode}</strong>
              </>
            }
            actions={
              <div className="flex gap-3">
                <Button variant="secondary" href={`/cases/${caseId}/phenotype`}>
                  Review Phenotype <ArrowRightIcon size={14} className="ml-1 inline" />
                </Button>
                <Button
                  variant="primary"
                  href={`/cases/${caseId}/targets`}
                  id="review-target-slate-overview-btn"
                >
                  Enter Target Workspace <ArrowRightIcon size={14} className="ml-1 inline" />
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* 4-Panel Case Overview Grid (Section 15) */}
      <div className="stat-card-grid">
        {/* Panel 1: Clinical Formulation Question */}
        <Card>
          <CardHeader>
            <span className="text-xs font-semibold text-secondary uppercase">
              CLINICAL QUESTION
            </span>
            <CardTitle as="h2">What are we trying to improve?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              {phenotypeVM.domains.slice(0, 3).map(d => (
                <div key={d.id} className="flex justify-between p-2 rounded bg-surface-elevated">
                  <span>
                    #{d.clinicalPriority} {d.domainName}
                  </span>
                  <span className="font-semibold text-cyan">{d.severityLabel}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Panel 2: Connectome Measurement Qualification */}
        <Card>
          <CardHeader>
            <span className="text-xs font-semibold text-secondary uppercase">
              CONNECTOMIC MEASUREMENT
            </span>
            <CardTitle as="h2">Functional Connectivity Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Qualification:</span>
                <strong className="text-emerald">{slateVM.qualificationLabel}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Retained BOLD Time:</span>
                <span>
                  <strong>27.4</strong> usable minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Motion Censoring:</span>
                <span>Pass (&lt; 0.2 mm mean FD)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel 3: Target Slate Readiness (Safeguard 2: NO TARGET PREVIEW) */}
        <Card>
          <CardHeader>
            <span className="text-xs font-semibold text-secondary uppercase">
              TARGET SLATE STATUS
            </span>
            <CardTitle as="h2">Target Slate Ready for Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary mb-3">
              Magniom identified{' '}
              <strong>{slateVM.primaryCandidates.length} primary hypotheses</strong> and{' '}
              <strong>{slateVM.additionalCandidates.length} alternatives</strong> based on approved
              phenotype and evidence ceilings.
            </p>
            <div className="p-2 rounded text-xs text-muted bg-primary">
              Inspect candidate hypotheses, counterfactuals, and reliability in the Target
              Workspace.
            </div>
          </CardContent>
        </Card>

        {/* Panel 4: Current Decision Lifecycle State */}
        <Card>
          <CardHeader>
            <span className="text-xs font-semibold text-secondary uppercase">DECISION STATE</span>
            <CardTitle as="h2">
              {record.decision?.isImmutable ? 'Signed & Immutable' : 'Awaiting Specialist Review'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary mb-3">
              {record.decision?.isImmutable
                ? `Decision signed by ${record.decision.attestation?.clinicianName || 'Specialist'}. Record locked.`
                : 'The treating specialist must independently evaluate the Target Slate and provide clinical reasoning before signing.'}
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="secondary"
              href={`/cases/${caseId}/decision`}
              className="w-full text-sm"
            >
              {record.decision?.isImmutable ? (
                <>
                  View Signed Decision Record <ArrowRightIcon size={14} className="ml-1 inline" />
                </>
              ) : (
                <>
                  Begin Clinical Decision <ArrowRightIcon size={14} className="ml-1 inline" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
