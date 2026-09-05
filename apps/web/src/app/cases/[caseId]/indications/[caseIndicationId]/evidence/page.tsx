'use client';

import { use } from 'react';
import { redirect } from 'next/navigation';
import { caseStore } from '../../../../../../lib/case-store';

// ==========================================
// CaseIndication-Scoped Evidence Route (§193)
// ==========================================

export default function CaseIndicationEvidencePage({
  params,
}: {
  params: Promise<{ caseId: string; caseIndicationId: string }>;
}) {
  const { caseId, caseIndicationId } = use(params);
  caseStore.switchCaseIndication(caseId, caseIndicationId);
  redirect(`/cases/${caseId}/evidence`);
}
