'use client';

import React, { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { caseStore } from '../../../../lib/case-store';
import {
  toPhenotypeViewModel,
  toTargetSlateViewModel,
  toConvergenceViewModel,
} from '@magniom/presentation';
import { TargetSlateWorkspace } from '../../../../components/target-slate-workspace';

export default function TargetsPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;
  const searchParams = useSearchParams();

  const record = caseStore.getCaseRecord(caseId);

  if (!record) {
    return <div className="container">Case not found.</div>;
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
      phenotypeVM={phenotypeVM}
      slateVM={slateVM}
      slate={record.slate}
      convergenceVM={convergenceVM}
      initialSelectedCandidateId={initialTarget}
      initialEvidenceCandidateId={initialEvidence}
    />
  );
}
