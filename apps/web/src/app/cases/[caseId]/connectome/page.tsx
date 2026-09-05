'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { caseStore } from '../../../../lib/case-store';

export default function CaseConnectomePage({ params }: { params: Promise<{ caseId: string }> }) {
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
            Functional Connectome &amp; Therapeutic Circuit Concordance
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Patient-specific seed-to-voxel functional connectivity maps and spatial test-retest
            reliability regions (Section 63).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/cases/${caseId}/targets`} className="btn btn-primary">
            Enter Target Slate Workspace →
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
        {/* sgACC Circuit Anti-Correlation */}
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
              sgACC Anti-Correlation (BA25 Seed)
            </h3>
            <span className={`badge ${isNotAcquired ? 'badge-neutral' : 'badge-tier1'}`}>
              {isNotAcquired ? 'BASELINE EVIDENCE' : 'TC-MDD-CONVERGENT-001'}
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
            {isNotAcquired
              ? 'Resting-state BOLD series not acquired for this case. Using normative evidence baseline target coordinates.'
              : 'Resting-state BOLD time series correlation with bilateral subgenual anterior cingulate cortex seed (MNI ±6, 24, -11).'}
          </p>
          <div
            style={{
              background: '#090d16',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Target Center Focus:</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                (-42.4, +43.8, +29.2) MNI
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Correlation Status:</span>
              <strong style={{ color: isNotAcquired ? 'var(--text-secondary)' : '#34d399' }}>
                {isNotAcquired ? 'Normative Baseline (r = -0.38)' : 'Patient Specific (r = -0.42)'}
              </strong>
            </div>
          </div>
        </div>

        {/* Spatial Reliability Region */}
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
              Spatial Test-Retest Reliability Region
            </h3>
            <span
              className={`badge ${isLowReliability ? 'badge-tier3' : isNotAcquired ? 'badge-neutral' : 'badge-tier1'}`}
            >
              {isLowReliability
                ? 'Low Reliability'
                : isNotAcquired
                  ? 'Not Acquired / Baseline Evidence'
                  : 'High Consistency'}
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
            {isNotAcquired
              ? 'Normative cohort reproducibility boundary from validated multicenter clinical trials.'
              : 'Split-half and cross-run spatial variance of the peak connectivity coordinates.'}
          </p>
          <div
            style={{
              background: '#090d16',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimated Dispersion Radius:</span>
              <strong>
                {isLowReliability
                  ? '± 11.4 mm'
                  : isNotAcquired
                    ? 'N/A (Structural Baseline)'
                    : '± 5.8 mm'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Figure-8 Coil Margin:</span>
              <strong
                style={{
                  color: isLowReliability ? '#fbbf24' : isNotAcquired ? '#94a3b8' : '#34d399',
                }}
              >
                {isLowReliability
                  ? 'Exceeds coil focal zone'
                  : isNotAcquired
                    ? 'Preserved Evidence Boundary'
                    : 'Within ~20mm FWHM E-field'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
