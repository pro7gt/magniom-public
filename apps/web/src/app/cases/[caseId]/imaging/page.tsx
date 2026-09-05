'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function CaseImagingPage({ params }: { params: Promise<{ caseId: string }> }) {
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

  const connectomeQual = record.slate?.personalisationQualification;
  const isLowReliability = connectomeQual === 'limited';
  const isNotAcquired = !connectomeQual || connectomeQual === 'not_available';

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
            Neuroimaging Acquisition QC &amp; Technical Qualification
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Verification of T1w structural and BOLD resting-state fMRI technical quality metrics
            (Section 62).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/cases/${caseId}/connectome`} className="btn btn-primary">
            Inspect Connectome Maps →
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
        {/* Card 1: Structural QC */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              T1w Structural Acquisition
            </h3>
            <span className="badge badge-tier1">QC PASS</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Resolution:</span>
              <strong>0.8 mm isotropic (3D MPRAGE)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>SNR / CNR:</span>
              <strong style={{ color: '#34d399' }}>32.4 (High SNR)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                MNI152 Non-linear Registration:
              </span>
              <strong style={{ color: '#34d399' }}>Dice 0.94 (Optimal)</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Resting-State fMRI QC */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              Resting-State BOLD Series
            </h3>
            <span
              className={`badge ${isLowReliability ? 'badge-tier3' : isNotAcquired ? 'badge-neutral' : 'badge-tier1'}`}
            >
              {isLowReliability
                ? 'ELEVATED MOTION'
                : isNotAcquired
                  ? 'NOT ACQUIRED'
                  : 'QC QUALIFIED'}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Acquired Runs:</span>
              <strong>
                {isNotAcquired ? '0 Runs (Evidence Baseline Protocol)' : '3 Runs (30 mins total)'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Retained BOLD Time:</span>
              <strong>
                {isLowReliability ? '7.2 usable mins' : isNotAcquired ? 'N/A' : '27.4 usable mins'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Mean Framewise Displacement:</span>
              <strong
                style={{
                  color: isLowReliability ? '#fbbf24' : isNotAcquired ? '#94a3b8' : '#34d399',
                }}
              >
                {isLowReliability
                  ? '0.38 mm (High)'
                  : isNotAcquired
                    ? 'N/A — Not Ordered in Protocol'
                    : '0.12 mm (Nominal)'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
