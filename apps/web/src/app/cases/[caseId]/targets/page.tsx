'use client';

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
    return <div className="container">Case not found.</div>;
  }

  // Silent prospective UI enforcement (§221–224, §261):
  // Treating clinicians SHALL NOT see concealed MAGNIOM results before protocol-defined unblinding.
  if (record.isBlindedValidation) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div
          className="card"
          style={{
            maxWidth: '720px',
            margin: '2rem auto',
            textAlign: 'center',
            padding: '3rem 2rem',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }} aria-hidden="true">
            🔒
          </div>
          <div style={{ display: 'inline-flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className="badge badge-tier2">VALIDATION PROTOCOL</span>
            <span className="badge badge-neutral">Silent Prospective</span>
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '0.75rem',
            }}
          >
            Target Slate Concealed (Protocol Blinded)
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            Under active Silent Prospective study governance (§221–224), the MAGNIOM Target Slate
            exists and algorithmic processing is complete, but target candidate specifics are
            concealed from treating clinicians prior to protocol unblinding.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.04)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            <span>Status:</span>
            <strong style={{ color: 'var(--accent-cyan)' }}>
              MAGNIOM study processing · Complete
            </strong>
          </div>
        </div>
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
      phenotypeVM={phenotypeVM}
      slateVM={slateVM}
      slate={record.slate}
      convergenceVM={convergenceVM}
      initialSelectedCandidateId={initialTarget}
      initialEvidenceCandidateId={initialEvidence}
    />
  );
}
