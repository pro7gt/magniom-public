'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function CaseTreatmentPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;
  const record = caseStore.getCaseRecord(caseId);

  if (!record) return <div className="container">Case not found.</div>;

  const isSigned = Boolean(record.decision?.isImmutable);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            TMS Treatment Prescription &amp; Neuronavigation Plan
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Protocol dosing parameters, coil angle orientations, and neuronavigation export package.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/cases/${caseId}/decision`} className="btn btn-secondary">
            ← Decision Record
          </Link>
          <Link href={`/cases/${caseId}/outcomes`} className="btn btn-primary">
            Clinical Outcomes →
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Prescription Parameters */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
            TMS Protocol Specification
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Protocol Paradigm:</span>
              <strong>Intermittent Theta Burst (iTBS) / 10 Hz rTMS</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Stimulation Intensity:</span>
              <strong>120% Resting Motor Threshold (rMT)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Pulses per Session:</span>
              <strong>1,800 Pulses (600 iTBS x 3 trains)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Planned Sessions:</span>
              <strong>30 Sessions (6 weeks)</strong>
            </div>
          </div>
        </div>

        {/* Neuronavigation Export */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
            Neuronavigation Export Package
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
            {isSigned
              ? 'Signed clinical target coordinate sealed with SHA-256 attestation. Ready for Brainsight / Localite / Nexstim export.'
              : 'Target coordinates are provisional until clinical decision is formally signed and sealed.'}
          </p>
          <button
            className={`btn ${isSigned ? 'btn-primary' : 'btn-secondary'}`}
            disabled={!isSigned}
            style={{ width: '100%', fontSize: '0.8125rem' }}
          >
            {isSigned ? '📥 Export DICOM / Neuronavigation XML' : '🔒 Signing Required for Clinical Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
