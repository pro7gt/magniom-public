'use client';

import React, { use, useState, useEffect } from 'react';
import { CaseNotFoundState } from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';
import { toPhenotypeViewModel } from '@magniom/presentation';
import { PhenotypeWorkspace } from '../../../../components/phenotype-workspace';

export default function PhenotypePage({ params }: { params: Promise<{ caseId: string }> }) {
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

  const phenotypeVM = toPhenotypeViewModel(record.phenotype);

  const handleApprove = (notes: string) => {
    caseStore.approvePhenotype(caseId, 'clin-specialist-001', notes);
    setRecord(caseStore.getCaseRecord(caseId));
  };

  return (
    <PhenotypeWorkspace
      caseId={caseId}
      caseCode={record.clinicalCase.caseCode}
      initialViewModel={phenotypeVM}
      onApprove={handleApprove}
    />
  );
}
