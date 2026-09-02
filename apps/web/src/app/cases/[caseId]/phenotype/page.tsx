'use client';

import React, { use, useState } from 'react';
import { caseStore } from '../../../../lib/case-store';
import { toPhenotypeViewModel } from '@magniom/presentation';
import { PhenotypeWorkspace } from '../../../../components/phenotype-workspace';

export default function PhenotypePage({
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

  const phenotypeVM = toPhenotypeViewModel(record.phenotype);

  const handleApprove = (notes: string) => {
    caseStore.approvePhenotype(caseId, 'clin-specialist-001', notes);
    setRecord(caseStore.getCaseRecord(caseId));
  };

  return (
    <PhenotypeWorkspace
      initialViewModel={phenotypeVM}
      onApprove={handleApprove}
    />
  );
}
