'use client';

import { use } from 'react';
import { redirect } from 'next/navigation';
import { caseStore } from '../../../../../../lib/case-store';

// ==========================================
// CaseIndication-Scoped Context Route (§193)
// Sets the active indication and redirects to the case context workspace.
// ==========================================

export default function CaseIndicationContextPage({
  params,
}: {
  params: Promise<{ caseId: string; caseIndicationId: string }>;
}) {
  const { caseId, caseIndicationId } = use(params);
  caseStore.switchCaseIndication(caseId, caseIndicationId);
  redirect(`/cases/${caseId}/context`);
}
