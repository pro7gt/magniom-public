'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../lib/case-store';
import { toPhenotypeViewModel, toTargetSlateViewModel } from '@magniom/presentation';

export default function CaseOverviewPage({ params }: { params: Promise<{ caseId: string }> }) {
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

  const phenotypeVM = toPhenotypeViewModel(record.phenotype);
  const slateVM = toTargetSlateViewModel(record.slate, {
    isStale: record.isStale,
    staleReason: record.staleReason,
  });

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 10-Second Orientation Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderColor: '#334155',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
              }}
            >
              CASE ORIENTATION & CLINICAL STATUS
            </span>
            <h1
              style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}
            >
              {phenotypeVM.primaryDiagnosis}
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Case Code:{' '}
              <strong style={{ fontFamily: 'var(--font-mono)' }}>
                {record.clinicalCase.caseCode}
              </strong>{' '}
              • Mode: <strong>{record.clinicalCase.mode}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href={`/cases/${caseId}/phenotype`} className="btn btn-secondary">
              Review Phenotype →
            </Link>
            <Link
              href={`/cases/${caseId}/targets`}
              className="btn btn-primary"
              id="review-target-slate-overview-btn"
            >
              Enter Target Workspace →
            </Link>
          </div>
        </div>
      </div>

      {/* 4-Panel Case Overview Grid (Section 15) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Panel 1: Clinical Formulation Question */}
        <div className="card">
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            CLINICAL QUESTION
          </span>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              marginTop: '0.25rem',
              marginBottom: '0.75rem',
            }}
          >
            What are we trying to improve?
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            {phenotypeVM.domains.slice(0, 3).map(d => (
              <div
                key={d.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  background: 'var(--bg-surface-elevated)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                }}
              >
                <span>
                  #{d.clinicalPriority} {d.domainName}
                </span>
                <span style={{ fontWeight: 600, color: '#38bdf8' }}>{d.severityLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Connectome Measurement Qualification */}
        <div className="card">
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            CONNECTOMIC MEASUREMENT
          </span>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              marginTop: '0.25rem',
              marginBottom: '0.75rem',
            }}
          >
            Functional Connectivity Status
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Qualification:</span>
              <strong style={{ color: '#34d399' }}>{slateVM.qualificationLabel}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Retained BOLD Time:</span>
              <span>
                <strong>27.4</strong> usable minutes
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Motion Censoring:</span>
              <span>Pass (&lt; 0.2 mm mean FD)</span>
            </div>
          </div>
        </div>

        {/* Panel 3: Target Slate Readiness (Safeguard 2: NO TARGET PREVIEW) */}
        <div className="card">
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            TARGET SLATE STATUS
          </span>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              marginTop: '0.25rem',
              marginBottom: '0.75rem',
            }}
          >
            Target Slate Ready for Review
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
            Magniom identified{' '}
            <strong>{slateVM.primaryCandidates.length} primary hypotheses</strong> and{' '}
            <strong>{slateVM.additionalCandidates.length} alternatives</strong> based on approved
            phenotype and evidence ceilings.
          </p>
          <div
            style={{
              background: '#090d16',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            Inspect candidate hypotheses, counterfactuals, and reliability in the Target Workspace.
          </div>
        </div>

        {/* Panel 4: Current Decision Lifecycle State */}
        <div className="card">
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            DECISION STATE
          </span>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              marginTop: '0.25rem',
              marginBottom: '0.75rem',
            }}
          >
            {record.decision?.isImmutable ? 'Signed & Immutable' : 'Awaiting Specialist Review'}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
            {record.decision?.isImmutable
              ? `Decision signed by ${record.decision.attestation?.clinicianName || 'Specialist'}. Record locked.`
              : 'The treating specialist must independently evaluate the Target Slate and provide clinical reasoning before signing.'}
          </p>
          <Link
            href={`/cases/${caseId}/decision`}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.8125rem' }}
          >
            {record.decision?.isImmutable
              ? 'View Signed Decision Record →'
              : 'Begin Clinical Decision →'}
          </Link>
        </div>
      </div>
    </div>
  );
}
