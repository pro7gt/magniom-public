'use client';

import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Breadcrumbs,
  CaseNotFoundState,
  LockIcon,
} from '@/components/ui';

import React, { use, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { caseStore } from '../../../../lib/case-store';
import {
  toPhenotypeViewModel,
  toTargetSlateViewModel,
  toConvergenceViewModel,
} from '@magniom/presentation';
import { TargetSlateWorkspace } from '../../../../components/target-slate-workspace';

export default function TargetsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;
  const searchParams = useSearchParams();

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

  // Silent prospective UI enforcement (§221–224, §261):
  // Treating clinicians SHALL NOT see concealed MAGNIOM results before protocol-defined unblinding.
  if (record.isBlindedValidation) {
    return (
      <div className="container page-container-col py-8 px-4">
        <Breadcrumbs
          ariaLabel="Target Slate Breadcrumb"
          items={[
            { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
            { label: 'Target Slate & Candidates', current: true },
          ]}
        />
        <Card className="max-w-2xl my-8 mx-auto text-center p-8 border-subtle">
          <CardHeader>
            <div
              className="inline-flex items-center justify-center mb-4 text-muted"
              aria-hidden="true"
            >
              <LockIcon size={32} />
            </div>
            <div className="inline-flex gap-2 mb-4">
              <Badge variant="tier2">VALIDATION PROTOCOL</Badge>
              <Badge variant="neutral">Silent Prospective</Badge>
            </div>
            <CardTitle as="h1" className="page-title mb-3">
              Target Slate Concealed (Protocol Blinded)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary text-base leading-relaxed mb-6">
              Under active Silent Prospective study governance (§221–224), the MAGNIOM Target Slate
              exists and algorithmic processing is complete, but target candidate specifics are
              concealed from treating clinicians prior to protocol unblinding.
            </p>
            <div className="inline-flex items-center gap-2 bg-surface-elevated py-2 px-4 rounded-md text-sm text-muted">
              <span>Status:</span>
              <strong className="text-cyan">MAGNIOM study processing · Complete</strong>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const phenotypeVM = toPhenotypeViewModel(record.phenotype);
  const slateVM = toTargetSlateViewModel(record.slate, {
    isStale: record.isStale,
    staleReason: record.staleReason,
  });
  const convergenceVM = toConvergenceViewModel(record.slate.primaryCandidates);

  const initialTarget = searchParams.get('target') || undefined;
  const initialEvidence = searchParams.get('evidence') || undefined;

  return (
    <TargetSlateWorkspace
      caseId={caseId}
      caseCode={record.clinicalCase.caseCode}
      phenotypeVM={phenotypeVM}
      slateVM={slateVM}
      slate={record.slate}
      convergenceVM={convergenceVM}
      initialSelectedCandidateId={initialTarget}
      initialEvidenceCandidateId={initialEvidence}
    />
  );
}
