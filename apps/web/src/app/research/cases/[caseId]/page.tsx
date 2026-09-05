'use client';

import { use } from 'react';
import { redirect } from 'next/navigation';

// ==========================================
// Research Case Detail (§195)
// Redirects into the case workspace with Research context enforcement.
// The case layout detects Research mode from the case record.
// ==========================================

export default function ResearchCaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = use(params);
  redirect(`/cases/${resolvedParams.caseId}`);
}
