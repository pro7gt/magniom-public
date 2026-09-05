'use client';

import { use } from 'react';
import { redirect } from 'next/navigation';
import { caseStore } from '../../../../../../lib/case-store';

// ==========================================
// CaseIndication-Scoped Compare Route (§193)
// ==========================================

export default function CaseIndicationComparePage({
  params,
}: {
  params: Promise<{ caseId: string; caseIndicationId: string }>;
}) {
  const { caseId, caseIndicationId } = use(params);
  caseStore.switchCaseIndication(caseId, caseIndicationId);
  redirect(`/cases/${caseId}/compare`);
}
