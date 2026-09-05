'use client';

import React, { use, useState, useEffect } from 'react';
import { caseStore } from '../../../../lib/case-store';
import {
  toComparisonTableViewModel,
  toConvergenceViewModel,
  toClinical3DViewerViewModel,
} from '@magniom/presentation';
import { TargetComparison } from '../../../../components/target-comparison';

export default function ComparePage({ params }: { params: Promise<{ caseId: string }> }) {
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
    return <div className="container">Case not found.</div>;
  }

  const allCandidates = [...record.slate.primaryCandidates, ...record.slate.additionalCandidates];
  const tableVM = toComparisonTableViewModel(allCandidates);
  const convergenceVM = toConvergenceViewModel(record.slate.primaryCandidates);
  const clinical3dVM = toClinical3DViewerViewModel(record.slate, allCandidates);

  return (
    <TargetComparison
      caseId={caseId}
      tableViewModel={tableVM}
      convergenceViewModel={convergenceVM}
      comparison3D={clinical3dVM.comparison3D}
    />
  );
}
