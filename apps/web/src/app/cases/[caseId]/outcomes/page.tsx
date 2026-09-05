'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function CaseOutcomesPage({ params }: { params: Promise<{ caseId: string }> }) {
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

  if (!record) return <div className="container">Case not found.</div>;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Clinical Outcomes &amp; Longitudinal Symptom Response
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Tracking MADRS, GAD-7, and clinical global impression trajectories across TMS treatment
            sessions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/cases/${caseId}/audit`} className="btn btn-primary">
            View Cryptographic Audit Trail →
          </Link>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Longitudinal Response Trajectory */}
        <div className="card">
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              marginBottom: '0.75rem',
            }}
          >
            Depression Trajectory (MADRS)
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                background: 'var(--bg-surface-elevated)',
                borderRadius: '0.375rem',
              }}
            >
              <span>Baseline (Session 0)</span>
              <strong>34 (Severe)</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                background: 'var(--bg-surface-elevated)',
                borderRadius: '0.375rem',
              }}
            >
              <span>Mid-Treatment (Session 15)</span>
              <strong style={{ color: '#38bdf8' }}>21 (Moderate — 38% reduction)</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem',
                background: 'var(--bg-surface-elevated)',
                borderRadius: '0.375rem',
              }}
            >
              <span>Post-Treatment (Session 30)</span>
              <strong style={{ color: '#34d399' }}>
                11 (Mild / Near Remission — 68% reduction)
              </strong>
            </div>
          </div>
        </div>

        {/* Clinical Response Classification */}
        <div className="card">
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              marginBottom: '0.75rem',
            }}
          >
            Clinical Response Status
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.875rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Outcome Category:</span>
              <div style={{ marginTop: '0.25rem' }}>
                <span className="badge badge-tier1" style={{ fontSize: '0.8125rem' }}>
                  CLINICAL RESPONDER (≥ 50% MADRS Reduction)
                </span>
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>
                Target Engagement Verification:
              </span>
              <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                Concordant with predicted therapeutic circuit engagement on sgACC anti-correlation
                network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
